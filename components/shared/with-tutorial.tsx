'use client'
import { type ReactNode } from 'react'
import { useTutorial, type TutorialScreen } from '@/lib/hooks/use-tutorial'
import { TutorialOverlay } from '@/components/shared/tutorial-overlay'
import { BookOpen } from 'lucide-react'

interface WithTutorialProps {
  screen: TutorialScreen
  children: ReactNode
  onOpenTutorials?: () => void
}

export function TutorialButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable text-[12px] font-medium"
    >
      <BookOpen className="w-3.5 h-3.5" />
      Tutoriais
    </button>
  )
}

export function WithTutorial({ screen, children }: WithTutorialProps) {
  const { visible, dismiss, skipAll } = useTutorial(screen)

  return (
    <>
      {children}
      <TutorialOverlay screen={screen} visible={visible} onDismiss={dismiss} onSkipAll={skipAll} />
    </>
  )
}
