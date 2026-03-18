// app/admin/cocina/page.tsx — Monitor KDS para la pantalla de cocina
// Se pone en una pantalla dentro de la cocina. Tiempo real, alertas sonoras.
'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatOrderNumber, timeAgo } from '@/lib/utils'
import type { Order, OrderItem } from '@/types'

export default function CocinaPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const supabase = createClient()

  const loadOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('status', ['recibido', 'en_cocina'])
      .order('created_at', { ascending: true }) // más antiguo primero
    if (data) setOrders(data as Order[])
  }, [])

  useEffect(() => {
    loadOrders()

    const channel = supabase
      .channel('kds-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadOrders)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, loadOrders)
      .subscribe()

    // Alerta sonora para nuevos pedidos
    const newChannel = supabase
      .channel('kds-new')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        playAlert()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(newChannel)
    }
  }, [loadOrders])

  function playAlert() {
    try {
      const ctx  = new AudioContext()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      // Tres beeps cortos
      ;[0, 0.15, 0.3].forEach(t => {
        osc.frequency.setValueAtTime(1200, ctx.currentTime + t)
        gain.gain.setValueAtTime(0.4, ctx.currentTime + t)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.1)
      })
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }

  async function advanceItem(itemId: string, current: string) {
    const next = current === 'pendiente' ? 'en_preparacion' : 'terminado'
    await supabase.from('order_items').update({ item_status: next }).eq('id', itemId)
    loadOrders()
  }

  async function prepareAll(orderId: string) {
    await supabase
      .from('order_items')
      .update({ item_status: 'en_preparacion' })
      .eq('order_id', orderId)
      .eq('item_status', 'pendiente')
    // Mover pedido a en_cocina
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'en_cocina' }),
    })
    loadOrders()
  }

  async function markReady(orderId: string) {
    await supabase
      .from('order_items')
      .update({ item_status: 'terminado' })
      .eq('order_id', orderId)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'listo' }),
    })
    loadOrders()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-[22px] font-extrabold text-white">
          🍳 Monitor de cocina
        </h1>
        <div className="flex items-center gap-2 text-[12px] text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          En vivo
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
          <span className="text-6xl mb-4">✅</span>
          <p className="text-lg font-semibold">Sin pedidos pendientes</p>
          <p className="text-sm">Los nuevos pedidos aparecen acá automáticamente</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {orders.map(order => (
            <KdsCard
              key={order.id}
              order={order}
              onAdvanceItem={advanceItem}
              onPrepareAll={() => prepareAll(order.id)}
              onMarkReady={() => markReady(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── KdsCard ───────────────────────────────────────────────
function KdsCard({ order, onAdvanceItem, onPrepareAll, onMarkReady }: {
  order: Order
  onAdvanceItem: (itemId: string, current: string) => void
  onPrepareAll:  () => void
  onMarkReady:   () => void
}) {
  // Tiempo transcurrido desde que entró el pedido
  const [elapsed, setElapsed] = useState('')
  useEffect(() => {
    function tick() {
      const diff  = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000)
      const mm    = String(Math.floor(diff / 60)).padStart(2, '0')
      const ss    = String(diff % 60).padStart(2, '0')
      setElapsed(`${mm}:${ss}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [order.created_at])

  const allReady = order.items?.every(i => i.item_status === 'terminado')
  const isUrgent = (() => {
    const diff = (Date.now() - new Date(order.created_at).getTime()) / 60000
    return diff > 20
  })()

  return (
    <div className={`rounded-[16px] overflow-hidden border flex flex-col ${
      isUrgent ? 'border-red-500' : 'border-[#2a2a2a]'
    } bg-[#1a1a1a]`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${
        isUrgent ? 'bg-red-500/20' : 'bg-[#242424]'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-display text-[17px] font-extrabold text-white">
            {formatOrderNumber(order.order_number)}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            order.type === 'delivery'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {order.type === 'delivery' ? 'Delivery' : 'Retiro'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[14px] font-bold ${isUrgent ? 'text-red-400' : 'text-gray-300'}`}>
            {elapsed}
          </span>
        </div>
      </div>

      {/* Info cliente */}
      <div className="px-4 py-2 border-b border-[#2a2a2a]">
        <p className="text-[13px] font-semibold text-gray-200">{order.customer_name}</p>
        {order.scheduled_for && (
          <p className="text-[11px] text-amber-400">⏰ Programado: {order.scheduled_for}</p>
        )}
      </div>

      {/* Ítems con estado individual */}
      <div className="flex flex-col divide-y divide-[#2a2a2a] flex-1">
        {order.items?.map(item => (
          <ItemRow key={item.id} item={item} onAdvance={() => onAdvanceItem(item.id, item.item_status)} />
        ))}
      </div>

      {/* Acciones */}
      <div className="p-3 flex gap-2 bg-[#1a1a1a] border-t border-[#2a2a2a]">
        {!allReady ? (
          <button onClick={onPrepareAll}
            className="flex-1 bg-[#FF6B35] text-white text-[13px] font-bold py-2.5 rounded-[10px]
                       shadow-[0_2px_12px_rgba(255,107,53,0.35)]">
            Preparar todo
          </button>
        ) : (
          <button onClick={onMarkReady}
            className="flex-1 bg-green-600 text-white text-[13px] font-bold py-2.5 rounded-[10px]
                       shadow-[0_2px_12px_rgba(34,197,94,0.3)]">
            ✓ Marcar listo
          </button>
        )}
      </div>
    </div>
  )
}

// ── ItemRow ───────────────────────────────────────────────
function ItemRow({ item, onAdvance }: { item: OrderItem; onAdvance: () => void }) {
  const STATUS_CONFIG = {
    pendiente:        { label: 'Pendiente',   icon: '⏱️', color: 'text-gray-400', bg: 'bg-gray-500/15' },
    en_preparacion:   { label: 'Preparando',  icon: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    terminado:        { label: 'Terminado',   icon: '✅', color: 'text-green-400', bg: 'bg-green-500/15' },
  }
  const cfg = STATUS_CONFIG[item.item_status as keyof typeof STATUS_CONFIG]

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-gray-100">
          {item.quantity}× {item.product_name}
        </p>
        {item.observations && (
          <p className="text-[12px] text-amber-300 mt-0.5 italic">⚠️ {item.observations}</p>
        )}
      </div>
      {/* Toggle de estado */}
      <button
        onClick={onAdvance}
        disabled={item.item_status === 'terminado'}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                    text-[11px] font-bold transition-all ${cfg.bg} ${cfg.color}
                    disabled:cursor-default`}
      >
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
        {item.item_status !== 'terminado' && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        )}
      </button>
    </div>
  )
}
