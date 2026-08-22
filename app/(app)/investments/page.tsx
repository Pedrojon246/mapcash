'use client'
import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Newspaper, ExternalLink, RefreshCw, Info } from 'lucide-react'
import Link from 'next/link'

interface Indicator {
  name: string
  value: string
  date: string
  description: string
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

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/market-data')
      const json = await res.json()
      setData(json)
    } catch {
      // fail silently
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="animate-fade-in safe-top pb-6">
      <PageHeader
        title="Investimentos"
        large
        right={
          <button
            onClick={load}
            className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground pressable"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-5 space-y-5">

        {/* Indicadores */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Indicadores do momento
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl skeleton" />
              ))
            ) : data?.indicators.map(ind => (
              <button
                key={ind.name}
                type="button"
                onClick={() => setExpandedIndicator(
                  expandedIndicator === ind.name ? null : ind.name
                )}
                className="p-3 bg-card rounded-2xl shadow-apple-sm border border-border/50 text-left pressable"
              >
                <p className="text-lg mb-1">{INDICATOR_ICONS[ind.name]}</p>
                <p className="text-xs text-muted-foreground font-medium">{ind.name}</p>
                <p
                  className="text-base font-bold mt-0.5"
                  style={{ color: INDICATOR_COLORS[ind.name] }}
                >
                  {ind.value}
                </p>
              </button>
            ))}
          </div>

          {/* Expanded indicator explanation */}
          {expandedIndicator && data?.indicators && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 animate-slide-down">
              {(() => {
                const ind = data.indicators.find(i => i.name === expandedIndicator)
                return ind ? (
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-0.5">
                        O que é {ind.name}?
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                        {ind.description}
                      </p>
                      {ind.date && (
                        <p className="text-xs text-blue-500 mt-1">Atualizado em {ind.date}</p>
                      )}
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Fonte: Banco Central do Brasil · Toque para entender o indicador
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
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Notícias do mercado
            </p>
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
                  href={item.link}
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
                      <p className="text-xs text-muted-foreground mt-1.5">{item.pubDate}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              ))}
              <p className="text-xs text-muted-foreground text-center pt-1">
                Fonte: InfoMoney
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Notícias indisponíveis no momento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
