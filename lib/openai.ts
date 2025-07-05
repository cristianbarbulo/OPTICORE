import OpenAI from 'openai'

export async function createEmbedding(text: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000)
  })
  return res.data[0].embedding
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
