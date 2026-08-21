'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency } from '@/lib/utils'
import { Plus, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Group } from '@/lib/supabase/types'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useI18n()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('group_members')
      .select('groups(*)')
      .eq('user_id', user.id)
    const grps = (data || []).map((d: any) => d.groups).filter(Boolean)
    setGroups(grps)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={t.groupsTitle}
        large
        right={
          <Link href="/groups/new">
            <Button size="icon"><Plus className="w-5 h-5" /></Button>
          </Link>
        }
      />

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}</div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">{t.noGroups}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">{t.noGroupsDesc}</p>
            <Link href="/groups/new">
              <Button className="mt-4"><Plus className="w-4 h-4 mr-2" />{t.createGroup}</Button>
            </Link>
          </div>
        ) : groups.map(g => (
          <Link key={g.id} href={`/groups/${g.id}`}>
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50 pressable">
              <div className="w-12 h-12 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center text-2xl">
                {g.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] truncate">{g.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(g.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
