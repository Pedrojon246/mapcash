'use client'
import { useEffect, useState } from 'react'
import { Download, Share, PlusSquare, X } from 'lucide-react'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = 'mapcash-install-dismissed'

/** Registers the service worker once, globally. */
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
}

/**
 * Install card. Android/Chrome/desktop: real install button (beforeinstallprompt).
 * iPhone/iPad: Safari has no install API, so we show the 2-step guide.
 */
export function InstallCard({ className = '' }: { className?: string }) {
  const [evt, setEvt] = useState<BIPEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [showIosSteps, setShowIosSteps] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY) === '1') setHidden(true) } catch {}
    setInstalled(isStandalone())
    const ua = navigator.userAgent
    setIos(/iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document))
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent) }
    const onInstalled = () => { setInstalled(true); setEvt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || hidden || (!evt && !ios)) return null

  function dismiss() {
    setHidden(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  async function install() {
    if (!evt) return
    await evt.prompt()
    await evt.userChoice
    setEvt(null)
  }

  return (
    <div className={`bg-card rounded-[22px] p-4 ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="icon-tile"><Download className="w-5 h-5" strokeWidth={1.8} /></div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] tracking-tight">Instale o Map Cash</p>
          <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
            Abre em tela cheia, direto da tela inicial, como um app de verdade.
          </p>
          {evt && (
            <button onClick={install} className="mt-3 h-9 px-4 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold pressable">
              Instalar agora
            </button>
          )}
          {!evt && ios && !showIosSteps && (
            <button onClick={() => setShowIosSteps(true)} className="mt-3 h-9 px-4 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold pressable">
              Como instalar no iPhone
            </button>
          )}
          {!evt && ios && showIosSteps && (
            <ol className="mt-3 space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-foreground font-semibold">1.</span> Toque em
                <Share className="w-4 h-4 text-foreground" strokeWidth={1.8} /> Compartilhar (no Safari)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground font-semibold">2.</span> Escolha
                <PlusSquare className="w-4 h-4 text-foreground" strokeWidth={1.8} /> Adicionar à Tela de Início
              </li>
            </ol>
          )}
        </div>
        <button onClick={dismiss} aria-label="Fechar" className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
