import PartnersClientPage from './components/partners-client-page'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function PartnersPage() {
  const supabase = createSupabaseServerClient()
  const { data: partners } = await supabase
    .from('business_partners')
    .select('*')
    .eq('type', 'supplier')

  const { data: mappings } = await supabase
    .from('data_source_mappings')
    .select('*')

  return (
    <PartnersClientPage partners={partners || []} mappings={mappings || []} />
  )
}
