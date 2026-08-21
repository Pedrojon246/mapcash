'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { Loader2, MapPin } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useI18n()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast({ variant: 'destructive', title: t.error, description: error.message })
      setLoading(false)
    } else {
      router.push('/wallet')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Logo */}
        <div className="mb-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-[22px] bg-primary flex items-center justify-center mx-auto mb-4 shadow-apple-lg">
            <MapPin className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t.appName}</h1>
          <p className="text-muted-foreground mt-1">{t.appTagline}</p>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm animate-slide-up">
          <h2 className="text-2xl font-bold mb-6">{t.welcomeBack}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.password}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading} size="lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.login}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.noAccount}{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              {t.createFree}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
