'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TUTORIALS, type TutorialScreen, resetAllTutorials } from '@/lib/hooks/use-tutorial'
import { X, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react'

interface TutorialOverlayProps {
  screen: TutorialScreen
  visible: boolean
  onDismiss: () => void
  onSkipAll: () => void
}

export function TutorialOverlay({ screen, visible, onDismiss, onSkipAll }: TutorialOverlayProps) {
  const [step, setStep] = useState(0)
  const tutorial = TUTORIALS[screen]
  const steps = tutorial.steps
  const current = steps[step]
  const isLast = step === steps.length - 1

  if (!visible) return null

  function next() {
    if (isLast) { onDismiss(); setStep(0) }
    else setStep(s => s + 1)
  }

  function prev() {
    if (step > 0) setStep(s => s - 1)
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-end pb-32 px-5"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      {/* Card */}
      <div className="w-full max-w-sm animate-bounce-in">
        <div className="bg-card rounded-[24px] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                {tutorial.title} · {step + 1}/{steps.length}
              </span>
            </div>
            <button onClick={onSkipAll} className="p-1.5 rounded-full hover:bg-secondary pressable">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5 px-5 mb-5">
            {steps.map((_, i) => (
              <div key={i} className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === step ? 'flex-[2] bg-foreground' : i < step ? 'flex-1 bg-foreground/40' : 'flex-1 bg-border'
              )} />
            ))}
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            <div className="text-4xl mb-4">{current.icon}</div>
            <h3 className="text-[20px] font-bold tracking-tight mb-2">{current.title}</h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed">{current.text}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 pb-5">
            {step > 0 && (
              <button onClick={prev}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center pressable flex-shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Button onClick={next} className="flex-1 h-12 rounded-[14px] text-[15px] font-semibold"
              style={{ background: 'hsl(220, 13%, 18%)', color: 'white' }}>
              {isLast ? 'Entendido! ✓' : (
                <span className="flex items-center gap-1">Próximo <ChevronRight className="w-4 h-4" /></span>
              )}
            </Button>
          </div>

          {/* Skip all */}
          <button onClick={onSkipAll}
            className="w-full pb-4 text-[13px] text-muted-foreground pressable hover:text-foreground transition-colors">
            Pular todos os tutoriais
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal to view tutorials on demand
interface TutorialsModalProps {
  visible: boolean
  onClose: () => void
}

export function TutorialsModal({ visible, onClose }: TutorialsModalProps) {
  const [selected, setSelected] = useState<TutorialScreen | null>(null)
  const [step, setStep] = useState(0)
  const screens = Object.keys(TUTORIALS) as TutorialScreen[]

  if (!visible) return null

  if (selected) {
    const tutorial = TUTORIALS[selected]
    const current = tutorial.steps[step]
    const isLast = step === tutorial.steps.length - 1

    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={e => e.target === e.currentTarget && (setSelected(null), setStep(0))}
      >
        <div className="w-full max-w-sm animate-slide-up mb-8 mx-5">
          <div className="bg-card rounded-[24px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <button onClick={() => { setSelected(null); setStep(0) }}
                className="text-[15px] text-blue-500 font-medium pressable">
                ← Voltar
              </button>
              <span className="text-[13px] font-semibold text-muted-foreground">
                {tutorial.title}
              </span>
              <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="flex gap-1.5 px-5 mb-5">
              {tutorial.steps.map((_, i) => (
                <div key={i} className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === step ? 'flex-[2] bg-foreground' : i < step ? 'flex-1 bg-foreground/40' : 'flex-1 bg-border'
                )} />
              ))}
            </div>

            <div className="px-5 pb-5">
              <div className="text-4xl mb-4">{current.icon}</div>
              <h3 className="text-[20px] font-bold tracking-tight mb-2">{current.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">{current.text}</p>
            </div>

            <div className="flex gap-2 px-5 pb-6">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center pressable">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <Button onClick={() => isLast ? (setSelected(null), setStep(0)) : setStep(s => s + 1)}
                className="flex-1 h-12 rounded-[14px] text-[15px] font-semibold"
                style={{ background: 'hsl(220, 13%, 18%)', color: 'white' }}>
                {isLast ? 'Concluído ✓' : <span className="flex items-center gap-1">Próximo <ChevronRight className="w-4 h-4" /></span>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm animate-slide-up mb-8 mx-5">
        <div className="bg-card rounded-[24px] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div>
              <h2 className="text-[20px] font-bold">Tutoriais</h2>
              <p className="text-[13px] text-muted-foreground">Aprenda a usar cada seção</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-secondary pressable">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-border">
            {screens.map(screen => {
              const t = TUTORIALS[screen]
              return (
                <button key={screen} onClick={() => { setSelected(screen); setStep(0) }}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 pressable">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.steps[0].icon}</span>
                    <div className="text-left">
                      <p className="text-[15px] font-semibold">{t.title}</p>
                      <p className="text-[12px] text-muted-foreground">{t.steps.length} dicas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )
            })}
          </div>

          <div className="px-5 py-4 border-t border-border">
            <button onClick={() => { resetAllTutorials(); onClose() }}
              className="w-full text-[13px] text-muted-foreground pressable hover:text-foreground">
              Reiniciar todos os tutoriais
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
