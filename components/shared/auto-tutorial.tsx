'use client'
import { useTutorial, type TutorialScreen } from '@/lib/hooks/use-tutorial'
import { TutorialOverlay } from './tutorial-overlay'

export function AutoTutorial({ screen }: { screen: TutorialScreen }) {
  const { visible, dismiss, skipAll } = useTutorial(screen)
  return <TutorialOverlay screen={screen} visible={visible} onDismiss={dismiss} onSkipAll={skipAll} />
}
