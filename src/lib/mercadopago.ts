// ─────────────────────────────────────────────────────────
// lib/mercadopago.ts — Integración con Mercado Pago
// Solo se usa en API routes (server-side).
// ─────────────────────────────────────────────────────────
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import type { Order } from '@/types'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

// ── Crear preferencia de pago ─────────────────────────────
// Devuelve la URL de checkout de Mercado Pago
export async function createPreference(order: Order) {
  const preference = new Preference(client)

  const items = order.items.map(item => ({
    id:          item.product_id,
    title:       item.product_name,
    quantity:    item.quantity,
    unit_price:  item.unit_price,
    currency_id: 'ARS',
  }))

  const result = await preference.create({
    body: {
      items,
      payer: {
        name:  order.customer_name,
        phone: { number: order.customer_phone },
        email: order.customer_email ?? undefined,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacion?order=${order.id}&status=success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=payment_failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacion?order=${order.id}&status=pending`,
      },
      auto_return:        'approved',
      external_reference: order.id,
      statement_descriptor: 'DARK KITCHEN',
    },
  })

  return result
}

// ── Consultar estado de un pago ───────────────────────────
export async function getPaymentStatus(paymentId: string) {
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}
