import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, ChevronRight, Zap, BellRing, Users, MapPin, ShoppingCart, UtensilsCrossed, Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Map Cash — Pra onde foi o seu dinheiro?',
  description: 'Controle financeiro simples, direto do celular. Lance gastos em segundos, receba aviso antes de estourar o limite e comece grátis.',
}

function CreateButton({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/register"
      className={`pressable flex items-center justify-between rounded-[20px] bg-primary text-primary-foreground px-5 py-4 ${className}`}
    >
      <span>
        <span className="block text-[17px] font-semibold tracking-tight">Criar minha conta</span>
        <span className="block text-[13px] opacity-70 mt-0.5">Grátis por enquanto</span>
      </span>
      <span className="w-9 h-9 rounded-full bg-primary-foreground text-primary flex items-center justify-center flex-shrink-0">
        <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />
      </span>
    </Link>
  )
}

function LoginButton() {
  return (
    <Link href="/login" className="pressable flex items-center justify-between rounded-[20px] glass-card px-5 py-4">
      <span>
        <span className="block text-[17px] font-semibold tracking-tight">Já tenho conta</span>
        <span className="block text-[13px] text-muted-foreground mt-0.5">Fazer login</span>
      </span>
      <ChevronRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
    </Link>
  )
}

function AppPreview() {
  return (
    <div className="glass-card glass-hero rounded-t-[28px] md:rounded-[28px] p-5 md:p-6">
      <p className="section-label">Saldo do mês</p>
      <p className="numeral mt-1.5 mb-5" style={{ fontSize: 42 }}>R$ 3.420,50</p>
      <div className="flex h-2 gap-[3px] rounded overflow-hidden mb-4">
        <div className="bg-foreground" style={{ flex: 40 }} />
        <div className="bg-muted-foreground" style={{ flex: 25 }} />
        <div className="bg-accent" style={{ flex: 20 }} />
        <div className="bg-warn" style={{ flex: 15 }} />
      </div>
      <div className="divide-y divide-border border-t border-border text-[14px]">
        <div className="flex items-center justify-between py-3">
          <span className="flex items-center gap-2.5"><ShoppingCart className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />Mercado</span>
          <span className="tabular-nums">R$ 182,40</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="flex items-center gap-2.5"><UtensilsCrossed className="w-4 h-4 text-warn" strokeWidth={1.8} />Lanches</span>
          <span className="text-warn">acima do limite</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="flex items-center gap-2.5"><Car className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />Uber</span>
          <span className="tabular-nums">R$ 23,90</span>
        </div>
      </div>
    </div>
  )
}

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/wallet')

  return (
    // Always dark: the sales page is the brand's first impression
    <div className="dark ambient bg-background text-foreground min-h-screen safe-top">
      <div className="mx-auto max-w-5xl px-5 md:px-8 pb-10">

        <header className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-2.5">
            <div className="w-[30px] h-[30px] rounded-[9px] bg-primary text-primary-foreground flex items-center justify-center">
              <MapPin className="w-[17px] h-[17px]" strokeWidth={1.8} />
            </div>
            <span className="font-semibold text-[16px] tracking-tight">Map Cash</span>
          </div>
          <Link href="/login" className="hidden md:inline text-[14px] text-muted-foreground hover:text-foreground">
            Fazer login
          </Link>
        </header>

        <main className="md:grid md:grid-cols-2 md:gap-14 md:items-center md:pt-16">
          <section className="pt-12 md:pt-0">
            <h1 className="text-[44px] md:text-[56px] leading-[1.02] font-bold tracking-[-2px] md:tracking-[-2.5px]">
              Pra onde foi<br />o seu dinheiro?
            </h1>
            <p className="text-[17px] leading-snug text-muted-foreground mt-4 max-w-sm tracking-tight">
              Descubra em minutos. Controle simples, direto do celular.
            </p>

            <div className="mt-8 space-y-2.5 max-w-md">
              <CreateButton />
              <LoginButton />
            </div>
          </section>

          <section className="mt-9 md:mt-0 -mx-5 px-5 md:mx-0 md:px-0 h-[300px] md:h-auto overflow-hidden">
            <AppPreview />
          </section>
        </main>

        <section className="mt-10 md:mt-20 space-y-5 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {[
            { icon: Zap, text: 'Lance um gasto em 5 segundos', warn: false },
            { icon: BellRing, text: 'Aviso antes de estourar o limite', warn: true },
            { icon: Users, text: 'Metas e grupos pra dividir contas', warn: false },
          ].map(({ icon: Icon, text, warn }) => (
            <div key={text} className="flex items-center gap-3.5 md:bg-card md:rounded-[22px] md:p-5">
              <Icon className={`w-6 h-6 flex-shrink-0 ${warn ? 'text-warn' : ''}`} strokeWidth={1.7} />
              <p className="text-[16px] font-medium tracking-tight">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 md:mt-20 border-t border-border pt-8 text-center">
          <p className="text-[13px] text-income">Acesso antecipado</p>
          <p className="mt-1.5 font-bold tracking-[-2px] leading-none" style={{ fontSize: 44 }}>
            Grátis por enquanto
          </p>
          <p className="text-[14px] text-muted-foreground mt-3 max-w-xs mx-auto">
            Estamos em fase de testes. Use à vontade e nos conte o que melhorar.
          </p>

          <div className="mt-6 max-w-md mx-auto">
            <CreateButton className="text-left" />
          </div>
          <p className="text-[14px] text-muted-foreground mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="text-foreground font-medium underline underline-offset-4">Fazer login</Link>
          </p>
        </section>

        <footer className="mt-10 text-center text-[12px] text-muted-foreground">Map Cash · Seu dinheiro, mapeado.</footer>
      </div>
    </div>
  )
}
