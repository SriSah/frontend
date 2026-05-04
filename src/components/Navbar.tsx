"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth-context'
import { Zap } from 'lucide-react'

export function Navbar() {
  const { user, role, name, logout, isLoading } = useAuth()

  if (isLoading) return (
    <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          <Zap className="h-6 w-6 text-blue-500" />
          InfluenceX
        </Link>
        <div className="w-24 h-9 bg-slate-800/50 animate-pulse rounded-md" />
      </div>
    </nav>
  )

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md overflow-hidden sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          <Zap className="h-6 w-6 text-blue-500" />
          InfluenceX
        </Link>

        <div className="flex gap-4 items-center">
          {!role ? (
            <Link href="/auth">
              <Button variant="default">Login / Register</Button>
            </Link>
          ) : (
            <>
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href={`/dashboard/${role.toLowerCase()}`}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <span className="text-sm font-medium text-slate-300 ml-2 border-l border-slate-700 pl-4 py-1">
                Welcome {name || user?.name || "User"}
              </span>
              <Button variant="outline" onClick={logout} className="ml-2">Logout</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
