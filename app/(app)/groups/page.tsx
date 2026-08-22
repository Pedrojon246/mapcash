'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Plus, Users, ChevronRight, Bell, Check, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'

interface GroupWithMeta {
  id: string
  name: string
  emoji: string
  created_at: string
  memberCount: number
}

interface PendingInvite {
  id: string
  group_id: string
  group_name: string
  group_emoji: string
  invited_by_name: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithMeta[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useI18n()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch groups
    const { data: memberRows } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    if (memberRows && memberRows.length > 0) {
      const groupIds = memberRows.map((r: any) => r.group_id)
      const { data: groupRows } = await supabase
        .from('groups')
        .select('id, name, emoji, created_at')
        .in('id', groupIds)
        .order('created_at', { ascending: false })

      if (groupRows) {
        const withCount = await Promise.all(
          groupRows.map(async (g: any) => {
            const { count } = await supabase
              .from('group_members')
              .select('id', { count: 'exact', head: true })
              .eq('group_id', g.id)
            return { ...g, memberCount: count || 0 }
          })
        )
        setGroups(withCount)
      }
    } else {
      setGroups([])
    }

    // Fetch pending invites for this user's email
    const { data: { user: freshUser } } = await supabase.auth.getUser()
    if (freshUser?.email) {
      const { data: inviteRows } = await supabase
        .from('group_invites')
        .select('id, group_id, status')
        .eq('invited_email', freshUser.email)
        .eq('status', 'pending')

      if (inviteRows && inviteRows.length > 0) {
        const enriched: PendingInvite[] = []
        for (const inv of inviteRows) {
          const { data: grp } = await supabase
            .from('groups')
            .select('name, emoji')
            .eq('id', inv.group_id)
            .single()
          if (grp) {
            enriched.push({
              id: inv.id,
              group_id: inv.group_id,
              group_name: grp.name,
              group_emoji: grp.emoji,
              invited_by_name: '',
            })
          }
        }
        setInvites(enriched)
      } else {
        setInvites([])
      }
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function handleAccept(invite: PendingInvite) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('group_invites')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', invite.id)

    await supabase.from('group_members').insert({
      group_id: invite.group_id,
      user_id: user.id,
      role: 'member',
    })

    toast({ variant: 'success', title: `Você entrou em "${invite.group_name}"! 🎉` })
    load()
  }

  async function handleDecline(invite: PendingInvite) {
    await supabase.from('group_invites')
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', invite.id)
    toast({ title: 'Convite recusado' })
    load()
  }

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

        {/* Pending invites */}
        {invites.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-[#FF9500]" />
              <p className="text-sm font-semibold text-[#FF9500]">
                {invites.length} convite{invites.length > 1 ? 's' : ''} pendente{invites.length > 1 ? 's' : ''}
              </p>
            </div>
            {invites.map(inv => (
              <div key={inv.id} className="p-4 bg-card rounded-2xl shadow-apple border border-[#FF9500]/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#AF52DE]/10 flex items-center justify-center text-xl flex-shrink-0">
                    {inv.group_emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-[15px]">{inv.group_name}</p>
                    <p className="text-xs text-muted-foreground">Você foi convidado para este grupo</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDecline(inv)}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Recusar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(inv)}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1.5" /> Aceitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Groups list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
          </div>
        ) : groups.length === 0 && invites.length === 0 ? (
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
                  {g.memberCount} {g.memberCount === 1 ? 'membro' : 'membros'} ·{' '}
                  {new Date(g.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
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
