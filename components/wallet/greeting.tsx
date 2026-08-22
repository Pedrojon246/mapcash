'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, CATEGORY_EMOJIS, CUTTABLE_CATEGORIES, currentMonth } from '@/lib/utils'
import { getDay, getHours } from 'date-fns'

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
  const day = getDay(new Date())
  const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
  const greetings: Record<number, string> = {
    0: '☀️ Ótimo domingo',
    1: '💪 Boa segunda',
    2: '🚀 Boa terça',
    3: '⚡ Boa quarta',
    4: '🎯 Boa quinta',
    5: '🎉 Boa sexta',
    6: '😎 Ótimo sábado',
  }
  return greetings[day]
}

function buildMessage(data: GreetingData): { message: string; sub: string; type: 'warning' | 'ok' | 'great' } {
  const firstName = data.userName.split(' ')[0]

  // Ultrapassou algum orçamento
  if (data.overBudget.length > 0) {
    const worst = data.overBudget[0]
    const emoji = CATEGORY_EMOJIS[worst.category] || '⚠️'
    const catName = worst.category === 'food_out'
      ? 'lanchinhos'
      : worst.category === 'entertainment'
      ? 'lazer'
      : worst.category === 'shopping'
      ? 'compras'
      : 'gastos'

    const overBy = worst.spent - worst.limit
    const tips: Record<string, string> = {
      food_out: 'Que tal cozinhar em casa hoje?',
      entertainment: 'Uma caminhada não custa nada 😄',
      shopping: 'Coloca na lista pra comprar no mês que vem.',
      travel: 'Já deu pra esse mês!',
    }
    const tip = tips[worst.category] || 'Segura as pontas!'

    return {
      message: `${emoji} Ei ${firstName}, extrapolou em ${catName}`,
      sub: `${formatCurrency(overBy)} acima do limite. ${tip}`,
      type: 'warning',
    }
  }

  // Perto do limite em algo
  if (data.nearBudget.length > 0) {
    const near = data.nearBudget[0]
    const emoji = CATEGORY_EMOJIS[near.category] || '⚡'
    const remaining = near.limit - near.spent
    const tips: Record<string, string> = {
      food_out: `Só ${formatCurrency(remaining)} restando pra lanches — vale a pena?`,
      entertainment: `${formatCurrency(remaining)} restando pra lazer esse mês.`,
      shopping: `Quase no limite de compras. Respira fundo! 😅`,
    }
    const tip = tips[near.category] || `${formatCurrency(remaining)} restando no orçamento.`

    return {
      message: `${emoji} Atenção ${firstName}!`,
      sub: tip,
      type: 'warning',
    }
  }

  // Está economizando bem
  if (data.savings > 0 && data.totalIncome > 0) {
    const savingsPct = Math.round((data.savings / data.totalIncome) * 100)
    if (savingsPct >= 20) {
      return {
        message: `🌟 Excelente, ${firstName}!`,
        sub: `Você está guardando ${savingsPct}% da renda. Continue assim!`,
        type: 'great',
      }
    }
    if (savingsPct >= 10) {
      return {
        message: `✅ Tudo nos trilhos, ${firstName}`,
        sub: `${savingsPct}% da renda guardada este mês. Bom ritmo!`,
        type: 'ok',
      }
    }
  }

  // Sem dados ainda
  if (data.totalExpenses === 0 && data.totalIncome === 0) {
    return {
      message: `👋 Olá, ${firstName}!`,
      sub: 'Adicione seu primeiro lançamento e comece a mapear seu dinheiro.',
      type: 'ok',
    }
  }

  // Neutro
  return {
    message: `👋 Olá, ${firstName}!`,
    sub: 'Seu resumo do mês está atualizado.',
    type: 'ok',
  }
}

export function Greeting() {
  const [data, setData] = useState<GreetingData | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { data: txData }, { data: budgetsData }] = await Promise.all([
        supabase.from('profiles').select('name').eq('user_id', user.id).single(),
        supabase.from('transactions').select('type,amount,category')
          .eq('user_id', user.id)
          .gte('date', currentMonth() + '-01')
          .lte('date', currentMonth() + '-31'),
        supabase.from('budgets').select('category,monthly_limit')
          .eq('user_id', user.id)
          .eq('month', currentMonth()),
      ])

      const userName = profile?.name || user.email?.split('@')[0] || 'você'
      const expenses = (txData || []).filter((t: any) => t.type === 'expense')
      const totalIncome = (txData || []).filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0)
      const totalExpenses = expenses.reduce((s: number, t: any) => s + t.amount, 0)

      // Spending by category
      const spendByCategory: Record<string, number> = {}
      expenses.forEach((t: any) => {
        spendByCategory[t.category] = (spendByCategory[t.category] || 0) + t.amount
      })

      // Check budgets
      const overBudget: GreetingData['overBudget'] = []
      const nearBudget: GreetingData['nearBudget'] = []

      ;(budgetsData || []).forEach((b: any) => {
        const spent = spendByCategory[b.category] || 0
        const pct = (spent / b.monthly_limit) * 100
        if (spent > b.monthly_limit) {
          overBudget.push({ category: b.category, spent, limit: b.monthly_limit })
        } else if (pct >= 80) {
          nearBudget.push({ category: b.category, spent, limit: b.monthly_limit, pct })
        }
      })

      // Sort by worst first (cuttable categories first)
      overBudget.sort((a, b) =>
        CUTTABLE_CATEGORIES.includes(b.category) ? 1 : -1
      )

      setData({
        userName,
        overBudget,
        nearBudget,
        savings: Math.max(totalIncome - totalExpenses, 0),
        totalExpenses,
        totalIncome,
      })
    }
    load()
  }, [supabase])

  if (!data) return (
    <div className="mx-5 mb-4 p-4 rounded-2xl skeleton h-20" />
  )

  const timeGreeting = getTimeGreeting()
  const dayGreeting = getDayGreeting()
  const { message, sub, type } = buildMessage(data)

  const bgColor = type === 'warning'
    ? 'bg-[#FF9500]/10 border-[#FF9500]/20'
    : type === 'great'
    ? 'bg-[#34C759]/10 border-[#34C759]/20'
    : 'bg-card border-border/50'

  return (
    <div className={`mx-5 mb-2 p-4 rounded-2xl border shadow-apple-sm animate-slide-up ${bgColor}`}>
      <p className="text-xs font-medium text-muted-foreground mb-0.5">
        {dayGreeting} · {timeGreeting}
      </p>
      <p className="font-semibold text-[15px] leading-snug">{message}</p>
      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{sub}</p>
    </div>
  )
}
