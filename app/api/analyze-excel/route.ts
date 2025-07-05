import { NextResponse } from 'next/server'
import { read, utils } from 'xlsx'

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
    return NextResponse.json({ columns })
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo leer el archivo.' },
      { status: 400 }
    )
  }
}
