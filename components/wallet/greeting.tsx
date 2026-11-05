'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, CUTTABLE_CATEGORIES, currentMonth, monthRange } from '@/lib/utils'
import { getDay, getHours } from 'date-fns'
import { AlertTriangle, Sparkles, CircleCheck, Hand } from 'lucide-react'

interface GreetingData {
  userName: string
  overBudget: { category: string; spent: number; limit: number }[]
  nearBudget: { category: string; spent: number; limit: number; pct: number }[]
  savings: number
  totalExpenses: number
  totalIncome: number
}

function getTimeGreeting(): string {
  const h = getHours(new Date())
  if (h >= 5 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getDayGreeting(): string {
  const greetings = ['Ótimo domingo', 'Boa segunda', 'Boa terça', 'Boa quarta', 'Boa quinta', 'Boa sexta', 'Ótimo sábado']
  return greetings[getDay(new Date())]
}

type Kind = 'warning' | 'ok' | 'great'

function buildMessage(data: GreetingData): { message: string; sub: string; type: Kind } {
  const firstName = data.userName.split(' ')[0]

  if (data.overBudget.length > 0) {
    const worst = data.overBudget[0]
    const catName = worst.category === 'food_out' ? 'lanchinhos'
      : worst.category === 'entertainment' ? 'lazer'
      : worst.category === 'shopping' ? 'compras' : 'gastos'
    const overBy = worst.spent - worst.limit
    const tips: Record<string, string> = {
      food_out: 'Que tal cozinhar em casa hoje?',
      entertainment: 'Uma caminhada não custa nada.',
      shopping: 'Coloca na lista pra comprar no mês que vem.',
      travel: 'Já deu pra esse mês!',
    }
    return {
      message: `${firstName}, você extrapolou em ${catName}`,
      sub: `${formatCurrency(overBy)} acima do limite. ${tips[worst.category] || 'Segura as pontas!'}`,
      type: 'warning',
    }
  }

  if (data.nearBudget.length > 0) {
    const near = data.nearBudget[0]
    const remaining = near.limit - near.spent
    const tips: Record<string, string> = {
      food_out: `Só ${formatCurrency(remaining)} restando pra lanches — vale a pena?`,
      entertainment: `${formatCurrency(remaining)} restando pra lazer esse mês.`,
      shopping: 'Quase no limite de compras. Respira fundo!',
    }
    return {
      message: `Atenção, ${firstName}`,
      sub: tips[near.category] || `${formatCurrency(remaining)} restando no orçamento.`,
      type: 'warning',
    }
  }

  if (data.savings > 0 && data.totalIncome > 0) {
    const savingsPct = Math.round((data.savings / data.totalIncome) * 100)
    if (savingsPct >= 20) return { message: `Excelente, ${firstName}`, sub: `Você está guardando ${savingsPct}% da renda. Continue assim!`, type: 'great' }
    if (savingsPct >= 10) return { message: `Tudo nos trilhos, ${firstName}`, sub: `${savingsPct}% da renda guardada este mês. Bom ritmo!`, type: 'ok' }
  }

  if (data.totalExpenses === 0 && data.totalIncome === 0) {
    return { message: `Olá, ${firstName}`, sub: 'Adicione seu primeiro lançamento e comece a mapear seu dinheiro.', type: 'ok' }
  }
  return { message: `Olá, ${firstName}`, sub: 'Seu resumo do mês está atualizado.', type: 'ok' }
}

export function Greeting() {
  const [data, setData] = useState<GreetingData | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { start, end } = monthRange(currentMonth())

      const [{ data: profile }, { data: txData }, { data: budgetsData }] = await Promise.all([
        supabase.from('profiles').select('name').eq('user_id', user.id).single(),
        supabase.from('transactions').select('type,amount,category')
          .eq('user_id', user.id).gte('date', start).lt('date', end),
        supabase.from('budgets').select('category,monthly_limit')
          .eq('user_id', user.id).eq('month', currentMonth()),
      ])

      const userName = profile?.name || user.email?.split('@')[0] || 'você'
      const expenses = (txData || []).filter((t: any) => t.type === 'expense')
      const totalIncome = (txData || []).filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0)
      const totalExpenses = expenses.reduce((s: number, t: any) => s + t.amount, 0)

      const spendByCategory: Record<string, number> = {}
      expenses.forEach((t: any) => { spendByCategory[t.category] = (spendByCategory[t.category] || 0) + t.amount })

      const overBudget: GreetingData['overBudget'] = []
      const nearBudget: GreetingData['nearBudget'] = []
      ;(budgetsData || []).forEach((b: any) => {
        const spent = spendByCategory[b.category] || 0
        const pct = (spent / b.monthly_limit) * 100
        if (spent > b.monthly_limit) overBudget.push({ category: b.category, spent, limit: b.monthly_limit })
        else if (pct >= 80) nearBudget.push({ category: b.category, spent, limit: b.monthly_limit, pct })
      })
      overBudget.sort((a, b) => (CUTTABLE_CATEGORIES.includes(b.category) ? 1 : -1))

      setData({ userName, overBudget, nearBudget, savings: Math.max(totalIncome - totalExpenses, 0), totalExpenses, totalIncome })
    }
    load()
  }, [supabase])

  if (!data) return <div className="mx-5 mb-2 rounded-[22px] skeleton h-[84px]" />

  const { message, sub, type } = buildMessage(data)
  const Icon = type === 'warning' ? AlertTriangle : type === 'great' ? Sparkles : message.startsWith('Olá') ? Hand : CircleCheck
  const tone = type === 'warning' ? 'text-warn' : type === 'great' ? 'text-income' : 'text-foreground'

  return (
    <div className="mx-5 mb-2 p-4 rounded-[22px] glass-card flex items-start gap-3.5 animate-slide-up">
      <div className={`icon-tile ${tone}`}><Icon className="w-5 h-5" strokeWidth={1.8} /></div>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted-foreground">{getDayGreeting()} · {getTimeGreeting()}</p>
        <p className={`font-semibold text-[16px] leading-snug tracking-tight ${type === 'warning' ? 'text-warn' : ''}`}>{message}</p>
        <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{sub}</p>
      </div>
    </div>
  )
}
