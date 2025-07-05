'use client'

import ExcelUploader from './excel-uploader'
import { useState } from 'react'

interface Partner {
  id: number
  name: string
}
interface Mapping {
  id: number
  partner_id: number
  mapping: Record<string, string>
}

interface Props {
  partners: Partner[]
  mappings: Mapping[]
}

export default function PartnersClientPage({ partners, mappings }: Props) {
  const mappingByPartner: Record<number, Record<string, string>> = {}
  mappings.forEach((m) => {
    mappingByPartner[m.partner_id] = m.mapping
  })

  return (
    <div className="space-y-4">
      {partners.map((p) => (
        <div key={p.id} className="border p-4 rounded space-y-2">
          <h3 className="font-semibold text-lg">{p.name}</h3>
          <ApiForm partnerId={p.id} />
          <ExcelUploader
            partnerId={p.id}
            existingMapping={mappingByPartner[p.id]}
          />
        </div>
      ))}
    </div>
  )
}

function ApiForm({ partnerId }: { partnerId: number }) {
  const [apiUrl, setApiUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState('')

  const handle = async () => {
    setStatus('Sincronizando...')
    const res = await fetch('/api/fetch-provider-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId, apiUrl, authType: 'bearer', apiKey })
    })
    const data = await res.json()
    if (res.ok) setStatus(data.message)
    else setStatus('Error: ' + (data.error || ''))
  }

  return (
    <div className="space-y-1">
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="API URL"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
      />
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <button
        className="px-2 py-1 border rounded"
        type="button"
        onClick={handle}
      >
        Conectar API
      </button>
      {status && <p className="text-sm">{status}</p>}
    </div>
  )
}
