// ─────────────────────────────────────────────────────────
// types/index.ts  — Tipos globales del proyecto
// Cada entidad del negocio tiene su tipo acá.
// ─────────────────────────────────────────────────────────

// ── Marcas / Categorías ──────────────────────────────────
export type BrandSlug = 'lomito' | 'burger' | 'milanesa' | 'brolas' | 'bebidas' | 'extras'

export interface Brand {
  slug: BrandSlug
  name: string
  emoji: string
  color: string // CSS color para accent de la marca
}

// ── Productos ────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  description: string
  price: number            // en pesos ARS (sin decimales)
  image_url: string | null
  brand: BrandSlug
  category: string         // subcategoría dentro de la marca
  available: boolean       // si está activo hoy
  sort_order: number       // orden de aparición en el menú
  created_at: string
  updated_at: string
}

// ── Carrito (solo frontend, no persiste en DB) ────────────
export interface CartItem {
  product: Product
  quantity: number
  observations: string     // "sin ajo", "bien cocido", etc.
  unit_price: number       // precio al momento de agregar
}

// ── Pedidos ──────────────────────────────────────────────
export type OrderType    = 'delivery' | 'retiro'
export type OrderStatus  = 'recibido' | 'en_cocina' | 'listo' | 'en_camino' | 'entregado' | 'cancelado'
export type PaymentMethod = 'mp_credito' | 'mp_debito' | 'transferencia' | 'efectivo' | 'pos_repartidor' | 'pos_local'
export type PaymentStatus = 'pendiente' | 'pagado' | 'rechazado'
export type OrderSource   = 'online' | 'presencial' | 'pedidosya' // extensible

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string     // snapshot del nombre al momento del pedido
  unit_price: number
  quantity: number
  subtotal: number
  observations: string
  item_status: 'pendiente' | 'en_preparacion' | 'terminado' // para KDS
}

export interface Order {
  id: string
  order_number: number     // número visible (#2313)
  source: OrderSource
  type: OrderType
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  mp_payment_id: string | null

  // Cliente
  customer_name: string
  customer_phone: string
  customer_email: string | null

  // Delivery
  delivery_address: string | null
  delivery_floor: string | null
  delivery_notes: string | null
  delivery_cost: number | null  // lo carga la secretaria

  // Horario
  scheduled_for: string | null  // null = lo antes posible

  // Totales
  subtotal: number
  total: number

  items: OrderItem[]

  created_at: string
  updated_at: string
}

// ── Checkout form (frontend) ──────────────────────────────
export interface CheckoutForm {
  type: OrderType
  scheduled_for: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_address: string
  delivery_floor: string
  delivery_notes: string
  payment_method: PaymentMethod
}

// ── Admin ─────────────────────────────────────────────────
export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'cocina' | 'secretaria'
}

// ── Notificaciones push ───────────────────────────────────
export interface PushSubscription {
  id: string
  user_id: string | null
  endpoint: string
  keys: Record<string, string>
  created_at: string
}

// ── Feature flags ─────────────────────────────────────────
export interface FeatureFlags {
  coupons: boolean
  stockControl: boolean
  pedidosYa: boolean
}
