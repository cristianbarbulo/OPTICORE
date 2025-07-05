import { NextResponse } from 'next/server'
import { openai, createEmbedding } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import { normalizeCode } from '@/lib/utils'

export async function POST(req: Request) {
  const { query } = await req.json()
  if (!query) return NextResponse.json([], { status: 400 })

  const { data: brandRows } = await supabase.from('products').select('brand')
  const { data: categoryRows } = await supabase
    .from('products')
    .select('category')

  const brands = Array.from(
    new Set((brandRows || []).map((r) => r.brand).filter(Boolean))
  )
  const categories = Array.from(
    new Set((categoryRows || []).map((r) => r.category).filter(Boolean))
  )

  const prompt = `Eres un asistente de base de datos. Usa solo las siguientes marcas: ${brands.join(', ')} y las siguientes categorias: ${categories.join(', ')}. Convierte la siguiente consulta del usuario en un objeto JSON con los campos posibles: brand, category, minPrice, maxPrice, attributes. Responde solo con el JSON. Consulta: "${query}"`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  })

  const content = completion.choices[0].message.content || '{}'
  let filters: any = {}
  try {
    filters = JSON.parse(content)
  } catch (e) {
    console.error('JSON parse error', content)
  }

  const normalized = normalizeCode(query)
  let { data: exact } = await supabase
    .from('products')
    .select('*')
    .eq('normalized_code', normalized)

  if (exact && exact.length > 0) {
    return NextResponse.json(exact)
  }

  const embed = await createEmbedding(query)
  const { data: similar } = await supabase
    .rpc('match_products', { query_embedding: embed, match_count: 10 })

  let results = similar || []
  if (filters.brand) results = results.filter(r => r.brand?.toLowerCase().includes(String(filters.brand).toLowerCase()))
  if (filters.category) results = results.filter(r => r.category?.toLowerCase().includes(String(filters.category).toLowerCase()))
  if (filters.minPrice) results = results.filter(r => r.price >= filters.minPrice)
  if (filters.maxPrice) results = results.filter(r => r.price <= filters.maxPrice)

  return NextResponse.json(results)
}
