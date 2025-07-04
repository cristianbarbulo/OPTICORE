import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { read, utils } from 'xlsx'

export const runtime = 'edge'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const workbook = read(arrayBuffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = utils.sheet_to_json(sheet)

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('excel')
    .upload(`uploads/${file.name}`, arrayBuffer, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const products = rows.map((r) => ({
    sku: String(r.sku),
    name: r.name,
    description: r.description,
    brand: r.brand,
    category: r.category,
    price: Number(r.price),
    stock: Number(r.stock),
    attributes: r.attributes ? JSON.parse(r.attributes) : null
  }))

  const { error } = await supabase.from('products').insert(products)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('uploaded_files').insert({
    file_name: file.name,
    storage_path: uploadData.path,
    status: 'completed'
  })

  return NextResponse.json({ ok: true })
}
