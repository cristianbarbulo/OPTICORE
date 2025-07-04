'use client'

import { useState } from 'react'
import AiSearchBar from './components/ai-search-bar'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])

  return (
    <div>
      <AiSearchBar onResults={setProducts} />
      <div className="mt-4 grid grid-cols-1 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-2 rounded">
            <p className="font-semibold">{p.name}</p>
            <p>{p.brand}</p>
            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
