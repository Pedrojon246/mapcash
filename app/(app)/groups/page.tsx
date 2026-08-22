'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Plus, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface GroupWithMeta {
  id: string
  name: string
  emoji: string
  created_at: string
  memberCount: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useI18n()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get groups the user is a member of
    const { data: memberRows } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    if (!memberRows || memberRows.length === 0) {
      setGroups([])
      setLoading(false)
      return
    }

    const groupIds = memberRows.map((r: any) => r.group_id)

    // Fetch group details
    const { data: groupRows } = await supabase
      .from('groups')
      .select('id, name, emoji, created_at')
      .in('id', groupIds)
      .order('created_at', { ascending: false })

    if (!groupRows) { setGroups([]); setLoading(false); return }

    // Count members per group
    const groupsWithMeta: GroupWithMeta[] = await Promise.all(
      groupRows.map(async (g: any) => {
        const { count } = await supabase
          .from('group_members')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', g.id)
        return { ...g, memberCount: count || 0 }
      })
    )

    setGroups(groupsWithMeta)
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
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">{t.noGroups}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">{t.noGroupsDesc}</p>
            <Link href="/groups/new">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />{t.createGroup}
              </Button>
            </Link>
          </div>
        ) : groups.map(g => (
          <Link key={g.id} href={`/groups/${g.id}`}>
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50 pressable">
              <div className="w-12 h-12 rounded-2xl bg-[#AF52DE]/10 flex items-center justify-center text-2xl flex-shrink-0">
                {g.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] truncate">{g.name}</p>
                <p className="text-xs text-muted-foreground">
                  {g.memberCount} {g.memberCount === 1 ? 'membro' : 'membros'} · {new Date(g.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
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
