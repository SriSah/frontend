"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { apiCall, getReputation } from "@/lib/api"
import { CampaignDetailModal } from "@/components/CampaignDetailModal"
import { Wallet, Award, DollarSign, Clock, Settings, ExternalLink, CheckCircle, Shield, Star, Zap, AlertCircle, User, LayoutDashboard, Search, Globe, HandshakeIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type InfluencerProfile = { id: string; name: string; platform: string; niche: string; bio?: string; engagementRate: number; pricing: number; walletAddress?: string; videoLength?: string; followers?: number }
type Campaign = { id: string; deliverable: string; status: string; budget: number; nftTokenId?: string | null; txHash?: string | null; chainCampaignId?: string | null; brand?: { id: string; name: string; industry?: string | null }; influencer?: { id: string; name: string; niche?: string | null } | null; isPublic?: boolean; niche?: string; videoLength?: string }
type Negotiation = { id: string; brandId: string; brand: { name: string }; offeredBudget: number; counterBudget?: number; finalBudget?: number; deliverable: string; status: string; initiatedBy: string; brandAccepted: boolean; influencerAccepted: boolean; note?: string; counterNote?: string }
type ReputationData = { totalReputationScore: number; completedCampaigns: number; tier: "Bronze" | "Silver" | "Gold" }
type Tab = "profile" | "dashboard" | "browse"

const TIER_CONFIG = {
  Bronze: { color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30", icon: "🥉", next: 200 },
  Silver: { color: "text-slate-300", bg: "bg-slate-400/10", border: "border-slate-400/30", icon: "🥈", next: 500 },
  Gold:   { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", icon: "🥇", next: null },
}
const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-700/50 text-slate-300 border-slate-600",
  NEGOTIATING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
}

export default function InfluencerDashboard() {
  const { updateName } = useAuth()
  const [tab, setTab] = useState<Tab>("dashboard")
  const [profile, setProfile] = useState<InfluencerProfile | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [publicCampaigns, setPublicCampaigns] = useState<Campaign[]>([])
  const [reputation, setReputation] = useState<ReputationData | null>(null)
  const [reputationLoading, setReputationLoading] = useState(false)
  const [reputationError, setReputationError] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [profileForm, setProfileForm] = useState({ name: "", platform: "", niche: "", bio: "", pricing: "", followers: "", engagementRate: "", walletAddress: "", videoLength: "" })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Browse filters
  const [nicheFilter, setNicheFilter] = useState("")
  const [videoLengthFilter, setVideoLengthFilter] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [prof, camps, pubCamps, negs] = await Promise.all([
        apiCall("get", "/influencers/me"),
        apiCall("get", "/campaigns"),
        apiCall("get", "/campaigns/public"),
        apiCall("get", "/negotiations")
      ])
      const p = prof as InfluencerProfile
      setProfile(p)
      if (p.name) updateName(p.name)
      setProfileForm({ name: p.name || "", platform: p.platform || "", niche: p.niche || "", bio: p.bio || "", pricing: p.pricing?.toString() || "", followers: p.followers?.toString() || "", engagementRate: p.engagementRate?.toString() || "", walletAddress: p.walletAddress || "", videoLength: p.videoLength || "" })
      setCampaigns(camps as Campaign[])
      setPublicCampaigns(pubCamps as Campaign[])
      setNegotiations(negs as Negotiation[])
      if (p.walletAddress) {
        setReputationLoading(true)
        setReputationError(false)
        try {
          const data = await getReputation(p.walletAddress) as ReputationData
          setReputation(data)
        } catch { setReputationError(true) } finally { setReputationLoading(false) }
      }
    } catch (err) { console.warn(err) }
  }, [updateName])

  useEffect(() => { fetchData() }, [fetchData])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      await apiCall("patch", "/influencers/me", {
        name: profileForm.name, platform: profileForm.platform, niche: profileForm.niche, bio: profileForm.bio,
        pricing: parseInt(profileForm.pricing) || 0, 
        followers: parseInt(profileForm.followers) || 0, 
        engagementRate: parseFloat(profileForm.engagementRate) || 0,
        walletAddress: profileForm.walletAddress, videoLength: profileForm.videoLength
      })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
      fetchData()
    } catch (err: any) { 
      console.error(err);
      alert(err.response?.data?.error || err.message || "Failed to save profile.");
    } finally { setSavingProfile(false) }
  }

  const handleComplete = async (id: string) => {
    try { await apiCall("post", `/campaigns/${id}/complete`); fetchData() } catch (err) { console.error(err) }
  }

  const handleNegAccept = async (id: string) => {
    try { await apiCall("patch", `/negotiations/${id}/accept`); fetchData() } catch (err) { console.error(err) }
  }

  const handleNegReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this offer?")) return
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

  const TABS = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "dashboard" as Tab, label: "My Dashboard", icon: LayoutDashboard },
    { id: "browse" as Tab, label: "Browse Campaigns", icon: Globe },
  ]

  const tier = reputation?.tier ?? "Bronze"
  const tierCfg = TIER_CONFIG[tier]
  const score = reputation?.totalReputationScore ?? 0

  return (
    <div className="container mx-auto px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 w-fit mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-6">
          <div><h1 className="text-3xl font-bold">Influencer Profile</h1><p className="text-slate-400">Complete your profile to get discovered by AI.</p></div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8 space-y-5">
                  <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Name <span className="text-red-400">*</span></label><input required className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                      <div><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Platform <span className="text-red-400">*</span></label><input required className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" placeholder="e.g. YouTube, Instagram" value={profileForm.platform} onChange={e => setProfileForm({ ...profileForm, platform: e.target.value })} /></div>
                      <div><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Niche <span className="text-red-400">*</span></label><select required className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={profileForm.niche} onChange={e => setProfileForm({ ...profileForm, niche: e.target.value })}><option value="">Select Niche</option>{["Tech", "Gaming", "Beauty", "Fitness", "Fashion", "Food", "Travel", "Finance", "Lifestyle"].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                      <div><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Preferred Video Length <span className="text-red-400">*</span></label><select required className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={profileForm.videoLength} onChange={e => setProfileForm({ ...profileForm, videoLength: e.target.value })}><option value="">Any</option>{["60s", "3min", "5min", "10min", "15min", "30min+"].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                      <div><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Followers <span className="text-red-400">*</span></label><input required type="number" className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={profileForm.followers} onChange={e => setProfileForm({ ...profileForm, followers: e.target.value })} /></div>
                      <div><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Engagement Rate (%) <span className="text-red-400">*</span></label><input required type="number" step="0.1" className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={profileForm.engagementRate} onChange={e => setProfileForm({ ...profileForm, engagementRate: e.target.value })} /></div>
                      <div className="col-span-2"><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Base Pricing (₹) <span className="text-red-400">*</span></label><input required type="number" className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" value={profileForm.pricing} onChange={e => setProfileForm({ ...profileForm, pricing: e.target.value })} /></div>
                      <div className="col-span-2"><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Ethereum Wallet Address (For NFTs/Payments) <span className="text-red-400">*</span></label><input required className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm font-mono" placeholder="0x..." value={profileForm.walletAddress} onChange={e => setProfileForm({ ...profileForm, walletAddress: e.target.value })} /></div>
                      <div className="col-span-2"><label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Bio <span className="text-red-400">*</span></label><textarea required className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm h-24 resize-none" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} /></div>
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
                      {profileForm.name?.[0] || "I"}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xl text-white">{profileForm.name || "Influencer Name"}</h4>
                          <Award className="h-4 w-4 text-yellow-500" />
                        </div>
                        <p className="text-sm text-slate-400">{profileForm.niche || "Niche"} Creator on {profileForm.platform || "Platform"}</p>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-1 bg-slate-950/50 rounded-lg p-2 text-center border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Followers</p>
                          <p className="font-bold text-white text-sm">{profileForm.followers || 0}</p>
                        </div>
                        <div className="flex-1 bg-slate-950/50 rounded-lg p-2 text-center border border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Eng. Rate</p>
                          <p className="font-bold text-blue-400 text-sm">{profileForm.engagementRate || 0}%</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-800">
                        <p className="text-sm text-slate-300 line-clamp-4">{profileForm.bio || "No bio provided yet."}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500 uppercase font-bold">Base Pricing</span>
                        <span className="text-sm font-bold text-green-400">
                          ₹{profileForm.pricing || 0}
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

      {tab === "dashboard" && (
        <div className="space-y-6">
          <Card className={`border ${tierCfg.border} ${tierCfg.bg} shadow-xl`}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex items-center gap-4"><div className="text-5xl">{tierCfg.icon}</div><div><p className="text-xs text-slate-500 uppercase font-bold mb-1">On-Chain Tier</p><p className={`text-2xl font-black ${tierCfg.color}`}>{tier}</p></div></div>
              <div className="flex-1 w-full space-y-2">
                {reputationLoading ? <span className="text-sm text-slate-400 flex items-center gap-2"><span className="h-4 w-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"/> Loading chain data...</span>
                  : reputationError ? <span className="text-sm text-amber-500 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Blockchain offline.</span>
                  : reputation ? <><div className="flex justify-between text-sm"><span className="text-slate-400">Score</span><span className={`font-bold ${tierCfg.color}`}>{score}</span></div><div className="w-full bg-slate-800 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${tier === "Gold" ? "bg-yellow-400" : tier === "Silver" ? "bg-slate-300" : "bg-amber-600"}`} style={{ width: `${Math.min((score / (tierCfg.next || 1000)) * 100, 100)}%` }} /></div></>
                  : <span className="text-sm text-blue-400 flex items-center gap-2"><Shield className="h-4 w-4"/> Add wallet to enable on-chain reputation.</span>}
              </div>
              {reputation && <div className="text-center shrink-0"><p className="text-2xl font-black text-blue-400">{reputation.completedCampaigns}</p><p className="text-xs text-slate-500">Campaigns</p></div>}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><DollarSign className="h-5 w-5 text-yellow-400" /> Invites & Negotiations</h3>
                {negotiations.length > 0 ? negotiations.map(neg => (
                  <Card key={neg.id} className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-5 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-yellow-400 font-mono mb-1">Invite #{neg.id.slice(-8)}</p>
                          <p className="font-bold text-white mb-1">{neg.deliverable}</p>
                          <p className="text-xs text-slate-400">From: {neg.brand?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">₹{(neg.counterBudget || neg.offeredBudget).toLocaleString()}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[neg.status] || STATUS_BADGE.DRAFT}`}>{neg.status}</span>
                        </div>
                      </div>
                      
                      {neg.status === 'PENDING' || neg.status === 'COUNTERED' ? (
                        <div className="flex gap-2 flex-wrap pt-3 border-t border-slate-800">
                          {neg.influencerAccepted ? (
                            <span className="text-sm text-yellow-500 font-medium">Waiting for brand to respond...</span>
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
                          {!neg.influencerAccepted ? (
                            <Button size="sm" onClick={() => handleNegSign(neg.id)} className="bg-blue-600 hover:bg-blue-700 font-bold">Sign Contract</Button>
                          ) : (
                            <span className="text-sm text-green-400 font-bold">Waiting for brand to sign...</span>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )) : <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">No pending invites.</div>}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-blue-400" /> My Active Campaigns</h3>
              {campaigns.length > 0 ? campaigns.map(camp => (
                <button key={camp.id} onClick={() => setSelectedCampaign(camp)} className="w-full text-left">
                  <Card className="bg-slate-900/50 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all cursor-pointer border-slate-800">
                    <CardContent className="p-5 flex justify-between gap-4">
                      <div>
                        <p className="text-xs text-blue-400 font-mono mb-1">#{camp.id.slice(-8)}</p>
                        <p className="font-bold text-white mb-1">{camp.deliverable}</p>
                        <p className="text-xs text-slate-400">{camp.brand?.name}</p>
                        {camp.status === 'ACTIVE' && <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700" onClick={(e) => { e.stopPropagation(); handleComplete(camp.id); }}>Submit Work</Button>}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">₹{camp.budget.toLocaleString()}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[camp.status] || STATUS_BADGE.DRAFT}`}>{camp.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )) : <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500">No campaigns yet.</div>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Wallet className="h-5 w-5 text-purple-400" /> NFT Wall</h3>
              {campaigns.filter(c => c.status === 'COMPLETED').map(camp => (
                <Card key={camp.id} className="bg-slate-900/40 border-slate-800">
                  <CardContent className="p-4 flex gap-3 items-center">
                    <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center border border-green-500/20"><CheckCircle className="h-5 w-5 text-green-400" /></div>
                    <div className="flex-1 min-w-0"><p className="text-xs text-slate-500 flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-400" /> Rep NFT</p><p className="font-mono text-sm text-green-400 truncate">#{camp.nftTokenId || 'Minting...'}</p></div>
                    {camp.txHash && <a href={`https://sepolia.etherscan.io/tx/${camp.txHash}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white"><ExternalLink className="h-4 w-4" /></a>}
                  </CardContent>
                </Card>
              ))}
              {campaigns.filter(c => c.status === 'COMPLETED').length === 0 && <div className="text-center p-6 border border-dashed border-slate-800 rounded-xl text-sm text-slate-500">Complete a campaign to mint your first Proof-of-Work NFT.</div>}
            </div>
          </div>
        </div>
      )}

      {tab === "browse" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-3xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-blue-400" /> Open Campaigns</h1><p className="text-slate-400">Pitch your services to brands actively looking for creators.</p></div>
          </div>

          <div className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
            <select className="px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm w-40" value={nicheFilter} onChange={e => setNicheFilter(e.target.value)}>
              <option value="">All Niches</option>
              {["Tech", "Gaming", "Beauty", "Fitness", "Fashion", "Food", "Travel", "Finance", "Lifestyle"].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select className="px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm w-40" value={videoLengthFilter} onChange={e => setVideoLengthFilter(e.target.value)}>
              <option value="">Any Length</option>
              {["60s", "3min", "5min", "10min", "15min", "30min+"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicCampaigns
              .filter(c => !nicheFilter || c.niche === nicheFilter)
              .filter(c => !videoLengthFilter || c.videoLength === videoLengthFilter)
              .map(camp => (
              <Card key={camp.id} className="bg-slate-900/50 hover:border-blue-500/40 border-slate-800 transition-colors flex flex-col">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-blue-400 font-mono">#{camp.id.slice(-8)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_BADGE[camp.status] || STATUS_BADGE.DRAFT}`}>{camp.status}</span>
                  </div>
                  <h4 className="font-bold text-lg text-white line-clamp-2 mb-2">{camp.deliverable}</h4>
                  <p className="text-sm text-slate-400 mb-4">{camp.brand?.name}</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {camp.niche && <Badge variant="secondary" className="text-[10px]">{camp.niche}</Badge>}
                    {camp.videoLength && <Badge variant="outline" className="text-[10px]">{camp.videoLength}</Badge>}
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold">Budget</p><p className="font-bold text-white">₹{camp.budget.toLocaleString()}</p></div>
                    <Button size="sm" onClick={() => setSelectedCampaign(camp)} className="bg-blue-600 hover:bg-blue-700 font-bold"><HandshakeIcon className="h-3.5 w-3.5 mr-1.5" /> Pitch In</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {publicCampaigns.length === 0 && <div className="col-span-3 py-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">No open campaigns found.</div>}
          </div>
        </div>
      )}

      {selectedCampaign && <CampaignDetailModal campaign={selectedCampaign} role="INFLUENCER" onClose={() => setSelectedCampaign(null)} onRefresh={fetchData} />}
    </div>
  )
}
