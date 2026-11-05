'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { Users, Loader2 } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { GlyphIcon } from '@/components/ui/icons'
import Link from 'next/link'
import type { Group } from '@/lib/supabase/types'

export default function JoinPage({ params }: { params: { token: string } }) {
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState('')
  const [joining, setJoining] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useI18n()

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      const { data } = await supabase.from('groups').select('*').eq('invite_token', params.token).single()
      setGroup(data)
      setLoading(false)
    }
    init()
  }, [params.token, supabase])

  async function joinAsUser() {
    if (!group || !user) return
    setJoining(true)

    // Check if already member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'member' })
    }

    toast({ variant: 'success', title: 'Você entrou no grupo!' })
    router.push(`/groups/${group.id}`)
  }

  async function joinAsGuest() {
    if (!group || !guestName.trim()) return
    setJoining(true)
    await supabase.from('group_members').insert({ group_id: group.id, guest_name: guestName.trim(), role: 'member' })
    toast({ variant: 'success', title: 'Você entrou como convidado!' })
    router.push(`/groups/${group.id}`)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-xl font-semibold">Link inválido</p>
        <p className="text-muted-foreground mt-1">Este link de convite não existe ou expirou.</p>
        <Link href="/"><Button className="mt-4">Ir para o início</Button></Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        {/* App logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo size={40} />
          <span className="text-xl font-bold tracking-tight">{t.appName}</span>
        </div>

        {/* Group info */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="w-20 h-20 rounded-[26px] bg-card flex items-center justify-center mx-auto mb-4">
            <GlyphIcon glyph={group.emoji} className="w-9 h-9" strokeWidth={1.6} />
          </div>
          <p className="text-muted-foreground text-sm">{t.joinGroupDesc}</p>
          <h1 className="text-[28px] font-bold tracking-tight mt-1">{group.name}</h1>
        </div>

        <div className="space-y-3 animate-slide-up">
          {user ? (
            <Button className="w-full" size="lg" onClick={joinAsUser} disabled={joining}>
              {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><Users className="w-5 h-5 mr-2" />{t.joinWithAccount}</>
              )}
            </Button>
          ) : (
            <Link href={`/register?redirect=/join/${params.token}`}>
              <Button className="w-full" size="lg">
                <Users className="w-5 h-5 mr-2" />{t.joinWithAccount}
              </Button>
            </Link>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">ou</span></div>
          </div>

          <div className="space-y-3 p-4 glass-card rounded-[22px]">
            <Label>{t.guestName}</Label>
            <Input
              placeholder="Seu nome"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
            />
            <Button
              variant="secondary"
              className="w-full"
              onClick={joinAsGuest}
              disabled={joining || !guestName.trim()}
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : t.joinAsGuest}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
