'use client'

import ExcelUploader from './excel-uploader'

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
          <ExcelUploader
            partnerId={p.id}
            existingMapping={mappingByPartner[p.id]}
          />
        </div>
      ))}
    </div>
  )
}
