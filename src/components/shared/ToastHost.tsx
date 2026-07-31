import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import type { Toast } from '../../hooks/useToast'

const ICON = { success: CheckCircle2, error: AlertCircle, info: Info }
const COLOR = { success: 'var(--emerald)', error: 'var(--red)', info: 'var(--navy)' }

export default function ToastHost({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: 'fixed', bottom: 88, right: 24, zIndex: 400, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      {toasts.map(t => {
        const Icon = ICON[t.kind]
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 10,
            background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
            fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', maxWidth: 340,
          }}>
            <Icon size={17} style={{ color: COLOR[t.kind], flexShrink: 0 }} />
            {t.message}
          </div>
        )
      })}
    </div>
  )
}
