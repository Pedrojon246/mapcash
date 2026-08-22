'use client'
import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { TrendingUp, Newspaper, ExternalLink, RefreshCw, Info, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Indicator {
  name: string
  value: string
  date: string
  description: string
  live?: boolean
}

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
}

interface MarketData {
  indicators: Indicator[]
  news: NewsItem[]
  newsSource?: string
  fetchedAt?: string
}

const INDICATOR_COLORS: Record<string, string> = {
  'Selic': '#007AFF',
  'CDI': '#34C759',
  'IPCA': '#FF9500',
}

const INDICATOR_ICONS: Record<string, string> = {
  'Selic': '🏦',
  'CDI': '📊',
  'IPCA': '🛒',
}

export default function InvestmentsPage() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/market-data', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch { /* silent */ }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="animate-fade-in safe-top pb-6">
      <PageHeader
        title="Investimentos"
        large
        right={
          <button
            onClick={() => load(true)}
            className={cn(
              'p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground pressable',
              refreshing && 'opacity-50'
            )}
            disabled={refreshing}
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          </button>
        }
      />

      <div className="px-5 space-y-5">

        {/* Indicadores */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Indicadores
              </p>
            </div>
            {data && (
              <div className="flex items-center gap-1">
                {data.indicators[0]?.live
                  ? <><Wifi className="w-3 h-3 text-[#34C759]" /><span className="text-xs text-[#34C759]">ao vivo</span></>
                  : <><WifiOff className="w-3 h-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">estimado</span></>
                }
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)
            ) : data?.indicators.map(ind => (
              <button
                key={ind.name}
                type="button"
                onClick={() => setExpandedIndicator(expandedIndicator === ind.name ? null : ind.name)}
                className="p-3 bg-card rounded-2xl shadow-apple-sm border border-border/50 text-left pressable active:scale-95 transition-transform"
              >
                <p className="text-lg mb-1">{INDICATOR_ICONS[ind.name]}</p>
                <p className="text-xs text-muted-foreground font-medium">{ind.name}</p>
                <p className="text-[15px] font-bold mt-0.5" style={{ color: INDICATOR_COLORS[ind.name] }}>
                  {ind.value}
                </p>
                {ind.date && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">{ind.date}</p>
                )}
              </button>
            ))}
          </div>

          {/* Indicator explanation */}
          {expandedIndicator && data?.indicators && (() => {
            const ind = data.indicators.find(i => i.name === expandedIndicator)
            if (!ind) return null
            return (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 animate-slide-down">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                      O que é {ind.name}?
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                      {ind.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Fonte: Banco Central do Brasil · Toque para entender
          </p>
        </div>

        {/* Link para metas */}
        <Link href="/goals">
          <div className="flex items-center justify-between p-4 bg-primary rounded-2xl shadow-apple text-white pressable">
            <div>
              <p className="font-semibold text-[15px]">Minhas metas</p>
              <p className="text-sm opacity-80 mt-0.5">Acompanhe o progresso dos seus objetivos</p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </Link>

        {/* Notícias */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Notícias do mercado
              </p>
            </div>
            {data?.newsSource && (
              <span className="text-xs text-muted-foreground">{data.newsSource}</span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
            </div>
          ) : data?.news && data.news.length > 0 ? (
            <div className="space-y-2">
              {data.news.map((item, i) => (
                <a
                  key={i}
                  href={item.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50 pressable"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[14px] leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.pubDate && (
                        <p className="text-xs text-muted-foreground mt-1.5">{item.pubDate}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-2xl border border-border/50">
              <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">Notícias temporariamente indisponíveis</p>
              <p className="text-xs text-muted-foreground mt-1">Tente atualizar em alguns minutos</p>
              <button
                onClick={() => load(true)}
                className="mt-3 text-xs text-primary font-medium pressable"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
