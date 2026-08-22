'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { Loader2, MapPin, MailCheck } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const { t } = useI18n()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Senha muito curta', description: 'Mínimo 6 caracteres.' })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) {
      toast({ variant: 'destructive', title: t.error, description: error.message })
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background safe-top">
      <div className="w-full max-w-sm text-center animate-scale-in">
        <div className="w-20 h-20 rounded-[22px] bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Confirme seu e-mail</h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-2">
          Enviamos um link de confirmação para
        </p>
        <p className="font-semibold text-foreground mb-6">{email}</p>
        <p className="text-sm text-muted-foreground mb-8">
          Clique no link do e-mail para ativar sua conta e entrar no Map Cash.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">Já confirmei, entrar</Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-4">
          Não recebeu? Verifique a caixa de spam.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="mb-8 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-[22px] bg-primary flex items-center justify-center mx-auto mb-4 shadow-apple-lg">
            <MapPin className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t.appName}</h1>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <h2 className="text-2xl font-bold mb-6">{t.createAccount}</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>{t.name}</Label>
              <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input type="email" placeholder="voce@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label>{t.password}</Label>
              <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading} size="lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.createFree}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.hasAccount}{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">{t.login}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
