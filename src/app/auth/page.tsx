"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { apiCall } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Users, Building2, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const { login } = useAuth()

  // Step 1: Role Selection
  const [role, setRole] = useState<"BRAND" | "INFLUENCER" | null>(null)

  // Step 2: Auth Type & Form
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

  const validateForm = () => {
    const errors: Record<string, boolean> = {}
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = true
    if (!formData.password || formData.password.length < 6) errors.password = true

    if (!isLogin) {
      if (!formData.name) errors.name = true
      if (role === "INFLUENCER" && !formData.bio) errors.bio = true
      if (role === "BRAND" && !formData.industry) errors.industry = true
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      setError("Please fix the highlighted errors.")
      return
    }

    setLoading(true)

    const endpoint = isLogin ? "/auth/login" : "/auth/register"
    const payload = isLogin
      ? { email: formData.email, password: formData.password, role }
      : { ...formData, role }

    try {
      const data = await apiCall("post", endpoint, payload)
      if (data.token) {
        // Use auth context login — persists state globally
        login(data.token as string, (data.role || role!) as "BRAND" | "INFLUENCER", data.name as string)
        router.push(`/dashboard/${(data.role || role!).toLowerCase()}`)
      } else if (!isLogin) {
        setIsLogin(true)
        setFormData({ ...formData, password: "" })
        setError("Registration successful! Please log in.")
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : null
      setError(message || "Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
        {!role ? (
          // --- ROLE SELECTION STEP ---
          <>
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold tracking-tight text-white">
                Choose Your Path
              </CardTitle>
              <p className="text-slate-400 text-sm">
                How do you want to use InfluenceX?
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => setRole("BRAND")}
                className="w-full flex items-center gap-4 p-6 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 transition-all group text-left"
              >
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors shrink-0">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">I am a Brand</h3>
                  <p className="text-sm text-slate-400 leading-tight">Find top influencers, create AI-matched campaigns, and manage contracts.</p>
                </div>
              </button>

              <button
                onClick={() => setRole("INFLUENCER")}
                className="w-full flex items-center gap-4 p-6 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-purple-500 transition-all group text-left"
              >
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors shrink-0">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">I am an Influencer</h3>
                  <p className="text-sm text-slate-400 leading-tight">Connect with brands, earn through proof-of-work, and mint NFTs.</p>
                </div>
              </button>
            </CardContent>
          </>
        ) : (
          // --- AUTH FORM STEP ---
          <>
            <CardHeader className="text-center space-y-1 pb-4 relative">
              <button
                onClick={() => { setRole(null); setError(null); setValidationErrors({}); }}
                className="absolute left-6 top-6 text-slate-400 hover:text-white transition-colors"
                title="Back to role selection"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <p className="text-slate-400 text-sm">
                {isLogin ? `Log in to your ${role.toLowerCase()} portal` : `Join as a ${role.toLowerCase()}`}
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className={`mb-6 p-3 rounded-md flex items-center gap-2 text-sm ${error.includes('successful') ? 'bg-green-900/50 text-green-200 border border-green-800' : 'bg-red-900/50 text-red-200 border border-red-800'}`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {!isLogin && (
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder={role === "BRAND" ? "Brand Name" : "Full Name / Handle"}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        error={validationErrors.name}
                      />
                      {validationErrors.name && <p className="text-red-400 text-xs mt-1">Name is required</p>}
                    </div>

                    {role === "INFLUENCER" && (
                      <div>
                        <textarea
                          placeholder="Short Bio"
                          className={`flex w-full rounded-md border bg-slate-950 px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 h-20 resize-none ${validationErrors.bio ? 'border-red-500' : 'border-slate-800'}`}
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        />
                        {validationErrors.bio && <p className="text-red-400 text-xs mt-1">Bio is required</p>}
                      </div>
                    )}

                    {role === "BRAND" && (
                      <div>
                        <Input
                          type="text"
                          placeholder="Industry (e.g. Gaming, Fashion)"
                          value={formData.industry}
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          error={validationErrors.industry}
                        />
                        {validationErrors.industry && <p className="text-red-400 text-xs mt-1">Industry is required</p>}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 z-10" />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      error={validationErrors.email}
                    />
                    {validationErrors.email && <p className="text-red-400 text-xs mt-1">Valid email is required</p>}
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 z-10" />
                    <Input
                      type="password"
                      placeholder="Password (min 6 chars)"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      error={validationErrors.password}
                    />
                    {validationErrors.password && <p className="text-red-400 text-xs mt-1">Password must be at least 6 characters</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full py-6 font-bold text-lg mt-2" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isLogin ? "Authenticating..." : "Creating Account..."}
                    </span>
                  ) : (
                    isLogin ? "Login" : "Register"
                  )}
                </Button>

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError(null)
                      setValidationErrors({})
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
