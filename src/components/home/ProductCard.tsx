// components/home/ProductCard.tsx
// Card individual de producto en el menú
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
  const router = useRouter()
  const addItem = useCart(s => s.addItem)

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation() // no navegar al detalle
    addItem(product, '')
  }

  return (
    <div
      onClick={() => router.push(`/producto/${product.id}`)}
      className="flex gap-0 bg-[var(--surface-2)] rounded-card border border-[var(--border)]
                 overflow-hidden cursor-pointer active:scale-[.98] transition-transform duration-150"
    >
      {/* Imagen */}
      <div className="w-[84px] h-[84px] flex-shrink-0 bg-[var(--surface-3)] flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <Image
            src={productImageUrl(product.image_url)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="84px"
          />
        ) : (
          <span className="text-2xl opacity-40">🍽️</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between p-2.5 pl-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)] leading-tight">
            {product.name}
          </p>
          {product.description && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-display text-[15px] font-bold text-accent">
            {formatPrice(product.price)}
          </span>

          {/* Botón + rápido */}
          <button
            onClick={handleQuickAdd}
            className="w-[30px] h-[30px] bg-accent rounded-[8px] text-white text-[18px]
                       flex items-center justify-center leading-none active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}