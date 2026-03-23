// components/home/ProductCard.tsx
'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatPrice, productImageUrl } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const router  = useRouter()
  const addItem = useCart(s => s.addItem)

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation()
    addItem(product, '')
  }

  return (
    <div
      onClick={() => router.push(`/producto/${product.id}`)}
      className="flex items-center gap-3 bg-[var(--surface)] rounded-[12px] border border-[var(--border)]
                 p-3 cursor-pointer active:scale-[.98] transition-transform duration-150"
    >
      {/* Info — izquierda */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--text)] leading-tight">
          {product.name}
        </p>
        {product.description && (
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="font-display text-[15px] font-bold text-accent">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleQuickAdd}
            className="w-7 h-7 bg-accent rounded-full text-white text-[18px]
                       flex items-center justify-center leading-none active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      </div>

      {/* Foto — derecha */}
      <div className="w-[90px] h-[90px] flex-shrink-0 rounded-[10px] overflow-hidden bg-[var(--surface-2)] relative">
        {product.image_url ? (
          <Image
            src={productImageUrl(product.image_url)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="90px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl opacity-20">🍽️</span>
          </div>
        )}
      </div>
    </div>
  )
}