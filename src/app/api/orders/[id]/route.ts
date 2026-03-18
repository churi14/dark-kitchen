// app/api/orders/[id]/route.ts
// PATCH /api/orders/:id — actualizar estado, delivery_cost, item_status
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface PatchBody {
  status?:        string
  delivery_cost?: number
  payment_status?: string
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: PatchBody = await req.json()
    const supabase = createAdminClient()

    const updateData: Record<string, unknown> = {}
    if (body.status         !== undefined) updateData.status         = body.status
    if (body.delivery_cost  !== undefined) {
      updateData.delivery_cost = body.delivery_cost
      // Recalcular total cuando se asigna el delivery_cost
      const { data: order } = await supabase
        .from('orders')
        .select('subtotal')
        .eq('id', params.id)
        .single()
      if (order) updateData.total = order.subtotal + body.delivery_cost
    }
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)

  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}
