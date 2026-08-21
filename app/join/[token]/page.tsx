'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { MapPin, Users, Loader2 } from 'lucide-react'
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
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="w-full max-w-sm">
        {/* App logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-[12px] bg-primary flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold">{t.appName}</span>
        </div>

        {/* Group info */}
        <div className="text-center mb-8 animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-[#AF52DE]/10 flex items-center justify-center text-4xl mx-auto mb-4">
            {group.emoji}
          </div>
          <p className="text-muted-foreground text-sm">{t.joinGroupDesc}</p>
          <h1 className="text-2xl font-bold mt-1">{group.name}</h1>
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

          <div className="space-y-3 p-4 bg-secondary rounded-2xl">
            <Label>{t.guestName}</Label>
            <Input
              placeholder="Seu nome"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
            />
            <Button
              variant="outline"
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
