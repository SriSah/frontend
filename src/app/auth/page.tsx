"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { apiCall } from "@/lib/api"
import { Users, Building2, Lock, Mail } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<"BRAND" | "INFLUENCER">("BRAND")
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    niche: "",
    platform: "",
    industry: "",
    website: "",
    bio: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const endpoint = isLogin ? "/auth/login" : "/auth/register"
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { ...formData, role }

    try {
      const data = await apiCall("post", endpoint, payload)
      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", data.role)
        router.push(`/dashboard/${data.role.toLowerCase()}`)
      } else if (!isLogin) {
        setIsLogin(true) // Registration success, switch to login
        alert("Registration successful! Please log in.")
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <Card className="w-full max-w-md bg-slate-900/80">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-slate-400">
            {isLogin ? "Enter your credentials to continue" : "Join the most advanced influencer network"}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setRole("BRAND")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-all ${
                    role === "BRAND" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Brand
                </button>
                <button
                  type="button"
                  onClick={() => setRole("INFLUENCER")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-all ${
                    role === "INFLUENCER" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Influencer
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={role === "BRAND" ? "Brand Name" : "Full Name / Handle"}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                
                {role === "INFLUENCER" && (
                  <textarea
                    placeholder="Short Bio"
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 h-20"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                )}
                
                {role === "BRAND" && (
                  <input
                    type="text"
                    placeholder="Industry (e.g. Gaming, Fashion)"
                    className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-6 font-bold text-lg" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </Button>
            
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
