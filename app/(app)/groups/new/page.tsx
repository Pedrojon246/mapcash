'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const EMOJIS = ['✈️', '🏖️', '🏕️', '🎉', '🍕', '🎮', '🏠', '🎵', '🌍', '💼', '🎓', '❤️']

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function NewGroupPage() {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('✈️')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useI18n()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const token = generateToken()

      // Insert group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          emoji,
          created_by: user.id,
          invite_token: token,
        })
        .select('id')
        .single()

      if (groupError) throw groupError
      if (!group) throw new Error('Grupo não criado')

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      toast({ variant: 'success', title: 'Grupo criado! 🎉' })
      router.push(`/groups/${group.id}`)

    } catch (err: any) {
      console.error('Group creation error:', err)
      toast({
        variant: 'destructive',
        title: 'Erro ao criar grupo',
        description: err.message,
      })
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader title={t.createGroup} back />
      <div className="px-5">
        <form onSubmit={handleCreate} className="space-y-6">

          {/* Emoji picker */}
          <div className="space-y-3">
            <Label>Ícone do grupo</Label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'text-2xl h-12 rounded-xl transition-all pressable',
                    emoji === e
                      ? 'bg-primary/15 scale-110 shadow-apple-sm'
                      : 'bg-secondary hover:bg-accent'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-secondary rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#AF52DE]/15 flex items-center justify-center text-3xl flex-shrink-0">
              {emoji}
            </div>
            <div>
              <p className="font-semibold text-[15px]">{name || 'Nome do grupo'}</p>
              <p className="text-xs text-muted-foreground">Criado agora</p>
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label>{t.groupName}</Label>
            <Input
              placeholder="Ex: Viagem em Setembro, Churrasco..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !name.trim()}
          >
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : t.createGroup
            }
          </Button>
        </form>
      </div>
    </div>
  )
}
