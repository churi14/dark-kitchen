// app/carrito/page.tsx — Pantalla del carrito
'use client'
import { useRouter }       from 'next/navigation'
import { useCart }         from '@/hooks/useCart'
import { formatPrice, cn } from '@/lib/utils'
import { FEATURES }        from '@/constants'
import CrossSellBlock      from '@/components/cart/CrossSellBlock'

export default function CartPage() {
  const router     = useRouter()
  const items      = useCart(s => s.items)
  const updateQty  = useCart(s => s.updateQty)
  const removeItem = useCart(s => s.removeItem)
  const subtotal   = useCart(s => s.subtotal())
  const hasBrand   = useCart(s => s.hasBrand)

  const showBebidas = !hasBrand('bebidas')
  const showBrolas  = !hasBrand('brolas')

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="font-display text-xl font-bold text-[var(--text)]">Tu carrito está vacío</h2>
        <p className="text-sm text-[var(--text-muted)]">Volvé al menú y agregá lo que se te antoje</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 bg-accent text-white font-semibold text-sm px-6 py-3 rounded-[10px]
                     shadow-[0_4px_16px_rgba(255,107,53,0.3)]"
        >
          Ver menú
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-[430px] mx-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)]
                        flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-[var(--surface-2)] rounded-full flex items-center justify-center flex-shrink-0"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                 style={{ color: 'var(--text)' }}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span className="font-display text-[18px] font-extrabold text-[var(--text)]">Tu pedido</span>
          <span className="ml-auto bg-accent/15 text-accent text-[12px] font-bold px-3 py-0.5 rounded-full">
            {items.reduce((s, i) => s + i.quantity, 0)} ítems
          </span>
        </div>

        {/* Items */}
        <div className="px-5 py-3 flex flex-col gap-2.5">
          {items.map(item => (
            <div key={item.product.id}
                 className="flex bg-[var(--surface-2)] rounded-card border border-[var(--border)] overflow-hidden">
              {/* Imagen */}
              <div className="w-[72px] h-[72px] flex-shrink-0 bg-[var(--surface-3)] flex items-center justify-center text-2xl">
                🍽️
              </div>
              {/* Cuerpo */}
              <div className="flex-1 flex flex-col justify-between p-2.5 pl-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)] leading-tight">
                      {item.product.name}
                    </p>
                    {item.observations && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 italic">
                        {item.observations}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)]
                               text-sm rounded hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-display text-[14px] font-bold text-accent">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                  {/* Selector qty */}
                  <div className="flex items-center bg-[var(--surface-3)] rounded-[8px] overflow-hidden">
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 text-[16px] text-[var(--text-muted)] flex items-center justify-center"
                    >−</button>
                    <span className="min-w-[22px] text-center text-[13px] font-bold text-[var(--text)]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 text-[16px] text-[var(--text)] flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cross-sell: bebidas */}
        {showBebidas && <CrossSellBlock type="bebidas" />}

        {/* Cross-sell: postres Brolas */}
        {showBrolas && <CrossSellBlock type="brolas" />}

        {/* Cupón (deshabilitado hasta activar feature) */}
        {FEATURES.coupons ? (
          <div className="mx-5 mt-3 p-3 bg-[var(--surface-2)] rounded-[12px] border border-[var(--border)]">
            {/* TODO: CouponInput component */}
            <p className="text-sm text-[var(--text-muted)]">Ingresá tu cupón</p>
          </div>
        ) : (
          <div className="mx-5 mt-3 p-3 bg-[var(--surface-2)] rounded-[12px] border border-dashed
                          border-[var(--border)] opacity-40 cursor-not-allowed flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🏷️</span>
              <span className="text-[13px] text-[var(--text-muted)]">¿Tenés un cupón?</span>
            </div>
            <span className="text-[10px] font-bold bg-[var(--surface-3)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
              Próximamente
            </span>
          </div>
        )}

        {/* Resumen */}
        <div className="mx-5 mt-3 bg-[var(--surface-2)] rounded-[14px] p-3.5 border border-[var(--border)]">
          <div className="flex justify-between py-1">
            <span className="text-[13px] text-[var(--text-muted)]">Subtotal</span>
            <span className="text-[13px] font-semibold text-[var(--text)]">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[13px] text-[var(--text-muted)]">Costo de envío</span>
            <span className="text-[12px] text-[var(--text-muted)] italic">A confirmar</span>
          </div>
          <div className="h-px bg-[var(--border)] my-2" />
          <div className="flex justify-between">
            <span className="font-display text-[15px] font-bold text-[var(--text)]">Total</span>
            <span className="font-display text-[16px] font-extrabold text-accent">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border)] leading-relaxed">
            ⚡ El costo de envío se cotiza una vez confirmado el pedido. Te avisamos por{' '}
            <span className="text-accent font-semibold">WhatsApp</span>.
          </p>
        </div>

        {/* CTA */}
        <div className="px-5 pt-3 pb-8">
          <button
            onClick={() => router.push('/checkout')}
            className="w-full h-[50px] bg-accent rounded-[12px] text-white font-bold text-[15px]
                       shadow-[0_4px_16px_rgba(255,107,53,0.3)] active:scale-[.98] transition-transform"
          >
            Continuar al checkout →
          </button>
        </div>

      </div>
    </main>
  )
}
