import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/bottom-nav'
import { GoalOnboarding } from '@/components/shared/goal-onboarding'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      <main className="flex-1 pb-24">
        {children}
      </main>
      <BottomNav />
      <GoalOnboarding show={!user.user_metadata?.goal} />
    </div>
  )
}
