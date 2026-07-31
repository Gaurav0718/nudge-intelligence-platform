import { useState, useCallback } from 'react'

export interface Toast { id: string; message: string; kind: 'success' | 'error' | 'info' }

/** Minimal toast hook — matches Growth §11 convention. */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }, [])
  return { toasts, push }
}
