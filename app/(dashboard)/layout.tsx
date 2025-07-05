import type { ReactNode } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// La línea que importaba 'globals.css' se ha eliminado.

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const handleLogout = async () => {
    'use server'
    const supabase = createSupabaseServerClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">OptiCore</h2>
        <nav className="space-y-2">
          <Link href="/inventory" className="block p-2 rounded-md hover:bg-gray-700">
            Inventario
          </Link>
          <Link href="/clients" className="block p-2 rounded-md hover:bg-gray-700">
            Clientes
          </Link>
          <Link href="/sales" className="block p-2 rounded-md hover:bg-gray-700">
            Ventas
          </Link>
          <Link href="/suppliers" className="block p-2 rounded-md hover:bg-gray-700">
            Proveedores
          </Link>
        </nav>
      </aside>
      <div className="flex-1 p-6 bg-gray-50">
        <header className="flex justify-between items-center mb-6">
          <span>Hola, {user?.email}</span>
          <form action={handleLogout}>
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Cerrar sesión
            </button>
          </form>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
