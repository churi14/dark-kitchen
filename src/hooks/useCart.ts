// ─────────────────────────────────────────────────────────
// hooks/useCart.ts — Estado global del carrito con Zustand
// Todo el carrito vive acá. Los componentes solo consumen.
// ─────────────────────────────────────────────────────────
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, BrandSlug } from '@/types'

interface CartStore {
  items: CartItem[]

  // Acciones
  addItem:    (product: Product, observations: string) => void
  removeItem: (productId: string) => void
  updateQty:  (productId: string, qty: number) => void
  clearCart:  () => void

  // Computed (getters)
  totalItems:    () => number
  subtotal:      () => number
  hasBrand:      (slug: BrandSlug) => boolean
  hasCategory:   (category: string) => boolean
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, observations) => {
        const existing = get().items.find(i => i.product.id === product.id)
        if (existing) {
          // Si ya existe, suma la cantidad
          set(state => ({
            items: state.items.map(i =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }))
        } else {
          set(state => ({
            items: [...state.items, {
              product,
              quantity:     1,
              observations,
              unit_price:   product.price,
            }],
          }))
        }
      },

      removeItem: (productId) =>
        set(state => ({
          items: state.items.filter(i => i.product.id !== productId),
        })),

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      // ── Getters ──────────────────────────────────────────
      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),

      // ¿El carrito tiene algún producto de esta marca?
      hasBrand: (slug) =>
        get().items.some(i => i.product.brand === slug),

      // ¿El carrito tiene algún producto de esta categoría?
      hasCategory: (category) =>
        get().items.some(i => i.product.category === category),
    }),
    {
      name: 'dk-cart', // key en localStorage
    }
  )
)
