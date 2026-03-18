// app/api/webhooks/mercadopago/route.ts
// Webhook que llama MP cuando se confirma un pago
// Configurar en: Mercado Pago → Developers → Webhooks
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getPaymentStatus } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envía type: "payment" con el id del pago
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = String(body.data?.id)
    const payment   = await getPaymentStatus(paymentId)

    if (!payment.external_reference) {
      return NextResponse.json({ error: 'No external_reference' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Mapear estado de MP a nuestro estado
    const paymentStatus =
      payment.status === 'approved' ? 'pagado'   :
      payment.status === 'rejected' ? 'rechazado' : 'pendiente'

    await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        mp_payment_id:  paymentId,
        // Si el pago está aprobado, mover a cocina automáticamente
        ...(paymentStatus === 'pagado' ? { status: 'en_cocina' } : {}),
      })
      .eq('id', payment.external_reference)

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('[webhook/mp]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
