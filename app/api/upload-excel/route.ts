import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { read, utils } from 'xlsx'
import Papa from 'papaparse'
import { createEmbedding } from '@/lib/openai'
import { normalizeCode } from '@/lib/utils'

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const partnerId = formData.get('partnerId') as string | null
  const mappingStr = formData.get('mapping') as string | null

  if (!file || !partnerId) {
    return NextResponse.json({ error: 'Falta el archivo o el ID del socio.' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const filePath = `uploads/${Date.now()}-${file.name}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('excel')
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Error de Supabase Storage:', uploadError)
    return NextResponse.json({ error: `Error al subir el archivo: ${uploadError.message}` }, { status: 500 })
  }

  try {
    let rows: any[] = []
    if (file.name.endsWith('.csv')) {
      const text = new TextDecoder().decode(arrayBuffer)
      rows = (Papa.parse(text, { header: true }).data as any[]).filter(Boolean)
    } else {
      const workbook = read(arrayBuffer)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = utils.sheet_to_json(sheet)
    }

    let mapping: Record<string, string> = {}
    if (mappingStr) {
      try {
        mapping = JSON.parse(mappingStr)
      } catch (e) {
        console.error('JSON mapping parse error', mappingStr)
      }
    }

    const get = (row: any, key: string) => {
      const col = mapping[key] || key
      return row[col]
    }

<<<<<<< HEAD
    const products = rows.map((r) => ({
      sku: String(get(r, 'sku') || ''),
      name: String(get(r, 'name') || 'Sin Nombre'),
      description: String(get(r, 'description') || ''),
      brand: String(get(r, 'brand') || ''),
      category: String(get(r, 'category') || ''),
      price: Number(get(r, 'price')) || 0,
      stock: Number(get(r, 'stock')) || 0,
      partner_id: parseInt(partnerId!, 10),
    }))
=======
    const products = [] as any[]
    for (const r of rows) {
      const sku = String(get(r, 'sku') || '')
      const name = String(get(r, 'name') || 'Sin Nombre')
      const description = String(get(r, 'description') || '')
      const brand = String(get(r, 'brand') || '')
      const category = String(get(r, 'category') || '')
      const price = Number(get(r, 'price')) || 0
      const stock = Number(get(r, 'stock')) || 0
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
        partner_id: parseInt(partnerId!, 10),
        embedding,
      })
    }
>>>>>>> actualizar-opticore-v2

    // --- MEJORA IMPLEMENTADA ---
    // Usamos .upsert() en lugar de .insert().
    // 'onConflict' le dice a Supabase que si encuentra un producto con el mismo 'sku',
    // en lugar de dar un error, debe actualizar el producto existente.
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'sku' })


    if (upsertError) {
      console.error('Error de Supabase DB (Upsert):', upsertError)
      await supabase.storage.from('excel').remove([filePath])
      return NextResponse.json({ error: `Error al procesar productos: ${upsertError.message}` }, { status: 500 })
    }

    await supabase
      .from('data_source_mappings')
      .upsert(
        { partner_id: parseInt(partnerId!, 10), mapping, source_type: 'excel' },
        { onConflict: 'partner_id' }
      )

    await supabase.from('uploaded_files').insert({
      file_name: file.name,
      storage_path: uploadData.path,
      status: 'completed',
      partner_id: parseInt(partnerId!, 10),
    })

    return NextResponse.json({ message: `¡Éxito! Se procesaron (insertaron o actualizaron) ${products.length} productos.` })
  } catch (e) {
    console.error('Error procesando el archivo Excel:', e)
    return NextResponse.json({ error: 'El formato del archivo Excel no es válido o está corrupto.' }, { status: 400 })
  }
}
