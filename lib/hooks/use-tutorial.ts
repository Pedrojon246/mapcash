'use client'
import { useState, useEffect } from 'react'

export type TutorialScreen = 
  | 'wallet' | 'budget' | 'goals' 
  | 'investments' | 'groups' | 'reports'

const STORAGE_KEY = 'mapcash_tutorials_seen'

export function useTutorial(screen: TutorialScreen) {
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const seen = getSeen()
    if (!seen.includes(screen)) {
      // Small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
    setReady(true)
  }, [screen])

  function dismiss() {
    markSeen(screen)
    setVisible(false)
    setReady(true)
  }

  function skipAll() {
  const all: TutorialScreen[] = ['wallet','budget','goals','investments','groups','reports']
  const seen = getSeen()
  const merged = seen.concat(all.filter(s => !seen.includes(s)))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  setVisible(false)
  setReady(true)
}

  return { visible, dismiss, skipAll, ready }
}

export function useShowTutorial(screen: TutorialScreen) {
  const [visible, setVisible] = useState(false)

  function open() { setVisible(true) }
  function close() { setVisible(false) }

  return { visible, open, close }
}

function getSeen(): TutorialScreen[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function markSeen(screen: TutorialScreen) {
  const seen = getSeen()
  if (!seen.includes(screen)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, screen]))
  }
}

export function resetAllTutorials() {
  localStorage.removeItem(STORAGE_KEY)
}

export const TUTORIALS: Record<TutorialScreen, { title: string; steps: { icon: string; title: string; text: string }[] }> = {
  wallet: {
    title: 'Carteira',
    steps: [
      {
        icon: '💳',
        title: 'Seu resumo mensal',
        text: 'O card no topo mostra seu saldo, receitas e despesas do mês atual. O saldo é a diferença entre tudo que entrou e saiu.',
      },
      {
        icon: '➕',
        title: 'Lançar entradas e saídas',
        text: 'Toque em "Novo lançamento" para registrar qualquer movimentação — salário, compras, contas, tudo entra aqui.',
      },
      {
        icon: '📂',
        title: 'Categorias separadas',
        text: 'Cada lançamento tem uma categoria. Supermercado e restaurante são separados para você ver exatamente onde está gastando mais.',
      },
      {
        icon: '✏️',
        title: 'Editar ou excluir',
        text: 'Toque em qualquer lançamento para editá-lo. No desktop, passe o mouse para aparecer o botão de excluir.',
      },
    ],
  },
  budget: {
    title: 'Orçamento',
    steps: [
      {
        icon: '🎯',
        title: 'Defina limites por categoria',
        text: 'Aqui você define quanto quer gastar em cada categoria por mês — alimentação, transporte, lazer, etc.',
      },
      {
        icon: '📊',
        title: 'Acompanhe em tempo real',
        text: 'A barra de progresso mostra quanto você já usou do limite. Fica laranja quando passa de 80% e vermelha quando estoura.',
      },
      {
        icon: '🔔',
        title: 'Alerta na Carteira',
        text: 'Quando você está próximo ou acima do limite, a saudação na Carteira avisa com uma mensagem personalizada.',
      },
    ],
  },
  goals: {
    title: 'Metas',
    steps: [
      {
        icon: '✈️',
        title: 'Crie metas com propósito',
        text: 'Escolha um emoji, defina um valor alvo e uma data. O app calcula quanto você precisa guardar por mês para chegar lá.',
      },
      {
        icon: '💰',
        title: 'Adicione contribuições',
        text: 'Toda vez que guardar dinheiro para uma meta, toque no "+" dela e registre o valor. O progresso atualiza na hora.',
      },
      {
        icon: '🎉',
        title: 'Meta concluída',
        text: 'Quando o valor atual atingir o alvo, a meta é marcada como concluída automaticamente. Hora de comemorar!',
      },
    ],
  },
  investments: {
    title: 'Investimentos',
    steps: [
      {
        icon: '📈',
        title: 'Indicadores ao vivo',
        text: 'Selic, CDI e IPCA são atualizados direto do Banco Central. Toque em cada um para entender o que significa na prática.',
      },
      {
        icon: '📰',
        title: 'Notícias do mercado',
        text: 'Manchetes de portais financeiros atualizadas automaticamente. Não precisa ser especialista — é só contexto do que está acontecendo.',
      },
      {
        icon: '🎯',
        title: 'Suas metas aqui também',
        text: 'O botão "Minhas metas" leva para suas metas de poupança. Guardar com objetivo é o primeiro passo para investir.',
      },
    ],
  },
  groups: {
    title: 'Grupos',
    steps: [
      {
        icon: '👥',
        title: 'Divida gastos com amigos',
        text: 'Crie um grupo para qualquer evento — viagem, churrasco, aluguel compartilhado. Todo mundo registra e o app divide automaticamente.',
      },
      {
        icon: '🔗',
        title: 'Convide pelo link ou e-mail',
        text: 'Copie o link de convite para mandar no WhatsApp, ou convide pelo e-mail de alguém que já tem conta. Quem não tem conta pode entrar como convidado.',
      },
      {
        icon: '⚖️',
        title: 'Veja quem deve quanto',
        text: 'A aba "Saldos" mostra em verde quem tem a receber e em vermelho quem ainda precisa pagar.',
      },
    ],
  },
  reports: {
    title: 'Relatórios',
    steps: [
      {
        icon: '🍕',
        title: 'Gastos por categoria',
        text: 'O gráfico de pizza mostra exatamente onde foi seu dinheiro este mês, com o percentual de cada categoria.',
      },
      {
        icon: '📅',
        title: 'Gastos por dia',
        text: 'O gráfico de barras mostra em quais dias você gastou mais — útil para identificar padrões e dias problemáticos.',
      },
    ],
  },
}
