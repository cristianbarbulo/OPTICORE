'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ExcelUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const handleUpload = async () => {
    if (!file) return
    setStatus('Cargando...')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload-excel', { method: 'POST', body: formData })
    if (res.ok) {
      setStatus('Procesando archivo')
    } else {
      setStatus('Error al subir')
    }
  }

  return (
    <div className="space-x-2">
      <Input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload}>Subir Excel</Button>
      {status && <span className="ml-2 text-sm">{status}</span>}
    </div>
  )
}
