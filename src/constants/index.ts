// ─────────────────────────────────────────────────────────
// constants/index.ts — Valores fijos de la app
// Para cambiar un nombre o color: solo acá, en un lugar.
// ─────────────────────────────────────────────────────────

import type { Brand, BrandSlug, OrderStatus } from '@/types'

// ── Marcas ────────────────────────────────────────────────
export const BRANDS: Brand[] = [
  { slug: 'lomito',   name: 'Club del Lomito', emoji: '🥖', color: '#FF6B35' },
  { slug: 'burger',   name: 'La Burger Club',  emoji: '🍔', color: '#FF6B35' },
  { slug: 'milanesa', name: 'Milanesa',        emoji: '🍖', color: '#FF6B35' },
  { slug: 'brolas',   name: 'Brolas',          emoji: '🍨', color: '#8b5cf6' },
  { slug: 'bebidas',  name: 'Bebidas',         emoji: '🥤', color: '#3b82f6' },
  { slug: 'extras',   name: 'Extras',          emoji: '➕', color: '#22c55e' },
]

export const BRAND_MAP = Object.fromEntries(
  BRANDS.map(b => [b.slug, b])
) as Record<BrandSlug, Brand>

// ── Categorías que disparan cross-sell ────────────────────
// Si el carrito NO tiene ningún producto de estas categorías → mostrar sugerencia
export const CROSS_SELL_RULES = {
  bebidas:  { trigger: 'bebidas',  title: '¿Te olvidaste la bebida?',   subtitle: 'Completá tu pedido con algo para tomar' },
  postres:  { trigger: 'brolas',   title: '¿Y el postre? — Brolas',     subtitle: 'Cerrá el pedido con algo dulce' },
} as const

// ── Estados de pedidos ────────────────────────────────────
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  recibido:   'Recibido',
  en_cocina:  'En cocina',
  listo:      'Listo',
  en_camino:  'En camino',
  entregado:  'Entregado',
  cancelado:  'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  recibido:   'bg-blue-500/15 text-blue-400',
  en_cocina:  'bg-amber-500/15 text-amber-400',
  listo:      'bg-green-500/15 text-green-400',
  en_camino:  'bg-purple-500/15 text-purple-400',
  entregado:  'bg-gray-500/15 text-gray-400',
  cancelado:  'bg-red-500/15 text-red-400',
}

// ── Métodos de pago ───────────────────────────────────────
export const PAYMENT_LABELS = {
  mp_credito:      'Tarjeta de crédito (MP)',
  mp_debito:       'Tarjeta de débito (MP)',
  transferencia:   'Transferencia bancaria',
  efectivo:        'Efectivo',
  pos_repartidor:  'Tarjeta en puerta (POS)',
  pos_local:       'Tarjeta en local (POS)',
} as const

// ── Horarios de atención ──────────────────────────────────
// Editá acá si cambian los horarios
export const BUSINESS_HOURS = [
  { label: '12:00 a 15:00' },
  { label: '20:00 a 23:45' },
]

// ── Config general ────────────────────────────────────────
export const APP_NAME = 'Dark Kitchen'
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

// ── Feature flags ─────────────────────────────────────────
// Para activar una feature: cambiar la env var a "true"
export const FEATURES = {
  coupons:      process.env.NEXT_PUBLIC_FEATURE_COUPONS       === 'true',
  stockControl: process.env.NEXT_PUBLIC_FEATURE_STOCK_CONTROL === 'true',
  pedidosYa:    process.env.NEXT_PUBLIC_FEATURE_PEDIDOSYA     === 'true',
}
