// app/page.tsx — Página principal del menú
'use client'
import { useState, useEffect } from 'react'
import StoreHeader      from '@/components/home/StoreHeader'
import OrderTypeToggle  from '@/components/home/OrderTypeToggle'
import SchedulePicker   from '@/components/home/SchedulePicker'
import SearchBar        from '@/components/home/SearchBar'
import CategoryBar      from '@/components/home/CategoryBar'
import ProductCard      from '@/components/home/ProductCard'
import CartBar          from '@/components/home/CartBar'
import ThemeToggle      from '@/components/shared/ThemeToggle'
import { BRANDS }       from '@/constants'
import type { Product, BrandSlug } from '@/types'

export default function MenuPage() {
  const [orderType,    setOrderType]    = useState<'delivery' | 'retiro'>('delivery')
  const [activeBrand,  setActiveBrand]  = useState<BrandSlug>('lomito')
  const [search,       setSearch]       = useState('')
  const [products,     setProducts]     = useState<Product[]>([])
  const [loading,      setLoading]      = useState(true)

  // Guardar el tipo de pedido en sessionStorage para usarlo en el checkout
  useEffect(() => {
    sessionStorage.setItem('orderType', orderType)
  }, [orderType])

  // Cargar productos cuando cambia la marca o el buscador
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search)            params.set('q', search)
        else if (activeBrand)  params.set('brand', activeBrand)

        const res  = await fetch(`/api/products?${params}`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeBrand, search])

  const brandInfo = BRANDS.find(b => b.slug === activeBrand)

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-[430px] mx-auto">

        {/* Toggle de tema arriba a la derecha */}
        <div className="flex justify-end px-5 pt-3">
          <ThemeToggle />
        </div>

        <StoreHeader />

        {/* Toggle Delivery / Retiro */}
        <div className="px-5 pt-3 pb-2">
          <OrderTypeToggle value={orderType} onChange={setOrderType} />
        </div>

        {/* Horario */}
        <div className="px-5 pb-3">
          <SchedulePicker onChange={v => sessionStorage.setItem('scheduledFor', v ?? '')} />
        </div>

        {/* Buscador */}
        <div className="px-5 pb-3">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Categorías / Marcas */}
        {!search && (
          <>
            <p className="px-5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Nuestras marcas
            </p>
            <CategoryBar active={activeBrand} onChange={brand => { setActiveBrand(brand); setSearch('') }} />
          </>
        )}

        {/* Título de sección */}
        <h2 className="px-5 pb-3 font-display text-[17px] font-bold text-[var(--text)]">
          {search
            ? `Resultados para "${search}"`
            : `${brandInfo?.emoji} ${brandInfo?.name}`}
        </h2>

        {/* Grid de productos */}
        <div className="px-5 flex flex-col gap-2.5 pb-32">
          {loading ? (
            // Skeleton loader
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[84px] bg-[var(--surface-2)] rounded-card animate-pulse border border-[var(--border)]" />
            ))
          ) : products.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] text-sm py-10">
              No hay productos disponibles
            </p>
          ) : (
            products.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>

      </div>

      {/* Barra del carrito flotante */}
      <CartBar />
    </main>
  )
}