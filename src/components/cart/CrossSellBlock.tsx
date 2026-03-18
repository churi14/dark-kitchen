// components/cart/CrossSellBlock.tsx
// Bloque de cross-selling en el carrito
// Se muestra si el cliente no tiene bebidas / postres de Brolas
'use client'
import { useState, useEffect } from 'react'
import { useCart }    from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { CROSS_SELL_RULES } from '@/constants'
import type { Product } from '@/types'

interface Props {
  type: 'bebidas' | 'brolas'
}

const STYLES = {
  bebidas: {
    border:    'border-accent',
    bg:        'bg-accent/10',
    titleColor: 'text-accent',
    btnBg:     'bg-accent',
  },
  brolas: {
    border:    'border-[#8b5cf6]',
    bg:        'bg-[#8b5cf6]/10',
    titleColor: 'text-[#8b5cf6]',
    btnBg:     'bg-[#8b5cf6]',
  },
}

export default function CrossSellBlock({ type }: Props) {
  const addItem  = useCart(s => s.addItem)
  const hasBrand = useCart(s => s.hasBrand)

  const [products, setProducts] = useState<Product[]>([])
  const [hidden,   setHidden]   = useState(false)

  // Ocultar si el usuario ya agregó uno
  const alreadyHas = hasBrand(type)

  useEffect(() => {
    fetch(`/api/products?brand=${type}&limit=3`)
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => {})
  }, [type])

  function handleAdd(product: Product) {
    addItem(product, '')
    setHidden(true)
  }

  if (hidden || alreadyHas || products.length === 0) return null

  const rule  = type === 'bebidas' ? CROSS_SELL_RULES.bebidas : CROSS_SELL_RULES.postres
  const style = STYLES[type]

  return (
    <div className={`mx-5 mt-3 rounded-[16px] border ${style.border} ${style.bg} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-1">
        <span className="text-[18px]">{type === 'bebidas' ? '🥤' : '🍨'}</span>
        <span className={`text-[13px] font-bold ${style.titleColor}`}>{rule.title}</span>
      </div>
      <p className="px-3.5 pb-2 text-[11px] text-[var(--text-muted)]">{rule.subtitle}</p>

      {/* Cards scrolleables */}
      <div className="flex gap-2 px-3.5 pb-3.5 overflow-x-auto scrollbar-hide">
        {products.map(product => (
          <div key={product.id}
               className="flex-shrink-0 w-[110px] bg-[var(--surface)] rounded-[12px]
                          border border-[var(--border)] overflow-hidden cursor-pointer"
               onClick={() => handleAdd(product)}>
            <div className="h-[56px] bg-[var(--surface-2)] flex items-center justify-center text-[22px]">
              {type === 'bebidas' ? '🥤' : '🍦'}
            </div>
            <div className="p-2">
              <p className="text-[11px] font-semibold text-[var(--text)] leading-tight line-clamp-2">
                {product.name}
              </p>
              <p className={`font-display text-[12px] font-bold mt-1 ${style.titleColor}`}>
                {formatPrice(product.price)}
              </p>
            </div>
            <button className={`w-full ${style.btnBg} text-white text-[11px] font-bold py-1.5`}>
              + Agregar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}