'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.7-9.7 6.7-17.4z"/>
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.3-5.7c-2 1.4-4.6 2.3-8.7 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  )
}

export function GoogleButton({ label = 'Continuar com Google' }: { label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    const supabase = createClient()
    // honour ?redirect=/join/xyz (group invite flow), otherwise go to the wallet
    const wanted = new URLSearchParams(window.location.search).get('redirect')
    const next = wanted && wanted.startsWith('/') ? wanted : '/wallet'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) {
      toast({ variant: 'destructive', title: 'Não foi possível entrar com Google', description: error.message })
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className="w-full h-[52px] rounded-2xl bg-secondary text-foreground font-semibold text-[16px] tracking-tight flex items-center justify-center gap-2.5 pressable disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleMark />}
      {label}
    </button>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[12px] text-muted-foreground">ou</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
