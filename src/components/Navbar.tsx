"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(localStorage.getItem('role'))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setRole(null)
    router.push('/')
  }

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md overflow-hidden sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          <Zap className="h-6 w-6 text-blue-500" />
          InfluenceX AI
        </Link>
        
        <div className="flex gap-4">
          {!role ? (
            <Link href="/auth">
              <Button variant="default">Login / Register</Button>
            </Link>
          ) : (
            <>
              <Link href={`/dashboard/${role.toLowerCase()}`}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
