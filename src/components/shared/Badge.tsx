// components/shared/Badge.tsx
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants'

interface BadgeProps {
  label:     string
  className?: string
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold', className)}>
      {label}
    </span>
  )
}

// Badge específico para estados de pedido
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      label={ORDER_STATUS_LABELS[status]}
      className={ORDER_STATUS_COLORS[status]}
    />
  )
}
