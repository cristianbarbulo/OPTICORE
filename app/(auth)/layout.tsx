import type { ReactNode } from 'react'
import '../globals.css'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center bg-gray-100">{children}</div>
}
