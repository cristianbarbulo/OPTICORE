import { NextResponse } from 'next/server'
import { read, utils } from 'xlsx'
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Falta el archivo.' }, { status: 400 })
  }

  try {
    const buffer = await file.arrayBuffer()
    const workbook = read(buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[][] = utils.sheet_to_json(sheet, { header: 1 })
    const header = rows[0]
    const columns = Array.isArray(header)
      ? header.map((c) => String(c))
      : Object.keys(utils.sheet_to_json(sheet)[0] || {})

    const prompt = `Detecta las columnas correspondientes a sku, name, description, brand, category, price y stock dentro de: [${columns.join(', ')}]. Devuelve un JSON.`
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    })
    let mapping: Record<string, string> = {}
    try {
      mapping = JSON.parse(completion.choices[0].message.content || '{}')
    } catch (e) {
      mapping = {}
    }
    return NextResponse.json({ columns, mapping })
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo leer el archivo.' },
      { status: 400 }
    )
  }
}
