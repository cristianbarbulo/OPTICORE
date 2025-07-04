import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import '../globals.css'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const handleLogout = async () => {
    'use server'
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">OptiCore</h2>
        <nav className="space-y-2">
          <Link href="/inventory" className="block hover:underline">
            Inventario
          </Link>
          <Link href="/clients" className="block hover:underline">
            Clientes
          </Link>
          <Link href="/sales" className="block hover:underline">
            Ventas
          </Link>
          <Link href="/suppliers" className="block hover:underline">
            Proveedores
          </Link>
        </nav>
      </aside>
      <div className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <span>Hola, {user?.user_metadata.full_name || user?.email}</span>
          <form action={handleLogout}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Cerrar sesión
            </button>
          </form>
        </header>
        {children}
      </div>
    </div>
  )
}
