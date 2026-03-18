// app/api/products/route.ts
// GET /api/products?brand=lomito  — devuelve productos del menú
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const brand    = req.nextUrl.searchParams.get('brand')
  const search   = req.nextUrl.searchParams.get('q')

  let query = supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .order('sort_order', { ascending: true })

  if (brand)  query = query.eq('brand', brand)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
