'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, Newspaper, ExternalLink, RefreshCw, Info, Wifi, WifiOff, Landmark, Percent, ShoppingBasket, Target, ChevronRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Indicator { name: string; value: string; date: string; description: string; live?: boolean }
interface NewsItem { title: string; link: string; pubDate: string; description: string }
interface MarketData { indicators: Indicator[]; news: NewsItem[]; newsSource?: string }

const INDICATOR_ICONS: Record<string, LucideIcon> = { 'Selic': Landmark, 'CDI': Percent, 'IPCA': ShoppingBasket }

function cleanText(s: string) {
  return (s || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function MarketTab() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/market-data', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch {}
    setLoading(false); setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <div className="space-y-5">
        {/* Indicators */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              <p className="section-label">Indicadores</p>
            </div>
            {data && (
              <div className="flex items-center gap-2">
                <button onClick={() => load(true)} disabled={refreshing} aria-label="Atualizar"
                  className={cn('w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable', refreshing && 'opacity-50')}>
                  <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
                </button>
                <div className="flex items-center gap-1">
                {data.indicators[0]?.live
                  ? <><Wifi className="w-3 h-3 text-income" /><span className="text-[11px] text-income">ao vivo</span></>
                  : <><WifiOff className="w-3 h-3 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">estimado</span></>
                }
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {loading ? [1,2,3].map(i => <div key={i} className="h-24 rounded-[22px] skeleton" />) :
              data?.indicators.map(ind => (
                <button key={ind.name} type="button"
                  onClick={() => setExpanded(expanded === ind.name ? null : ind.name)}
                  className={cn('p-4 glass-card rounded-[22px] text-left pressable', expanded === ind.name && 'ring-1 ring-foreground/30')}>
                  {(() => { const I = INDICATOR_ICONS[ind.name] || Percent; return <I className="w-[18px] h-[18px] text-muted-foreground mb-3" strokeWidth={1.7} /> })()}
                  <p className="text-[12px] text-muted-foreground font-medium mb-0.5">{ind.name}</p>
                  <p className="text-[19px] font-bold tracking-tight tabular-nums">{ind.value}</p>
                  {ind.date && <p className="text-[10px] text-muted-foreground mt-0.5">{ind.date}</p>}
                </button>
              ))
            }
          </div>

          {expanded && data?.indicators && (() => {
            const ind = data.indicators.find(i => i.name === expanded)
            if (!ind) return null
            return (
              <div className="p-4 rounded-[22px] animate-slide-down glass-card">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold mb-1">O que é {ind.name}?</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{ind.description}</p>
                  </div>
                </div>
              </div>
            )
          })()}
          <p className="text-[11px] text-muted-foreground mt-2 text-center">Banco Central do Brasil · toque para entender</p>
        </div>

        {/* Link metas */}
        <Link href="/goals">
          <div className="flex items-center gap-3.5 p-4 rounded-[22px] glass-card pressable">
            <div className="icon-tile"><Target className="w-5 h-5" strokeWidth={1.8} /></div>
            <div className="flex-1">
              <p className="font-semibold text-[16px] tracking-tight">Minhas metas</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">Acompanhe seus objetivos</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
          </div>
        </Link>

        {/* News */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              <p className="section-label">Notícias</p>
            </div>
            {data?.newsSource && <span className="text-[11px] text-muted-foreground">{data.newsSource}</span>}
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-[22px] skeleton" />)}</div>
          ) : data?.news && data.news.length > 0 ? (
            <div className="list-group">
              {data.news.map((item, i) => (
                <a key={i} href={item.link || '#'} target="_blank" rel="noopener noreferrer"
                  className="block p-4 pressable">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] leading-snug line-clamp-2">{cleanText(item.title)}</p>
                      {item.description && (
                        <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{cleanText(item.description)}</p>
                      )}
                      {item.pubDate && <p className="text-[11px] text-muted-foreground mt-1.5">{item.pubDate}</p>}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 glass-card rounded-[22px]">
              <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-[14px] text-muted-foreground">Indisponível no momento</p>
              <button onClick={() => load(true)} className="mt-2 text-[12px] text-foreground underline pressable">Tentar novamente</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
