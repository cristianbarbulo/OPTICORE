'use client'

import { useState } from 'react'
import AiSearchBar from './components/ai-search-bar'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const paginated = products.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(products.length / PER_PAGE)

  return (
    <div>
      <AiSearchBar
        onResults={(data) => {
          setProducts(data)
          setPage(1)
        }}
      />
      <table className="mt-4 w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Nombre</th>
            <th className="border p-2 text-left">Marca</th>
            <th className="border p-2 text-left">Precio</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.brand}</td>
              <td className="p-2">${p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="mt-2 flex items-center space-x-2">
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
