"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { apiCall, getBlockchainHealth } from "@/lib/api"
import { CampaignDetailModal } from "@/components/CampaignDetailModal"
import { BarChart3, TrendingUp, Users, CheckCircle2, Sparkles, ArrowRight, Cpu, Wifi, WifiOff, ShieldCheck, User, LayoutDashboard, Search, Plus, Globe, DollarSign, Building2 } from "lucide-react"
import { AreaChart, Area, LineChart, Line, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const chartData = [
  { name: "Jan", reach: 4000, conv: 2400 },
  { name: "Feb", reach: 3000, conv: 1398 },
  { name: "Mar", reach: 2000, conv: 9800 },
  { name: "Apr", reach: 2780, conv: 3908 },
  { name: "May", reach: 1890, conv: 4800 },
  { name: "Jun", reach: 2390, conv: 3800 },
]

type Brand = {
  id: string; name: string; industry?: string | null; website?: string | null;
  description?: string | null; logoUrl?: string | null; budgetMin?: number | null; budgetMax?: number | null;
  user?: { email: string }
}

type Campaign = {
  id: string; deliverable: string; status: string; budget: number;
  niche?: string | null; videoLength?: string | null; isPublic?: boolean;
  brand?: { id: string; name: string; industry?: string | null };
  influencer?: { id: string; name: string; niche?: string | null } | null;
  contractSignedAt?: string | null; txHash?: string | null;
}

type Negotiation = { id: string; influencerId: string; influencer: { name: string; niche?: string }; offeredBudget: number; counterBudget?: number; finalBudget?: number; deliverable: string; status: string; initiatedBy: string; brandAccepted: boolean; influencerAccepted: boolean; note?: string; counterNote?: string }

type ChainHealth = {
  status: string; network?: { name: string; chainId: number }; latestBlock?: number;
  walletBalance?: string; contracts?: { registry: { reachable: boolean }; campaign: { reachable: boolean }; reputation: { reachable: boolean } }
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-700/50 text-slate-300 border-slate-600",
  NEGOTIATING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
}

type Tab = "profile" | "dashboard" | "browse"

export default function BrandDashboard() {
  const { updateName } = useAuth()
  const [tab, setTab] = useState<Tab>("dashboard")
  const [brand, setBrand] = useState<Brand | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [chainHealth, setChainHealth] = useState<ChainHealth | null>(null)
  const [chainLoading, setChainLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [profileForm, setProfileForm] = useState({ name: "", industry: "", website: "", description: "", budgetMin: "", budgetMax: "" })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [newCampaignForm, setNewCampaignForm] = useState({ deliverable: "", budget: "", niche: "", videoLength: "" })
  const [creatingCampaign, setCreatingCampaign] = useState(false)
  const [showNewCampaign, setShowNewCampaign] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [brandData, camps, negs] = await Promise.all([apiCall("get", "/brands/me"), apiCall("get", "/campaigns"), apiCall("get", "/negotiations")])
      const b = brandData as Brand
      setBrand(b)
      if (b.name) updateName(b.name)
      setProfileForm({ name: b.name || "", industry: b.industry || "", website: b.website || "", description: b.description || "", budgetMin: b.budgetMin?.toString() || "", budgetMax: b.budgetMax?.toString() || "" })
      setCampaigns(camps as Campaign[])
      setNegotiations(negs as Negotiation[])
    } catch (err) { console.warn(err) }
  }, [updateName])

  useEffect(() => {
    fetchData()
    setChainLoading(true)
    getBlockchainHealth().then(h => setChainHealth(h as ChainHealth)).catch(() => setChainHealth({ status: "error" })).finally(() => setChainLoading(false))
  }, [fetchData])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      await apiCall("patch", "/brands/me", { name: profileForm.name, industry: profileForm.industry, website: profileForm.website, description: profileForm.description, budgetMin: parseInt(profileForm.budgetMin) || undefined, budgetMax: parseInt(profileForm.budgetMax) || undefined })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setSavingProfile(false) }
  }

  const createCampaign = async () => {
    if (!newCampaignForm.deliverable || !newCampaignForm.budget) return
    setCreatingCampaign(true)
    try {
      await apiCall("post", "/campaigns", { deliverable: newCampaignForm.deliverable, budget: parseInt(newCampaignForm.budget), niche: newCampaignForm.niche, videoLength: newCampaignForm.videoLength })
      setNewCampaignForm({ deliverable: "", budget: "", niche: "", videoLength: "" })
      setShowNewCampaign(false)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setCreatingCampaign(false) }
  }

  const handleNegAccept = async (id: string) => {
    try { await apiCall("patch", `/negotiations/${id}/accept`); fetchData() } catch (err) { console.error(err) }
  }

  const handleNegReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this negotiation?")) return
    try { await apiCall("patch", `/negotiations/${id}/reject`); fetchData() } catch (err) { console.error(err) }
  }

  const handleNegCounter = async (id: string) => {
    const amount = prompt("Enter your counter offer amount (₹):")
    if (!amount || isNaN(parseInt(amount))) return
    try { await apiCall("patch", `/negotiations/${id}/counter`, { counterBudget: parseInt(amount) }); fetchData() } catch (err) { console.error(err) }
  }

  const handleNegSign = async (id: string) => {
    try { await apiCall("patch", `/negotiations/${id}/sign`); fetchData(); alert("Campaign officially signed and is now Active!") } catch (err: any) { alert(err.response?.data?.error || err.message) }
  }

  const chainOnline = chainHealth?.status === "ok"
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE").length
  const completedCampaigns = campaigns.filter(c => c.status === "COMPLETED").length

  const TABS = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "dashboard" as Tab, label: "My Dashboard", icon: LayoutDashboard },
    { id: "browse" as Tab, label: "Find Influencers", icon: Search },
  ]

  return (
    <div className="container mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      {/* Tab Header */}
      <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 w-fit">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Icon className="h-4 w-4" />{t.label}
            </button>
          )
        })}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === "profile" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Profile</h1>
            <p className="text-slate-400 mt-1">Manage how your brand appears to influencers.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8 space-y-5">
                  <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-5">
                    {[
                      { label: "Brand Name", key: "name", placeholder: "e.g. Nike, Apple, YourBrand", required: true },
                      { label: "Industry", key: "industry", placeholder: "e.g. Fashion, Tech, Gaming", required: true },
                      { label: "Website", key: "website", placeholder: "https://yourbrand.com", required: true },
                    ].map(({ label, key, placeholder, required }) => (
                      <div key={key}>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1.5 block">
                          {label} {required && <span className="text-red-400">*</span>}
                        </label>
                        <input
                          required={required}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={placeholder}
                          value={profileForm[key as keyof typeof profileForm]}
                          onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1.5 block">
                        About / Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Tell influencers what your brand is about..."
                        value={profileForm.description}
                        onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Min Budget (₹) <span className="text-red-400">*</span>
                        </label>
                        <input required type="number" className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="500" value={profileForm.budgetMin} onChange={e => setProfileForm({ ...profileForm, budgetMin: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Max Budget (₹) <span className="text-red-400">*</span>
                        </label>
                        <input required type="number" className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10000" value={profileForm.budgetMax} onChange={e => setProfileForm({ ...profileForm, budgetMax: e.target.value })} />
                      </div>
                    </div>

                    <Button type="submit" disabled={savingProfile} className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-5 mt-4">
                      {savingProfile ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : profileSaved ? "✓ Saved!" : "Save Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Profile Preview Side */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Live Preview</h3>
                <Card className="bg-slate-900/50 border-slate-800 overflow-hidden shadow-xl">
                  <div className="h-24 bg-gradient-to-r from-blue-900/40 to-purple-900/40" />
                  <CardContent className="p-6 pt-0 relative">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-black shadow-lg border-4 border-slate-900 -mt-8 mb-4">
                      {profileForm.name?.[0] || <Building2 className="h-7 w-7" />}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-xl text-white">{profileForm.name || "Brand Name"}</h4>
                        <p className="text-sm text-slate-400">{profileForm.industry || "Industry"}</p>
                      </div>
                      
                      {profileForm.website && (
                        <a href={profileForm.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {profileForm.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      
                      <div className="pt-4 border-t border-slate-800">
                        <p className="text-sm text-slate-300 line-clamp-4">{profileForm.description || "No description provided yet."}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500 uppercase font-bold">Usual Budget</span>
                        <span className="text-sm font-bold text-green-400">
                          ₹{profileForm.budgetMin || 0} - ₹{profileForm.budgetMax || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD TAB ── */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
              <p className="text-slate-400">Welcome back, {brand?.name || "Partner"}.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  {(() => {
                    const activeCamps = campaigns.filter(c => ['ACTIVE', 'DELIVERED', 'FUNDED', 'COMPLETED'].includes(c.status));
                    const spend = activeCamps.reduce((acc, c) => acc + c.budget, 0);
                    const engagements = activeCamps.reduce((acc, c) => {
                      if (c.influencer?.followers && c.influencer?.engagementRate) {
                        return acc + ((c.influencer.followers * c.influencer.engagementRate) / 100);
                      }
                      return acc;
                    }, 0);
                    const cpe = engagements > 0 ? (spend / engagements).toFixed(2) : "0.00";
                    
                    return (
                      <>
                        <Badge variant="secondary" className="bg-slate-800/50"><TrendingUp className="h-3 w-3 mr-1" />CPE: ₹{cpe}</Badge>
                        <BarChart3 className="text-blue-500 h-6 w-6" />
                      </>
                    )
                  })()}
                </div>
                <p className="text-slate-400 text-sm font-medium">Total Spend (Active+)</p>
                <h2 className="text-3xl font-bold text-white">
                  ₹{campaigns.filter(c => ['ACTIVE', 'DELIVERED', 'FUNDED', 'COMPLETED'].includes(c.status)).reduce((acc, c) => acc + c.budget, 0).toLocaleString()}
                </h2>
                <div className="h-24 mt-4 w-full -mx-2 opacity-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}><Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="#3b82f622" strokeWidth={2} /></AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-slate-800/50">Global Reach</Badge>
                  <Users className="text-purple-500 h-6 w-6" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Total Audience (Followers)</p>
                <h2 className="text-3xl font-bold text-white">
                  {(() => {
                    const activeCamps = campaigns.filter(c => ['ACTIVE', 'DELIVERED', 'FUNDED', 'COMPLETED'].includes(c.status));
                    const audience = activeCamps.reduce((acc, c) => acc + (c.influencer?.followers || 0), 0);
                    return audience > 1000000 ? (audience / 1000000).toFixed(1) + 'M' : audience > 1000 ? (audience / 1000).toFixed(1) + 'k' : audience.toLocaleString();
                  })()}
                </h2>
                <div className="h-24 mt-4 w-full -mx-2 opacity-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}><Line type="monotone" dataKey="conv" stroke="#a855f7" strokeWidth={2} dot={false} /></LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-32 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors" />
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-slate-800/50">Active Contracts</Badge>
                  <CheckCircle2 className="text-green-500 h-6 w-6" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Active Campaigns</p>
                <h2 className="text-3xl font-bold text-white">{activeCampaigns}</h2>
                <div className="mt-8 space-y-2">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-700" style={{ width: completedCampaigns + activeCampaigns > 0 ? `${Math.round((completedCampaigns / (completedCampaigns + activeCampaigns)) * 100)}%` : "0%" }} />
                  </div>
                  <p className="text-xs text-slate-500 text-right">{completedCampaigns} completed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blockchain status */}
          <Card className={`border ${chainOnline ? "border-emerald-500/30 bg-emerald-950/20" : "border-slate-700 bg-slate-900/40"} shadow-xl`}>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${chainOnline ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800 border border-slate-700"}`}>
                    <Cpu className={`h-5 w-5 ${chainOnline ? "text-emerald-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Blockchain Node</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {chainLoading ? <span className="h-3.5 w-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /> : chainOnline ? <Wifi className="h-3.5 w-3.5 text-emerald-400" /> : <WifiOff className="h-3.5 w-3.5 text-red-400" />}
                      <span className={`text-sm font-bold ${chainOnline ? "text-emerald-400" : "text-red-400"}`}>{chainLoading ? "Connecting..." : chainOnline ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>
                {chainHealth && chainOnline && chainHealth.contracts && (
                  <div className="flex flex-wrap gap-2 md:ml-auto">
                    {(["registry", "campaign", "reputation"] as const).map(key => {
                      const ok = chainHealth.contracts![key]?.reachable
                      const labels = { registry: "Registry", campaign: "Campaign", reputation: "NFT" }
                      return <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${ok ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}><ShieldCheck className="h-3 w-3" />{labels[key]}</div>
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Negotiations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold flex items-center gap-2"><DollarSign className="h-5 w-5 text-yellow-400" /> Sent Invites & Negotiations</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {negotiations.length > 0 ? negotiations.map(neg => (
                <Card key={neg.id} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-yellow-400 font-mono mb-1">Invite #{neg.id.slice(-8)}</p>
                        <p className="font-bold text-white mb-1 line-clamp-1">{neg.deliverable}</p>
                        <p className="text-xs text-slate-400">To: {neg.influencer?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-white">₹{(neg.counterBudget || neg.offeredBudget).toLocaleString()}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[neg.status] || STATUS_BADGE.DRAFT}`}>{neg.status}</span>
                      </div>
                    </div>
                    
                    {neg.status === 'PENDING' || neg.status === 'COUNTERED' ? (
                      <div className="flex gap-2 flex-wrap pt-3 border-t border-slate-800">
                        {neg.brandAccepted ? (
                          <span className="text-sm text-yellow-500 font-medium">Waiting for influencer to respond...</span>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => handleNegAccept(neg.id)} className="bg-green-600 hover:bg-green-700">Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => handleNegCounter(neg.id)}>Counter Offer</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleNegReject(neg.id)}>Reject</Button>
                          </>
                        )}
                      </div>
                    ) : null}

                    {neg.status === 'ACCEPTED' ? (
                      <div className="flex gap-2 flex-wrap pt-3 border-t border-slate-800">
                        {!neg.brandAccepted ? (
                          <Button size="sm" onClick={() => handleNegSign(neg.id)} className="bg-blue-600 hover:bg-blue-700 font-bold">Sign Contract</Button>
                        ) : (
                          <span className="text-sm text-green-400 font-bold">Waiting for influencer to sign...</span>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )) : <div className="col-span-full bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">No active negotiations.</div>}
            </div>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold">My Campaigns</h3>
              <Button onClick={() => setShowNewCampaign(!showNewCampaign)} className="bg-blue-600 hover:bg-blue-700 font-bold" size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> New Campaign
              </Button>
            </div>

            {showNewCampaign && (
              <Card className="bg-slate-900 border-blue-500/30 shadow-blue-900/10">
                <CardContent className="p-6 space-y-4">
                  <h4 className="font-bold text-blue-400">Launch New Campaign</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Deliverable</label>
                      <input className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" placeholder="e.g. 1 YouTube Review Video" value={newCampaignForm.deliverable} onChange={e => setNewCampaignForm({ ...newCampaignForm, deliverable: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Budget (₹)</label>
                      <input type="number" className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" placeholder="2500" value={newCampaignForm.budget} onChange={e => setNewCampaignForm({ ...newCampaignForm, budget: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Niche</label>
                      <select className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={newCampaignForm.niche} onChange={e => setNewCampaignForm({ ...newCampaignForm, niche: e.target.value })}>
                        <option value="">Any</option>
                        {["Tech", "Gaming", "Beauty", "Fitness", "Fashion", "Food", "Travel", "Finance", "Lifestyle"].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Video Length</label>
                      <select className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={newCampaignForm.videoLength} onChange={e => setNewCampaignForm({ ...newCampaignForm, videoLength: e.target.value })}>
                        <option value="">Any</option>
                        {["60s", "3min", "5min", "10min", "15min", "30min+"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={createCampaign} disabled={creatingCampaign || !newCampaignForm.deliverable || !newCampaignForm.budget} className="bg-blue-600 hover:bg-blue-700 font-bold flex-1">
                      {creatingCampaign ? "Launching..." : "Launch Campaign"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewCampaign(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.map(camp => (
                  <button key={camp.id} onClick={() => setSelectedCampaign(camp)} className="w-full text-left">
                    <Card className="bg-slate-900/50 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all cursor-pointer border-slate-800">
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-400 font-mono mb-1">#{camp.id.slice(-8)}</p>
                          <p className="font-bold text-white truncate">{camp.deliverable}</p>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            {camp.niche && <Badge variant="secondary" className="text-[10px]">{camp.niche}</Badge>}
                            {camp.videoLength && <Badge variant="outline" className="text-[10px]">{camp.videoLength}</Badge>}
                            {camp.influencer && <span className="text-xs text-slate-500">→ {camp.influencer.name}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-white">₹{camp.budget.toLocaleString()}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[camp.status] || STATUS_BADGE.DRAFT}`}>{camp.status}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500">
                No campaigns yet. Click <strong>&quot;New Campaign&quot;</strong> to launch one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BROWSE TAB ── */}
      {tab === "browse" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-blue-400" />AI Discovery Engine</h1>
              <p className="text-slate-400">Find the perfect influencers using AI-powered matching.</p>
            </div>
            <Link href="/dashboard/brand/ai-search">
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold">
                Launch AI Search <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/20 p-8 text-center">
            <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Find Your Perfect Match</h3>
            <p className="text-slate-400 mb-6">Use our Random Forest AI engine to discover influencers that align with your brand.</p>
            <Link href="/dashboard/brand/ai-search">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-slate-100 font-bold shadow-xl">
                Launch AI Engine <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          role="BRAND"
          onClose={() => setSelectedCampaign(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  )
}
