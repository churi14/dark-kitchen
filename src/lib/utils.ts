// ─────────────────────────────────────────────────────────
// lib/utils.ts — Helpers reutilizables
// ─────────────────────────────────────────────────────────
import { clsx, type ClassValue } from 'clsx'

// Combinar clases de Tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Formatear precio en ARS
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style:    'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Formatear número de pedido con padding: 2313 → #2313
export function formatOrderNumber(n: number): string {
  return `#${n}`
}

// Tiempo relativo: "hace 5 min", "hace 1 h"
export function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)   return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

// Generar alias de Supabase Storage para una imagen de producto
export function productImageUrl(path: string | null): string {
  if (!path) return '/placeholder-product.png'
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${path}`
}
