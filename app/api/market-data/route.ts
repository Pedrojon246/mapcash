import { NextResponse } from 'next/server'

// Fetch with timeout helper
async function fetchWithTimeout(url: string, timeoutMs = 6000, headers: Record<string, string> = {}): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MapCash/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        ...headers,
      },
      next: { revalidate: 1800 },
    })
    clearTimeout(timer)
    return res.ok ? res : null
  } catch {
    clearTimeout(timer)
    return null
  }
}

// BCB Banco Central API
async function fetchBCB(serieId: number): Promise<{ valor: string; data: string } | null> {
  try {
    const res = await fetchWithTimeout(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieId}/dados/ultimos/1?formato=json`,
      5000
    )
    if (!res) return null
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null
  } catch {
    return null
  }
}

// Parse RSS XML generically
function parseRSS(xml: string, limit = 8) {
  const items: { title: string; link: string; pubDate: string; description: string }[] = []
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1]

    const getField = (tag: string): string => {
      const cdataMatch = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i'))
      if (cdataMatch) return cdataMatch[1].trim()
      const plain = block.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
      return plain ? plain[1].trim() : ''
    }

    const getLinkField = (): string => {
      // Try <link> which can be tricky in RSS
      const linkCdata = block.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i)?.[1]
      if (linkCdata) return linkCdata.trim()
      const linkPlain = block.match(/<link>([^<]+)<\/link>/i)?.[1]
      if (linkPlain) return linkPlain.trim()
      const guid = block.match(/<guid[^>]*>([^<]+)<\/guid>/i)?.[1]
      return guid?.trim() || ''
    }

    const title = getField('title')
    if (!title || title.length < 5) continue

    const desc = getField('description')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
      .slice(0, 160)

    items.push({
      title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      link: getLinkField(),
      pubDate: getField('pubDate'),
      description: desc,
    })
  }
  return items
}

// Multiple RSS sources — tries each until one works
const RSS_SOURCES = [
  // Agência Brasil — federal government, very reliable
  'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml',
  // G1 Economia
  'https://g1.globo.com/rss/g1/economia/',
  // Exame
  'https://exame.com/feed/',
  // InfoMoney
  'https://www.infomoney.com.br/feed/',
]

async function fetchNews() {
  for (const url of RSS_SOURCES) {
    try {
      const res = await fetchWithTimeout(url, 7000)
      if (!res) continue
      const text = await res.text()
      if (!text.includes('<item')) continue
      const items = parseRSS(text, 8)
      if (items.length > 0) {
        console.log(`RSS success: ${url} — ${items.length} items`)
        return { items, source: new URL(url).hostname }
      }
    } catch {
      continue
    }
  }
  return { items: [], source: '' }
}

function formatPubDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const now = new Date()
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000)
    if (diffH < 1) return 'Agora há pouco'
    if (diffH < 24) return `há ${diffH}h`
    if (diffH < 48) return 'Ontem'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}

// Fallback data when APIs are unavailable
const FALLBACK_INDICATORS = [
  {
    name: 'Selic',
    value: '14,75% a.a.',
    date: '2025',
    description: 'Taxa básica de juros definida pelo Banco Central. Referência para todos os investimentos de renda fixa.',
  },
  {
    name: 'CDI',
    value: '14,65% a.a.',
    date: '2025',
    description: 'Certificado de Depósito Interbancário. Base de comparação para CDBs e fundos de investimento.',
  },
  {
    name: 'IPCA',
    value: '~5,5%',
    date: '2025',
    description: 'Inflação oficial do Brasil. Se seu investimento render menos que isso, você está perdendo poder de compra.',
  },
]

export async function GET() {
  // Fetch all in parallel with independent error handling
  const [selicData, cdiData, ipcaData, newsResult] = await Promise.allSettled([
    fetchBCB(11),   // Selic
    fetchBCB(12),   // CDI
    fetchBCB(433),  // IPCA
    fetchNews(),
  ])

  const selic = selicData.status === 'fulfilled' ? selicData.value : null
  const cdi = cdiData.status === 'fulfilled' ? cdiData.value : null
  const ipca = ipcaData.status === 'fulfilled' ? ipcaData.value : null
  const { items: newsItems, source: newsSource } = newsResult.status === 'fulfilled'
    ? newsResult.value
    : { items: [], source: '' }

  const indicators = [
    {
      name: 'Selic',
      value: selic ? `${parseFloat(selic.valor).toFixed(2).replace('.', ',')}% a.a.` : FALLBACK_INDICATORS[0].value,
      date: selic?.data || FALLBACK_INDICATORS[0].date,
      description: 'Taxa básica de juros definida pelo Banco Central. Referência para todos os investimentos de renda fixa. Quanto mais alta, mais rendem os investimentos conservadores.',
      live: !!selic,
    },
    {
      name: 'CDI',
      value: cdi ? `${parseFloat(cdi.valor).toFixed(2).replace('.', ',')}% a.a.` : FALLBACK_INDICATORS[1].value,
      date: cdi?.data || FALLBACK_INDICATORS[1].date,
      description: 'Certificado de Depósito Interbancário. É a referência de comparação para CDBs e fundos. Um CDB a 100% do CDI significa que rende o mesmo que o CDI.',
      live: !!cdi,
    },
    {
      name: 'IPCA',
      value: ipca ? `${parseFloat(ipca.valor).toFixed(2).replace('.', ',')}%` : FALLBACK_INDICATORS[2].value,
      date: ipca?.data || FALLBACK_INDICATORS[2].date,
      description: 'Inflação oficial do Brasil, medida pelo IBGE. Se o seu dinheiro render menos que o IPCA no ano, você está perdendo poder de compra — mesmo com juros positivos.',
      live: !!ipca,
    },
  ]

  const news = newsItems.map(n => ({
    ...n,
    pubDate: formatPubDate(n.pubDate),
  }))

  return NextResponse.json({
    indicators,
    news,
    newsSource,
    fetchedAt: new Date().toISOString(),
  })
}
