import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { query } = await req.json()
  if (!query) return NextResponse.json([], { status: 400 })

  const prompt = `Eres un asistente de base de datos. Convierte la siguiente consulta de usuario para una óptica en un objeto JSON con los campos posibles: brand, category, minPrice, maxPrice, attributes. Responde solo con el JSON. Consulta: "${query}"`

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

  let q = supabase.from('products').select('*')
  if (filters.brand) q = q.ilike('brand', `%${filters.brand}%`)
  if (filters.category) q = q.ilike('category', `%${filters.category}%`)
  if (filters.minPrice) q = q.gte('price', filters.minPrice)
  if (filters.maxPrice) q = q.lte('price', filters.maxPrice)
  if (filters.attributes) {
    Object.entries(filters.attributes).forEach(([key, value]) => {
      q = q.contains('attributes', { [key]: value })
    })
  }

  const { data } = await q
  return NextResponse.json(data)
}
