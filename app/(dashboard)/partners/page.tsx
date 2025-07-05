'use client'

import { useEffect, useState } from 'react'
import ExcelUploader from './components/excel-uploader'
import { supabase } from '@/lib/supabase'

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    supabase.from('business_partners').select('*').then(({ data }) => {
      if (data) setPartners(data)
    })
  }, [])

  return (
    <div className="space-y-4">
      <ul className="list-disc pl-5 space-y-2">
        {partners.map((p) => (
          <li key={p.id} className="space-y-1">
            <span className="font-semibold">{p.name}</span>
            <ExcelUploader partnerId={p.id} />
          </li>
        ))}
      </ul>
    </div>
  )
}
