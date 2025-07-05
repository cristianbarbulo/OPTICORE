import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  const { ours, theirs } = await req.json()
  if (!Array.isArray(ours) || !Array.isArray(theirs)) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  const prompt = `Contexto: Mis campos son ${JSON.stringify(ours)}. Los campos de mi socio son ${JSON.stringify(theirs)}. Genera un objeto JSON de mapeo probable.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  })

  const content = completion.choices[0].message.content || '{}'
  let mapping: any = {}
  try {
    mapping = JSON.parse(content)
  } catch (e) {
    console.error('JSON parse error', content)
  }

  return NextResponse.json(mapping)
}
