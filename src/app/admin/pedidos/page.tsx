// app/admin/pedidos/page.tsx — Dashboard de pedidos en tiempo real
'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient }   from '@/lib/supabase/client'
import { formatPrice, formatOrderNumber, timeAgo } from '@/lib/utils'
import { StatusBadge }    from '@/components/shared/Badge'
import { ORDER_STATUS_LABELS } from '@/constants'
import type { Order, OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['recibido', 'en_cocina', 'listo', 'en_camino', 'entregado']

export default function PedidosPage() {
  const [orders,      setOrders]      = useState<Order[]>([])
  const [filter,      setFilter]      = useState<OrderStatus | 'todos'>('recibido')
  const [deliveryCost, setDeliveryCost] = useState<Record<string, string>>({})

  const supabase = createClient()

  const loadOrders = useCallback(async () => {
    let q = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter !== 'todos') q = q.eq('status', filter)

    const { data } = await q
    if (data) setOrders(data as Order[])
  }, [filter])

  useEffect(() => {
    loadOrders()

    // Suscripción en tiempo real
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadOrders)
      .subscribe()

    // Alerta sonora al entrar nuevo pedido
    const alertChannel = supabase
      .channel('orders-new')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        playAlert()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(alertChannel)
    }
  }, [loadOrders])

  function playAlert() {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadOrders()
  }

  async function assignDeliveryCost(orderId: string) {
    const cost = Number(deliveryCost[orderId])
    if (!cost || isNaN(cost)) return
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_cost: cost }),
    })
    setDeliveryCost(d => ({ ...d, [orderId]: '' }))
    loadOrders()
  }

  const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
    recibido:  'en_cocina',
    en_cocina: 'listo',
    listo:     'en_camino',
    en_camino: 'entregado',
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-[20px] font-extrabold text-[var(--text)]">Pedidos</h1>
          <p className="text-[12px] text-[var(--text-muted)]">Actualización en tiempo real</p>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="En vivo" />
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
        {(['todos', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              filter === s
                ? 'bg-accent text-white'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'
            }`}>
            {s === 'todos' ? 'Todos' : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Cards de pedidos */}
      {orders.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] text-sm py-12">No hay pedidos en este estado</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              deliveryCost={deliveryCost[order.id] ?? ''}
              onDeliveryCostChange={v => setDeliveryCost(d => ({ ...d, [order.id]: v }))}
              onAssignCost={() => assignDeliveryCost(order.id)}
              onAdvance={() => {
                const next = NEXT_STATUS[order.status]
                if (next) updateStatus(order.id, next)
              }}
              onCancel={() => updateStatus(order.id, 'cancelado')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── OrderCard ──────────────────────────────────────────────
function OrderCard({ order, deliveryCost, onDeliveryCostChange, onAssignCost, onAdvance, onCancel }: {
  order: Order
  deliveryCost: string
  onDeliveryCostChange: (v: string) => void
  onAssignCost: () => void
  onAdvance: () => void
  onCancel: () => void
}) {
  const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
    recibido:  '→ Pasar a cocina',
    en_cocina: '→ Marcar listo',
    listo:     '→ En camino',
    en_camino: '→ Entregado',
  }
  const nextLabel = NEXT_LABEL[order.status]

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="font-display text-[15px] font-bold text-[var(--text)]">
            {formatOrderNumber(order.order_number)}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            order.type === 'delivery'
              ? 'bg-blue-500/15 text-blue-400'
              : 'bg-purple-500/15 text-purple-400'
          }`}>
            {order.type === 'delivery' ? 'Delivery' : 'Retiro'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-muted)]">{timeAgo(order.created_at)}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Cliente */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <p className="text-[13px] font-semibold text-[var(--text)]">{order.customer_name}</p>
        <p className="text-[12px] text-[var(--text-muted)]">{order.customer_phone}</p>
        {order.delivery_address && (
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">📍 {order.delivery_address}</p>
        )}
      </div>

      {/* Ítems */}
      <div className="px-4 py-3 border-b border-[var(--border)] space-y-1">
        {order.items?.map(item => (
          <div key={item.id} className="flex justify-between">
            <span className="text-[13px] text-[var(--text)]">
              {item.quantity}× {item.product_name}
              {item.observations && (
                <span className="text-[var(--text-muted)] italic"> — {item.observations}</span>
              )}
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex justify-between text-[12px]">
          <span className="text-[var(--text-muted)]">Subtotal</span>
          <span className="text-[var(--text)]">{formatPrice(order.subtotal)}</span>
        </div>
        {order.type === 'delivery' && (
          <div className="flex justify-between text-[12px] mt-1">
            <span className="text-[var(--text-muted)]">Envío</span>
            {order.delivery_cost != null
              ? <span className="text-[var(--text)]">{formatPrice(order.delivery_cost)}</span>
              : (
                /* La secretaria asigna el costo */
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="$0"
                    value={deliveryCost}
                    onChange={e => onDeliveryCostChange(e.target.value)}
                    className="w-20 text-right bg-[var(--surface-2)] border border-[var(--border)]
                               rounded-[6px] px-2 py-0.5 text-[12px] text-[var(--text)] outline-none
                               focus:border-accent"
                  />
                  <button onClick={onAssignCost}
                    className="bg-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-[6px]">
                    OK
                  </button>
                </div>
              )
            }
          </div>
        )}
        <div className="flex justify-between mt-1 pt-1 border-t border-[var(--border)]">
          <span className="text-[13px] font-bold text-[var(--text)]">Total</span>
          <span className="text-[13px] font-bold text-accent">{formatPrice(order.total)}</span>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-1">
          Pago: {order.payment_method.replace('_', ' ')} ·{' '}
          <span className={order.payment_status === 'pagado' ? 'text-green-400' : 'text-amber-400'}>
            {order.payment_status}
          </span>
        </p>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 px-4 py-3">
        {nextLabel && (
          <button onClick={onAdvance}
            className="flex-1 bg-accent text-white text-[12px] font-bold py-2 rounded-[8px]
                       shadow-[0_2px_8px_rgba(255,107,53,0.3)]">
            {nextLabel}
          </button>
        )}
        {order.status !== 'entregado' && order.status !== 'cancelado' && (
          <button onClick={onCancel}
            className="px-3 py-2 bg-red-500/10 text-red-400 text-[12px] font-bold rounded-[8px]
                       border border-red-500/20">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
