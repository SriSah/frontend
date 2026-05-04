"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

interface AuthUser {
  token: string
  role: "BRAND" | "INFLUENCER"
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  role: "BRAND" | "INFLUENCER" | null
  token: string | null
  name: string | null
  isLoading: boolean
  login: (token: string, role: "BRAND" | "INFLUENCER", name: string) => void
  logout: () => void
  updateName: (name: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Hydrate from localStorage on mount (SSR-safe)
  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role") as "BRAND" | "INFLUENCER" | null
      const name = localStorage.getItem("name") || "User"
      if (token && role) {
        setUser({ token, role, name })
        
        // Auto-fetch real name if missing or defaulted to "User"
        if (name === "User") {
          api.get(role === "BRAND" ? "/brands/me" : "/influencers/me")
            .then(res => {
              if (res.data && res.data.name) {
                localStorage.setItem("name", res.data.name)
                setUser(prev => prev ? { ...prev, name: res.data.name } : null)
              }
            })
            .catch(() => {})
        }
      }
    } catch {
      // localStorage not available (SSR)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Listen for cross-tab auth changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role") as "BRAND" | "INFLUENCER" | null
      const name = localStorage.getItem("name") || "User"
      if (token && role) {
        setUser({ token, role, name })
      } else {
        setUser(null)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-change", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-change", handleStorageChange)
    }
  }, [])

  const login = useCallback((token: string, role: "BRAND" | "INFLUENCER", name: string) => {
    localStorage.setItem("token", token)
    localStorage.setItem("role", role)
    localStorage.setItem("name", name)
    setUser({ token, role, name })
    window.dispatchEvent(new Event("auth-change"))
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // Stateless JWT — local removal is the real logout
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      localStorage.removeItem("name")
      setUser(null)
      window.dispatchEvent(new Event("auth-change"))
      router.push("/")
    }
  }, [router])

  const updateName = useCallback((name: string) => {
    localStorage.setItem("name", name)
    setUser(prev => prev ? { ...prev, name } : null)
  }, [])

  const value: AuthContextType = {
    user,
    role: user?.role ?? null,
    token: user?.token ?? null,
    name: user?.name ?? null,
    isLoading,
    login,
    logout,
    updateName,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
