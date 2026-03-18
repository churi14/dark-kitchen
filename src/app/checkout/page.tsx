// app/checkout/page.tsx — Pantalla de checkout
'use client'
import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { useCart }             from '@/hooks/useCart'
import { formatPrice }         from '@/lib/utils'
import { BUSINESS_HOURS }      from '@/constants'
import Input                   from '@/components/shared/Input'
import toast                   from 'react-hot-toast'
import type { CheckoutForm, PaymentMethod } from '@/types'

export default function CheckoutPage() {
  const router    = useRouter()
  const items     = useCart(s => s.items)
  const subtotal  = useCart(s => s.subtotal())
  const clearCart = useCart(s => s.clearCart)

  const [mounted,  setMounted]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [schedMode, setSchedMode] = useState<'now' | 'later'>('now')

  useEffect(() => { setMounted(true) }, [])

  const [form, setForm] = useState<CheckoutForm>({
    type:             'delivery',
    scheduled_for:    null,
    customer_name:    '',
    customer_phone:   '',
    customer_email:   '',
    delivery_address: '',
    delivery_floor:   '',
    delivery_notes:   '',
    payment_method:   'mp_credito',
  })

  // Leer el tipo de pedido guardado en el menú
  useEffect(() => {
    const saved = sessionStorage.getItem('orderType') as 'delivery' | 'retiro' | null
    if (saved) setForm(f => ({ ...f, type: saved }))
  }, [])

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (items.length === 0) router.replace('/')
  }, [items])

  function set(key: keyof CheckoutForm, value: string | null) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function isDelivery() { return form.type === 'delivery' }

  function isOnlinePayment() {
    return ['mp_credito', 'mp_debito', 'transferencia'].includes(form.payment_method)
  }

  function isValid() {
    if (!form.customer_name.trim())  return false
    if (!form.customer_phone.trim()) return false
    if (isDelivery() && !form.delivery_address.trim()) return false
    return true
  }

  async function handleSubmit() {
    if (!isValid()) {
      toast.error('Completá los campos obligatorios')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, form, subtotal }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al crear el pedido')
        return
      }

      // Navegar PRIMERO, limpiar carrito después para evitar redirect a /
      if (data.mpInitPoint) {
        clearCart()
        window.location.href = data.mpInitPoint
        return
      }

      router.push(`/confirmacion?order=${data.orderId}&number=${data.orderNumber}`)
      setTimeout(() => clearCart(), 500)

    } catch {
      toast.error('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const payOnlineOptions: { value: PaymentMethod; label: string; sub: string; icon: string }[] = [
    { value: 'mp_credito',    label: 'Tarjeta de crédito', sub: 'Vía Mercado Pago',  icon: '💳' },
    { value: 'mp_debito',     label: 'Tarjeta de débito',  sub: 'Vía Mercado Pago',  icon: '💳' },
    { value: 'transferencia', label: 'Transferencia',       sub: 'CBU / Alias',       icon: '📲' },
  ]

  const payDoorOptions: { value: PaymentMethod; label: string; sub: string; icon: string }[] = isDelivery()
    ? [
        { value: 'efectivo',       label: 'Efectivo',         sub: 'El repartidor lleva cambio', icon: '💵' },
        { value: 'pos_repartidor', label: 'Tarjeta (POS)',     sub: 'El repartidor lleva posnet', icon: '💳' },
      ]
    : [
        { value: 'efectivo',   label: 'Efectivo',          sub: 'Pagás al retirar',             icon: '💵' },
        { value: 'pos_local',  label: 'Tarjeta (POS)',      sub: 'Clover / Payway en mostrador', icon: '💳' },
      ]

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-[430px] mx-auto">

        {/* Hero */}
        <div className="h-[100px] bg-[var(--surface-3)] relative overflow-hidden flex items-end">
          <div className="absolute inset-0 flex items-center justify-center text-[50px] opacity-20 tracking-widest">
            🥖🍔🍖🍨
          </div>
          <div className="relative z-10 px-5 pb-3 w-full">
            <button onClick={() => router.back()}
              className="mb-2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
              <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <p className="font-display text-[16px] font-extrabold text-[var(--text)]">
              Confirmá tu pedido
            </p>
          </div>
        </div>

        {/* Toggle delivery / retiro */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex bg-[var(--surface-2)] rounded-[10px] p-1 gap-1 border border-[var(--border)]">
            {(['delivery', 'retiro'] as const).map(t => (
              <button key={t} onClick={() => set('type', t)}
                className={`flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold transition-all ${
                  form.type === t ? 'bg-accent text-white' : 'bg-transparent text-[var(--text-muted)]'
                }`}>
                {t === 'delivery' ? 'Delivery' : 'Para retirar'}
              </button>
            ))}
          </div>
        </div>

        {/* Horario */}
        <div className="px-5 pb-4">
          <div className="bg-[var(--surface-2)] rounded-[12px] border border-[var(--border)] overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-3">
              <select value={schedMode} onChange={e => setSchedMode(e.target.value as 'now'|'later')}
                className="appearance-none border border-accent rounded-[8px] px-2.5 py-1.5 pr-6
                           text-[12px] font-semibold text-[var(--text)] bg-[var(--surface)] outline-none cursor-pointer">
                <option value="now">Lo antes posible</option>
                <option value="later">Programar pedido</option>
              </select>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-green-500/15 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Disponible
                </span>
                {BUSINESS_HOURS.map(h => (
                  <span key={h.label} className="text-[11px] text-[var(--text-muted)]">🕐 {h.label}</span>
                ))}
              </div>
            </div>
            {schedMode === 'later' && (
              <div className="flex gap-2 px-3.5 pb-3">
                <select className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[8px]
                                   px-2.5 py-2 text-[13px] text-[var(--text)] outline-none">
                  <option>Elegir día</option>
                  <option>Hoy</option><option>Mañana</option><option>Pasado mañana</option>
                </select>
                <select onChange={e => set('scheduled_for', e.target.value)}
                  className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[8px]
                             px-2.5 py-2 text-[13px] text-[var(--text)] outline-none">
                  <option value="">Elegir hora</option>
                  {['12:00','12:30','13:00','13:30','14:00','14:30',
                    '20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30']
                    .map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-[var(--border)] mx-5 mb-4" />

        {/* Datos personales */}
        <div className="px-5 pb-4">
          <p className="text-[12px] font-bold text-[var(--text)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" opacity=".6">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Datos generales
          </p>
          <div className="flex flex-col gap-4">
            <Input label="Correo electrónico"  type="email" placeholder="ejemplo@gmail.com"
              value={form.customer_email}  onChange={e => set('customer_email', e.target.value)} />
            <Input label="Nombre y apellido *" type="text"  placeholder="Juan García"
              value={form.customer_name}   onChange={e => set('customer_name', e.target.value)} />
            <Input label="Teléfono *"          type="tel"   placeholder="🇦🇷 011 15-2345-6789"
              value={form.customer_phone}  onChange={e => set('customer_phone', e.target.value)} />
          </div>
        </div>

        {/* Dirección (solo delivery) */}
        {isDelivery() && (
          <>
            <div className="h-px bg-[var(--border)] mx-5 mb-4" />
            <div className="px-5 pb-4">
              <p className="text-[12px] font-bold text-[var(--text)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" opacity=".6">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                Dirección de entrega
              </p>
              <div className="flex flex-col gap-4">
                <Input label="Calle y número *" placeholder="Av. Argentina 1234"
                  value={form.delivery_address} onChange={e => set('delivery_address', e.target.value)} />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input label="Piso / Depto" placeholder="1B"
                      value={form.delivery_floor} onChange={e => set('delivery_floor', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <Input label="Entre calles" placeholder="Opcional"
                      value={''} onChange={() => {}} />
                  </div>
                </div>
                <Input label="Referencia" placeholder="Portón negro, timbre roto..."
                  value={form.delivery_notes} onChange={e => set('delivery_notes', e.target.value)} />
              </div>
            </div>
          </>
        )}

        <div className="h-px bg-[var(--border)] mx-5 mb-4" />

        {/* Métodos de pago */}
        <div className="px-5 pb-4">
          <p className="text-[12px] font-bold text-[var(--text)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" opacity=".6">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Forma de pago *
          </p>

          {/* Grupo online */}
          <GroupLabel label="Pago online" />
          <div className="flex flex-col gap-2 mb-3">
            {payOnlineOptions.map(opt => (
              <PayRow key={opt.value} {...opt}
                selected={form.payment_method === opt.value}
                onSelect={() => set('payment_method', opt.value)}
                badge="Online" badgeColor="accent" />
            ))}
          </div>

          {/* Grupo presencial */}
          <GroupLabel label={isDelivery() ? 'Al entregar en tu puerta' : 'Al retirar en el local'} />
          <div className="flex flex-col gap-2">
            {payDoorOptions.map(opt => (
              <PayRow key={opt.value} {...opt}
                selected={form.payment_method === opt.value}
                onSelect={() => set('payment_method', opt.value)}
                badge={isDelivery() ? 'En puerta' : 'En local'} badgeColor="green" />
            ))}
          </div>
        </div>

        <div className="h-px bg-[var(--border)] mx-5 mb-4" />

        {/* Resumen del pedido */}
        <div className="mx-5 mb-4 bg-[var(--surface-2)] rounded-[14px] border border-[var(--border)] overflow-hidden">
          <p className="px-3.5 py-2.5 text-[12px] font-bold text-[var(--text)] uppercase tracking-wider
                        border-b border-[var(--border)]">
            Resumen
          </p>
          <div className="px-3.5 py-2.5 flex flex-col gap-1.5">
            {mounted && items.map(i => (
              <div key={i.product.id} className="flex justify-between">
                <span className="text-[12px] text-[var(--text)]">
                  x{i.quantity} {i.product.name}
                </span>
                <span className="text-[12px] text-[var(--text-muted)] font-semibold">
                  {formatPrice(i.unit_price * i.quantity)}
                </span>
              </div>
            ))}
            <div className="h-px bg-[var(--border)] my-1" />
            <div className="flex justify-between">
              <span className="text-[13px] text-[var(--text-muted)]">Subtotal</span>
              <span className="text-[13px] font-semibold text-[var(--text)]">
                {mounted ? formatPrice(subtotal) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[var(--text-muted)]">Costo de envío</span>
              <span className="text-[12px] text-[var(--text-muted)] italic">
                {isDelivery() ? 'A confirmar' : '—'}
              </span>
            </div>
          </div>
          <div className="flex justify-between px-3.5 py-2.5 bg-accent/10 border-t border-[var(--border)]">
            <span className="font-display text-[14px] font-bold text-[var(--text)]">Total</span>
            <span className="font-display text-[15px] font-extrabold text-accent">{mounted ? formatPrice(subtotal) : '—'}</span>
          </div>
        </div>

        {/* Botones */}
        <div className="px-5 pb-10 flex flex-col gap-2.5">
          <button onClick={handleSubmit} disabled={loading || !isValid()}
            className="w-full h-12 bg-accent rounded-[12px] text-white font-bold text-[14px]
                       shadow-[0_4px_16px_rgba(255,107,53,0.3)] disabled:opacity-40 disabled:cursor-not-allowed
                       active:scale-[.98] transition-transform flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isOnlinePayment() ? 'Ir a pagar →' : 'Confirmar pedido'}
          </button>
          <button onClick={() => router.back()}
            className="w-full h-11 bg-transparent border border-[var(--border)] rounded-[12px]
                       text-[var(--text-muted)] font-semibold text-[13px]">
            ← Volver al carrito
          </button>
        </div>

      </div>
    </main>
  )
}

// ── Sub-componentes internos ──────────────────────────────

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex-1 h-px bg-[var(--border)]" />
      <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  )
}

function PayRow({ value, label, sub, icon, selected, onSelect, badge, badgeColor }: {
  value: PaymentMethod; label: string; sub: string; icon: string
  selected: boolean; onSelect: () => void
  badge: string; badgeColor: 'accent' | 'green'
}) {
  const badgeClass = badgeColor === 'accent'
    ? 'bg-accent/15 text-accent'
    : 'bg-green-500/15 text-green-400'

  return (
    <div onClick={onSelect}
      className={`flex items-center gap-3 px-3.5 py-3 rounded-[10px] cursor-pointer border transition-all
        ${selected
          ? badgeColor === 'accent'
            ? 'border-accent bg-accent/8'
            : 'border-green-500 bg-green-500/8'
          : 'border-[var(--border)] bg-[var(--surface-2)]'
        }`}>
      {/* Radio */}
      <div className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
        ${selected
          ? badgeColor === 'accent' ? 'border-accent bg-accent' : 'border-green-500 bg-green-500'
          : 'border-[var(--border)]'
        }`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-[17px] flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-[var(--text)]">{label}</p>
        <p className="text-[11px] text-[var(--text-muted)]">{sub}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass}`}>
        {badge}
      </span>
    </div>
  )
}