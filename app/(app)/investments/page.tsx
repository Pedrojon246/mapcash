'use client'
import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { TrendingUp, Newspaper, ExternalLink, RefreshCw, Info, Wifi, WifiOff, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AutoTutorial } from '@/components/shared/auto-tutorial'
import { TutorialsModal } from '@/components/shared/tutorial-overlay'
import { useShowTutorial } from '@/lib/hooks/use-tutorial'

interface Indicator { name: string; value: string; date: string; description: string; live?: boolean }
interface NewsItem { title: string; link: string; pubDate: string; description: string }
interface MarketData { indicators: Indicator[]; news: NewsItem[]; newsSource?: string }

const INDICATOR_COLORS: Record<string, string> = { 'Selic': '#007AFF', 'CDI': '#34C759', 'IPCA': '#FF9500' }
const INDICATOR_ICONS: Record<string, string> = { 'Selic': '🏦', 'CDI': '📊', 'IPCA': '🛒' }

export default function InvestmentsPage() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { visible: tutModalVisible, open: openTutModal, close: closeTutModal } = useShowTutorial('investments')

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
    <div className="animate-fade-in safe-top pb-6">
      <PageHeader
        title="Investimentos"
        large
        right={
          <div className="flex items-center gap-2">
            <button onClick={openTutModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable text-[12px] font-medium">
              <BookOpen className="w-3.5 h-3.5" /> Tutoriais
            </button>
            <button onClick={() => load(true)}
              className={cn('p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable', refreshing && 'opacity-50')}
              disabled={refreshing}>
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </button>
          </div>
        }
      />

      <div className="px-5 space-y-5">
        {/* Indicators */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Indicadores</p>
            </div>
            {data && (
              <div className="flex items-center gap-1">
                {data.indicators[0]?.live
                  ? <><Wifi className="w-3 h-3 text-[#34C759]" /><span className="text-[11px] text-[#34C759]">ao vivo</span></>
                  : <><WifiOff className="w-3 h-3 text-muted-foreground" /><span className="text-[11px] text-muted-foreground">estimado</span></>
                }
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {loading ? [1,2,3].map(i => <div key={i} className="h-24 rounded-[18px] skeleton" />) :
              data?.indicators.map(ind => (
                <button key={ind.name} type="button"
                  onClick={() => setExpanded(expanded === ind.name ? null : ind.name)}
                  className="p-3.5 bg-card rounded-[18px] border border-border/40 text-left pressable"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <p className="text-xl mb-1.5">{INDICATOR_ICONS[ind.name]}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{ind.name}</p>
                  <p className="text-[15px] font-bold" style={{ color: INDICATOR_COLORS[ind.name] }}>{ind.value}</p>
                  {ind.date && <p className="text-[9px] text-muted-foreground mt-0.5">{ind.date}</p>}
                </button>
              ))
            }
          </div>

          {expanded && data?.indicators && (() => {
            const ind = data.indicators.find(i => i.name === expanded)
            if (!ind) return null
            return (
              <div className="p-4 rounded-[16px] border border-border/40 animate-slide-down bg-card">
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
          <div className="flex items-center justify-between p-5 rounded-[20px] pressable"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <div>
              <p className="font-bold text-[16px] text-white">Minhas metas</p>
              <p className="text-[13px] text-white/60 mt-0.5">Acompanhe seus objetivos</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </Link>

        {/* News */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-muted-foreground" />
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Notícias</p>
            </div>
            {data?.newsSource && <span className="text-[11px] text-muted-foreground">{data.newsSource}</span>}
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-[16px] skeleton" />)}</div>
          ) : data?.news && data.news.length > 0 ? (
            <div className="space-y-2">
              {data.news.map((item, i) => (
                <a key={i} href={item.link || '#'} target="_blank" rel="noopener noreferrer"
                  className="block p-4 bg-card rounded-[16px] border border-border/40 pressable"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] leading-snug line-clamp-2">{item.title}</p>
                      {item.description && (
                        <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      )}
                      {item.pubDate && <p className="text-[11px] text-muted-foreground mt-1.5">{item.pubDate}</p>}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-[16px] border border-border/40">
              <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-[14px] text-muted-foreground">Indisponível no momento</p>
              <button onClick={() => load(true)} className="mt-2 text-[12px] text-primary pressable">Tentar novamente</button>
            </div>
          )}
        </div>
      </div>

      <AutoTutorial screen="investments" />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )
}
