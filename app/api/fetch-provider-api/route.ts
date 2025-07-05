import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createEmbedding } from '@/lib/openai'
import { normalizeCode } from '@/lib/utils'

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()
  const { partnerId, apiUrl, authType, apiKey, dataPath = '', mapping = {} } = await req.json()
  if (!partnerId || !apiUrl) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  try {
    const headers: Record<string, string> = {}
    if (authType === 'bearer' && apiKey) headers['Authorization'] = `Bearer ${apiKey}`
    if (authType === 'api_key' && apiKey) headers['api-key'] = apiKey
    const res = await fetch(apiUrl, { headers })
    const json = await res.json()
    const data = dataPath ? dataPath.split('.').reduce((o, k) => o?.[k], json) : json
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Respuesta no válida' }, { status: 400 })
    }

    const products = [] as any[]
    for (const r of data) {
      const sku = String(r[mapping.sku || 'sku'] || '')
      const name = String(r[mapping.name || 'name'] || 'Sin Nombre')
      const description = String(r[mapping.description || 'description'] || '')
      const brand = String(r[mapping.brand || 'brand'] || '')
      const category = String(r[mapping.category || 'category'] || '')
      const price = Number(r[mapping.price || 'price']) || 0
      const stock = Number(r[mapping.stock || 'stock']) || 0
      const embedding = await createEmbedding(`${name} ${brand} ${description}`)
      products.push({
        sku,
        normalized_code: normalizeCode(sku),
        name,
        description,
        brand,
        category,
        price,
        stock,
        partner_id: partnerId,
        embedding,
      })
    }

    const { error: upsertError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'sku' })

    if (upsertError) {
      console.error('Error upsert', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    await supabase.from('data_sources').upsert({
      partner_id: partnerId,
      source_type: 'api',
      config: { apiUrl, authType, dataPath },
    }, { onConflict: 'partner_id' })

    await supabase.from('data_source_mappings').upsert({
      partner_id: partnerId,
      mapping,
      source_type: 'api',
    }, { onConflict: 'partner_id' })

    return NextResponse.json({ message: `Se importaron ${products.length} productos` })
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error: 'Error al conectar al API' }, { status: 500 })
  }
}
