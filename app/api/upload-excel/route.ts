import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { read, utils } from 'xlsx'
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const partnerId = formData.get('partnerId') as string | null

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
    const workbook = read(arrayBuffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = utils.sheet_to_json(sheet)

    const normalize = async (p: any) => {
      const prompt = `La siguiente es información de un producto: ${JSON.stringify(
        p
      )}. Normaliza los datos. 'name' debe estar capitalizado correctamente. 'category' debe ser una de estas opciones ['Lentes de Sol', 'Armazones']. Devuelve el JSON limpio.`
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      })
      const content = completion.choices[0].message.content || '{}'
      try {
        return JSON.parse(content)
      } catch (e) {
        console.error('JSON parse error', content)
        return p
      }
    }

    const rawProducts = rows.map((r) => ({
      sku: String(r.sku || ''),
      name: String(r.name || 'Sin Nombre'),
      description: String(r.description || ''),
      brand: String(r.brand || ''),
      category: String(r.category || ''),
      price: Number(r.price) || 0,
      stock: Number(r.stock) || 0,
      partner_id: parseInt(partnerId, 10),
    }))

    const products = await Promise.all(rawProducts.map(normalize))

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

    await supabase.from('uploaded_files').insert({
      file_name: file.name,
      storage_path: uploadData.path,
      status: 'completed',
      partner_id: parseInt(partnerId, 10),
    })

    return NextResponse.json({ message: `¡Éxito! Se procesaron (insertaron o actualizaron) ${products.length} productos.` })
  } catch (e) {
    console.error('Error procesando el archivo Excel:', e)
    return NextResponse.json({ error: 'El formato del archivo Excel no es válido o está corrupto.' }, { status: 400 })
  }
}
