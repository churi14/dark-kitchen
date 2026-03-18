// components/home/CartBar.tsx
// Barra flotante inferior que aparece cuando hay items en el carrito
'use client'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'

export default function CartBar() {
  const router     = useRouter()
  const totalItems = useCart(s => s.totalItems())
  const subtotal   = useCart(s => s.subtotal())

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <button
        onClick={() => router.push('/carrito')}
        className="w-full max-w-[430px] mx-auto flex items-center justify-between
                   bg-accent rounded-[14px] px-4 py-3.5 pointer-events-auto
                   shadow-[0_8px_24px_rgba(255,107,53,0.4)] active:scale-[.98] transition-transform"
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-white/25 text-white text-[12px] font-bold px-2 py-0.5 rounded-[6px]">
            {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
          </span>
          <span className="text-white text-[13px] font-semibold">
            Ver carrito → Checkout
          </span>
        </div>
        <span className="font-display text-white text-[15px] font-extrabold">
          {formatPrice(subtotal)}
        </span>
      </button>
    </div>
  )
}
