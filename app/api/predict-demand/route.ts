import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createSupabaseServerClient()

  // Ventas de los últimos 30 días
  const { data: sales } = await supabase
    .from('sale_items')
    .select('product_id, quantity, sales(created_at)')
    .gte('sales.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const totals: Record<number, number> = {}
  ;(sales || []).forEach((s: any) => {
    totals[s.product_id] = (totals[s.product_id] || 0) + s.quantity
  })

  // Proyección simple: demand = ventas recientes * 1.5
  const predictions = Object.entries(totals).map(([productId, qty]) => ({
    product_id: Number(productId),
    projected_demand: qty * 1.5,
  }))

  return NextResponse.json(predictions)
}
