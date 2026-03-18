// components/home/OrderTypeToggle.tsx
// Switch entre Delivery y Para retirar
'use client'
import { cn } from '@/lib/utils'

type OrderType = 'delivery' | 'retiro'

interface Props {
  value:    OrderType
  onChange: (v: OrderType) => void
}

export default function OrderTypeToggle({ value, onChange }: Props) {
  return (
    <div className="flex bg-[var(--surface-2)] rounded-[10px] p-1 gap-1 border border-[var(--border)]">
      {(['delivery', 'retiro'] as const).map(type => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            'flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold transition-all duration-200',
            value === type
              ? 'bg-accent text-white'
              : 'bg-transparent text-[var(--text-muted)]'
          )}
        >
          {type === 'delivery' ? 'Delivery' : 'Para retirar'}
        </button>
      ))}
    </div>
  )
}
