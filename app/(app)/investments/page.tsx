'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AutoTutorial } from '@/components/shared/auto-tutorial'
import { TutorialsModal } from '@/components/shared/tutorial-overlay'
import { useShowTutorial } from '@/lib/hooks/use-tutorial'
import { LearnTab } from '@/components/investments/learn-tab'
import { MarketTab } from '@/components/investments/market-tab'

type Tab = 'learn' | 'news'

export default function InvestmentsPage() {
  const [tab, setTab] = useState<Tab>('learn')
  const { visible: tutModalVisible, open: openTutModal, close: closeTutModal } = useShowTutorial('investments')

  return (
    <div className="animate-fade-in safe-top pb-6">
      <PageHeader
        title="Investir"
        subtitle="Entenda como, onde e quando. Sem indicar ativo."
        large
        right={
          <button onClick={openTutModal}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable text-[12px] font-medium">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.8} /> Tutoriais
          </button>
        }
      />

      <div className="px-5">
        <div className="flex gap-1 p-1 rounded-full bg-secondary dark:bg-white/[0.06] dark:ring-1 dark:ring-inset dark:ring-white/[0.14] mb-5">
          {([['learn', 'Aprender'], ['news', 'Notícias']] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn('flex-1 py-2 rounded-full text-[13px] font-semibold transition-all pressable',
                tab === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'learn' ? <LearnTab /> : <MarketTab />}
      </div>

      <AutoTutorial screen="investments" />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )
}
