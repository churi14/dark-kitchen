// app/producto/[id]/page.tsx — Pantalla de detalle de producto
'use client'
import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import Image                   from 'next/image'
import { useCart }             from '@/hooks/useCart'
import { formatPrice, productImageUrl, cn } from '@/lib/utils'
import { BRAND_MAP }           from '@/constants'
import toast                   from 'react-hot-toast'
import type { Product }        from '@/types'

export default function ProductPage({ params }: { params: { id: string } }) {
  const router       = useRouter()
  const addItem      = useCart(s => s.addItem)

  const [product,      setProduct]      = useState<Product | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [qty,          setQty]          = useState(1)
  const [observations, setObservations] = useState('')

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(setProduct)
      .catch(() => router.back())
      .finally(() => setLoading(false))
  }, [params.id])

  function handleAdd() {
    if (!product) return
    // Agregar qty veces al carrito
    for (let i = 0; i < qty; i++) {
      addItem(product, observations)
    }
    toast.success(`${product.name} agregado al carrito`)
    router.back()
  }

  if (loading || !product) {
    return (
      <div className="max-w-[430px] mx-auto">
        <div className="h-[240px] bg-[var(--surface-3)] animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-6 bg-[var(--surface-2)] rounded animate-pulse w-3/4" />
          <div className="h-4 bg-[var(--surface-2)] rounded animate-pulse" />
          <div className="h-4 bg-[var(--surface-2)] rounded animate-pulse w-2/3" />
        </div>
      </div>
    )
  }

  const brand    = BRAND_MAP[product.brand]
  const total    = product.price * qty

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-[430px] mx-auto">

        {/* Hero imagen */}
        <div className="relative h-[240px] bg-[var(--surface-3)] flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <Image
              src={productImageUrl(product.image_url)}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <span className="text-[80px] filter drop-shadow-lg">🍽️</span>
          )}
          {/* Degradado inferior */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--surface)] to-transparent" />

          {/* Botón volver */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-9 h-9 bg-black/50 backdrop-blur rounded-full
                       flex items-center justify-center z-10"
          >
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Badge de marca */}
          <span className="absolute top-4 right-4 bg-accent text-white text-[11px] font-bold px-3 py-1 rounded-full z-10">
            {brand?.name ?? product.brand}
          </span>
        </div>

        {/* Info */}
        <div className="px-5 pt-5">
          <h1 className="font-display text-[20px] font-extrabold text-[var(--text)] uppercase tracking-tight leading-tight">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-[13px] text-[var(--text-muted)] mt-2 leading-relaxed">
              {product.description}
            </p>
          )}
          <p className="font-display text-[26px] font-extrabold text-accent mt-3">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Divider */}
        <div className="mx-5 my-4 h-px bg-[var(--border)]" />

        {/* Comentarios */}
        <div className="px-5">
          <p className="text-[12px] font-bold text-[var(--text)] uppercase tracking-wider mb-1">
            Comentarios
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mb-2">
            ¿Querés sacar o agregar algo? Avisanos acá
          </p>
          <textarea
            value={observations}
            onChange={e => setObservations(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Ej: sin cebolla, sin ajo, bien cocido..."
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-[10px]
                       px-3.5 py-3 text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)]
                       resize-none outline-none focus:border-accent transition-colors leading-relaxed"
          />
          <p className="text-[11px] text-[var(--text-muted)] text-right mt-1">
            {observations.length} / 200
          </p>
        </div>

        {/* Cantidad + botón agregar */}
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-8">
          {/* Selector cantidad */}
          <div className="flex items-center bg-[var(--surface-2)] rounded-[10px] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-[42px] h-[46px] text-[22px] text-[var(--text-muted)] flex items-center justify-center active:bg-[var(--surface-3)] transition-colors"
            >
              −
            </button>
            <div className="w-px h-6 bg-[var(--border)]" />
            <span className="min-w-[36px] text-center font-display text-[16px] font-bold text-[var(--text)]">
              {qty}
            </span>
            <div className="w-px h-6 bg-[var(--border)]" />
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-[42px] h-[46px] text-[22px] text-[var(--text)] flex items-center justify-center active:bg-[var(--surface-3)] transition-colors"
            >
              +
            </button>
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleAdd}
            className="flex-1 h-[46px] bg-accent rounded-[10px] text-white font-semibold text-[13px]
                       flex items-center justify-between px-4
                       shadow-[0_4px_16px_rgba(255,107,53,0.3)] active:scale-[.97] transition-transform"
          >
            <span>Agregar a mi pedido</span>
            <span className="font-display font-extrabold text-[15px]">{formatPrice(total)}</span>
          </button>
        </div>

      </div>
    </main>
  )
}
