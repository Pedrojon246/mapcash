import { NextResponse } from 'next/server'

interface Indicator {
  name: string
  value: string
  date: string
  description: string
  trend: 'up' | 'down' | 'stable'
}

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
}

async function fetchBCB(serieId: number): Promise<{ valor: string; data: string } | null> {
  try {
    const res = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieId}/dados/ultimos/2?formato=json`,
      { next: { revalidate: 3600 } } // cache 1h
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.[data.length - 1] || null
  } catch {
    return null
  }
}

async function fetchRSS(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://rss.infomoney.com.br/top-news/', {
      next: { revalidate: 1800 }, // cache 30min
      headers: { 'User-Agent': 'MapCash/1.0' }
    })
    if (!res.ok) return []
    const text = await res.text()

    // Parse RSS XML
    const items: NewsItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(text)) !== null && items.length < 8) {
      const item = match[1]
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        || item.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
        || item.match(/<guid>(.*?)<\/guid>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        || item.match(/<description>(.*?)<\/description>/)?.[1] || ''

      if (title) {
        items.push({
          title: title.trim(),
          link: link.trim(),
          pubDate: pubDate.trim(),
          description: desc.replace(/<[^>]+>/g, '').trim().slice(0, 150),
        })
      }
    }
    return items
  } catch {
    return []
  }
}

function formatPubDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000)
    if (diffH < 1) return 'Agora há pouco'
    if (diffH < 24) return `há ${diffH}h`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  } catch {
    return dateStr
  }
}

export async function GET() {
  // Fetch all in parallel
  const [selic, cdi, ipca, news] = await Promise.all([
    fetchBCB(11),   // Selic
    fetchBCB(12),   // CDI
    fetchBCB(433),  // IPCA
    fetchRSS(),
  ])

  const indicators: Indicator[] = [
    {
      name: 'Selic',
      value: selic ? `${parseFloat(selic.valor).toFixed(2)}% a.a.` : '—',
      date: selic?.data || '',
      description: 'Taxa básica de juros definida pelo Banco Central. Referência para todos os investimentos de renda fixa.',
      trend: 'stable',
    },
    {
      name: 'CDI',
      value: cdi ? `${parseFloat(cdi.valor).toFixed(2)}% a.a.` : '—',
      date: cdi?.data || '',
      description: 'Certificado de Depósito Interbancário. Base de comparação para CDBs e fundos. Anda junto com a Selic.',
      trend: 'stable',
    },
    {
      name: 'IPCA',
      value: ipca ? `${parseFloat(ipca.valor).toFixed(2)}%` : '—',
      date: ipca?.data || '',
      description: 'Inflação oficial do Brasil medida pelo IBGE. Se seu investimento rende menos que isso, você está perdendo poder de compra.',
      trend: 'stable',
    },
  ]

  const formattedNews = news.map(n => ({
    ...n,
    pubDate: formatPubDate(n.pubDate),
  }))

  return NextResponse.json({ indicators, news: formattedNews })
}
