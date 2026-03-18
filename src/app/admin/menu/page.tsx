// app/admin/menu/page.tsx — Gestión del menú (productos, precios, disponibilidad)
'use client'
import { useState, useEffect } from 'react'
import { createClient }  from '@/lib/supabase/client'
import { formatPrice }   from '@/lib/utils'
import { BRANDS }        from '@/constants'
import type { Product, BrandSlug } from '@/types'
import toast             from 'react-hot-toast'

export default function MenuAdminPage() {
  const [products,  setProducts]  = useState<Product[]>([])
  const [filter,    setFilter]    = useState<BrandSlug | 'todos'>('todos')
  const [editing,   setEditing]   = useState<Product | null>(null)
  const [showForm,  setShowForm]  = useState(false)
  const supabase = createClient()

  async function loadProducts() {
    let q = supabase
      .from('products')
      .select('*')
      .order('available', { ascending: false }) // disponibles primero
      .order('brand')
      .order('sort_order')
    if (filter !== 'todos') q = q.eq('brand', filter)
    const { data } = await q
    if (data) setProducts(data as Product[])
  }

  useEffect(() => { loadProducts() }, [filter])

  async function toggleAvailable(product: Product) {
    await supabase.from('products').update({ available: !product.available }).eq('id', product.id)
    toast.success(product.available ? 'Producto deshabilitado' : 'Producto habilitado')
    loadProducts()
  }

  function handleEdit(product: Product) {
    setEditing(product)
    setShowForm(true)
  }

  function handleNew() {
    setEditing(null)
    setShowForm(true)
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-[20px] font-extrabold text-[var(--text)]">Menú</h1>
        <button onClick={handleNew}
          className="bg-accent text-white text-[13px] font-bold px-4 py-2 rounded-[10px]
                     shadow-[0_2px_8px_rgba(255,107,53,0.3)]">
          + Agregar producto
        </button>
      </div>

      {/* Filtro por marca */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
        <button onClick={() => setFilter('todos')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold ${
            filter === 'todos' ? 'bg-accent text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'
          }`}>
          Todos
        </button>
        {BRANDS.map(b => (
          <button key={b.slug} onClick={() => setFilter(b.slug)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold ${
              filter === b.slug ? 'bg-accent text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'
            }`}>
            {b.emoji} {b.name}
          </button>
        ))}
      </div>

      {/* Tabla de productos */}
      <div className="flex flex-col gap-2">
        {/* Productos disponibles */}
        {products.filter(p => p.available).map(product => (
          <ProductRow key={product.id} product={product} onToggle={toggleAvailable} onEdit={handleEdit} />
        ))}

        {/* Separador si hay productos deshabilitados */}
        {products.some(p => !p.available) && (
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Sin stock hoy
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
        )}

        {/* Productos deshabilitados */}
        {products.filter(p => !p.available).map(product => (
          <ProductRow key={product.id} product={product} onToggle={toggleAvailable} onEdit={handleEdit} />
        ))}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadProducts() }}
        />
      )}
    </div>
  )
}

// ── ProductRow ────────────────────────────────────────────
function ProductRow({ product, onToggle, onEdit }: {
  product: Product
  onToggle: (p: Product) => void
  onEdit:   (p: Product) => void
}) {
  return (
    <div className={`flex items-center gap-3 bg-[var(--surface)] border rounded-[12px] p-3
                     transition-all duration-200 ${
                       !product.available
                         ? 'opacity-50 border-[var(--border)]'
                         : 'border-[var(--border)]'
                     }`}>
      {/* Emoji de marca */}
      <div className="w-12 h-12 rounded-[8px] bg-[var(--surface-3)] flex-shrink-0 flex items-center justify-center text-xl">
        {BRANDS.find(b => b.slug === product.brand)?.emoji ?? '🍽️'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-[var(--text)] truncate">{product.name}</p>
          {!product.available && (
            <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">
              Sin stock
            </span>
          )}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] truncate">{product.description}</p>
        <p className="text-[12px] font-bold text-accent mt-0.5">{formatPrice(product.price)}</p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onToggle(product)}
          className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${
            product.available ? 'bg-green-500' : 'bg-[var(--surface-3)]'
          }`}>
          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${
            product.available ? 'left-5' : 'left-1'
          }`} />
        </button>
        <button onClick={() => onEdit(product)}
          className="w-8 h-8 flex items-center justify-center bg-[var(--surface-2)]
                     border border-[var(--border)] rounded-[8px] text-sm">
          ✏️
        </button>
      </div>
    </div>
  )
}

// ── ProductForm ───────────────────────────────────────────
function ProductForm({ product, onClose, onSaved }: {
  product: Product | null
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const isNew    = !product

  const [form, setForm] = useState({
    name:        product?.name        ?? '',
    description: product?.description ?? '',
    price:       String(product?.price ?? ''),
    brand:       (product?.brand       ?? 'lomito') as BrandSlug,
    category:    product?.category    ?? '',
    sort_order:  String(product?.sort_order ?? 0),
  })
  const [saving, setSaving] = useState(false)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son obligatorios')
      return
    }
    setSaving(true)
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       Number(form.price),
      brand:       form.brand,
      category:    form.category.trim(),
      sort_order:  Number(form.sort_order),
    }

    if (isNew) {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { toast.error('Error al crear'); setSaving(false); return }
      toast.success('Producto creado')
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', product!.id)
      if (error) { toast.error('Error al guardar'); setSaving(false); return }
      toast.success('Producto actualizado')
    }
    onSaved()
  }

  const fields: { key: string; label: string; type?: string; placeholder?: string }[] = [
    { key: 'name',        label: 'Nombre *',     placeholder: 'Lomito clásico' },
    { key: 'description', label: 'Descripción',  placeholder: 'Lomo, lechuga, tomate...' },
    { key: 'price',       label: 'Precio (ARS) *', type: 'number', placeholder: '4800' },
    { key: 'category',    label: 'Categoría',    placeholder: 'lomitos, burgers...' },
    { key: 'sort_order',  label: 'Orden',        type: 'number', placeholder: '0' },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[var(--surface)] rounded-[20px] border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <p className="font-display text-[16px] font-bold text-[var(--text)]">
            {isNew ? 'Nuevo producto' : 'Editar producto'}
          </p>
          <button onClick={onClose} className="text-[var(--text-muted)] text-xl leading-none">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Marca */}
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
              Marca *
            </label>
            <div className="flex gap-2 flex-wrap">
              {BRANDS.map(b => (
                <button key={b.slug} onClick={() => set('brand', b.slug)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold ${
                    form.brand === b.slug ? 'bg-accent text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'
                  }`}>
                  {b.emoji} {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Campos */}
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                {f.label}
              </label>
              <input
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-[8px]
                           px-3 py-2 text-[14px] text-[var(--text)] outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-[var(--border)]">
          <button onClick={onClose}
            className="flex-1 h-11 border border-[var(--border)] rounded-[10px] text-[var(--text-muted)] text-[13px] font-semibold">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-11 bg-accent text-white rounded-[10px] text-[13px] font-bold
                       disabled:opacity-50 shadow-[0_2px_8px_rgba(255,107,53,0.3)]">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}