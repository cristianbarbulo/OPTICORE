'use client'

import { useEffect, useState } from 'react'

export default function PredictionsPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/predict-demand')
      .then((r) => r.json())
      .then(setItems)
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Predicción de Demanda</h1>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.product_id} className="border p-2 rounded">
            Producto #{p.product_id} - Demanda proyectada: {p.projected_demand}
          </li>
        ))}
      </ul>
    </div>
  )
}
