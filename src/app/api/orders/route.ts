// app/api/orders/route.ts
// POST /api/orders — crea un pedido y opcionalmente inicia el pago MP
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createPreference } from '@/lib/mercadopago'
import type { CartItem, CheckoutForm, OrderItem } from '@/types'

interface CreateOrderBody {
  items:    CartItem[]
  form:     CheckoutForm
  subtotal: number
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderBody = await req.json()
    const { items, form, subtotal } = body

    if (!items?.length) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Insertar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        source:           'online',
        type:             form.type,
        status:           'recibido',
        payment_method:   form.payment_method,
        payment_status:   'pendiente',
        customer_name:    form.customer_name,
        customer_phone:   form.customer_phone,
        customer_email:   form.customer_email || null,
        delivery_address: form.delivery_address || null,
        delivery_floor:   form.delivery_floor   || null,
        delivery_notes:   form.delivery_notes   || null,
        scheduled_for:    form.scheduled_for    || null,
        subtotal,
        total: subtotal, // el delivery_cost lo agrega la secretaria después
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('[orders] insert error:', orderError)
      return NextResponse.json({ error: 'No se pudo crear el pedido' }, { status: 500 })
    }

    // 2. Insertar los ítems del pedido
    const orderItems: Omit<OrderItem, 'id'>[] = items.map(i => ({
      order_id:     order.id,
      product_id:   i.product.id,
      product_name: i.product.name,
      unit_price:   i.unit_price,
      quantity:     i.quantity,
      subtotal:     i.unit_price * i.quantity,
      observations: i.observations,
      item_status:  'pendiente',
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('[orders] items insert error:', itemsError)
      // No bloqueamos — el pedido ya está creado
    }

    // 3. Si paga online (MP), crear la preferencia
    let mpInitPoint: string | null = null

    if (['mp_credito', 'mp_debito'].includes(form.payment_method)) {
      try {
        const preference = await createPreference({ ...order, items: orderItems as OrderItem[] })
        mpInitPoint = preference.init_point ?? null

        // Guardar el preference_id en el pedido
        await supabase
          .from('orders')
          .update({ mp_payment_id: preference.id })
          .eq('id', order.id)
      } catch (mpError) {
        console.error('[orders] MP preference error:', mpError)
        // No falla el pedido si MP falla — se puede reintentar
      }
    }

    return NextResponse.json({
      orderId:    order.id,
      orderNumber: order.order_number,
      mpInitPoint,
    })

  } catch (err) {
    console.error('[orders] unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
