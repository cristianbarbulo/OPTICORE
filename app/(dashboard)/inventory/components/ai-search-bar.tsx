'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onResults: (products: any[]) => void
}

export default function AiSearchBar({ onResults }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    const data = await res.json()
    onResults(data)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSearch} className="flex space-x-2">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar productos..." />
      <Button type="submit" disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </Button>
    </form>
  )
}
