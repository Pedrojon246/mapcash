'use client'
import * as React from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

type ToastInput = Omit<Toast, 'id'>

const listeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []
let count = 0

function dispatch(t: Toast[]) {
  toasts = t
  listeners.forEach(l => l(toasts))
}

export function toast(input: ToastInput) {
  const id = String(++count)
  const newToast = { ...input, id }
  dispatch([...toasts, newToast])
  setTimeout(() => dispatch(toasts.filter(t => t.id !== id)), 3500)
  return id
}

export function useToast() {
  const [state, setState] = React.useState<Toast[]>(toasts)
  React.useEffect(() => {
    listeners.push(setState)
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1) }
  }, [])
  return { toasts: state, toast, dismiss: (id: string) => dispatch(toasts.filter(t => t.id !== id)) }
}
