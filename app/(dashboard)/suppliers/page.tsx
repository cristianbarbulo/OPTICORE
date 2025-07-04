'use client'

import { useEffect, useState } from 'react'
import ExcelUploader from './components/excel-uploader'
import { supabase } from '@/lib/supabase'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])

  useEffect(() => {
    supabase.from('suppliers').select('*').then(({ data }) => {
      if (data) setSuppliers(data)
    })
  }, [])

  return (
    <div className="space-y-4">
      <ExcelUploader />
      <ul className="list-disc pl-5">
        {suppliers.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  )
}
