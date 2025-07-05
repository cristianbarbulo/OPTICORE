'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PRODUCT_FIELDS = [
  'sku',
  'name',
  'description',
  'brand',
  'category',
  'price',
  'stock'
]

interface Props {
  partnerId: number
  existingMapping?: Record<string, string>
}

export default function ExcelUploader({ partnerId, existingMapping }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>(
    existingMapping || {}
  )
  const [status, setStatus] = useState('')

  const analyze = async () => {
    if (!file) return
    setStatus('Analizando archivo...')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/analyze-excel', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (res.ok) {
      setColumns(data.columns || [])
      setStatus('')
    } else {
      setStatus('Error: ' + (data.error || ''))
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('Subiendo archivo...')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('partnerId', String(partnerId))
    formData.append('mapping', JSON.stringify(mapping))
    const res = await fetch('/api/upload-excel', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (res.ok) {
      setStatus('¡Mapeo guardado!')
    } else {
      setStatus('Error: ' + (data.error || ''))
    }
  }

  return (
    <div className="space-y-2">
      <div className="space-x-2">
        <Input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button type="button" onClick={analyze} disabled={!file}>
          Analizar
        </Button>
      </div>
      {columns.length > 0 && (
        <div className="space-y-2">
          {PRODUCT_FIELDS.map((field) => (
            <div key={field} className="flex items-center space-x-2">
              <label className="w-28 capitalize">{field}</label>
              <select
                className="border rounded px-2 py-1 flex-1"
                value={mapping[field] || ''}
                onChange={(e) =>
                  setMapping({ ...mapping, [field]: e.target.value })
                }
              >
                <option value="">Sin asignar</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <Button type="button" onClick={handleUpload}>
            Guardar y Cargar
          </Button>
        </div>
      )}
      {status && <p className="text-sm mt-1">{status}</p>}
    </div>
  )
}
