"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { apiCall } from "@/lib/api"
import { Search, Target, Sparkles, Activity, ArrowLeft, TerminalSquare, Send } from "lucide-react"

type Influencer = {
  id: string;
  name: string;
  platform: string;
  niche: string;
  pricing: number;
  followers?: number;
  engagementRate?: number;
  bio?: string;
  score?: number;
  suitability?: string;
  recommendation?: string;
  reason?: string;
  aiScore?: number;
  fraudRisk?: string;
  videoLength?: string;
};

type MatchResponse = {
  results: Array<Pick<Influencer, "id" | "score" | "suitability" | "recommendation" | "reason">>;
};

export default function AISearchPage() {
  const router = useRouter()
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [matches, setMatches] = useState<MatchResponse["results"]>([])
  
  const [campaignCategory, setCampaignCategory] = useState<string[]>([])
  const [campaignBudget, setCampaignBudget] = useState("")
  const [campaignNiche, setCampaignNiche] = useState<string[]>([])
  const [campaignVideoLength, setCampaignVideoLength] = useState<string[]>([])
  
  const toggleSelection = (val: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (current.includes(val)) setter(current.filter(v => v !== val))
    else setter([...current, val])
  }
  
  const [matching, setMatching] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const [inviteInf, setInviteInf] = useState<Influencer | null>(null)
  const [inviteDeliverable, setInviteDeliverable] = useState("")
  const [inviteBudget, setInviteBudget] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const infData = await apiCall("get", "/influencers")
        setInfluencers(infData as Influencer[])
      } catch (err) {
        console.warn("Failed to fetch influencers", err)
      }
    }
    fetchData()
  }, [])

  const handleMatch = async () => {
    setMatching(true)
    setMatches([])
    setLoadingStep(1)
    
    setTimeout(() => setLoadingStep(2), 800)
    setTimeout(() => setLoadingStep(3), 1600)
    setTimeout(() => setLoadingStep(4), 2400)

    if (campaignNiche.length === 0 && campaignCategory.length === 0) {
      alert("Please select at least one Category or Niche before running AI matching.");
      setMatching(false);
      setLoadingStep(0);
      return;
    }

    try {
      const data = await apiCall("post", "/ai/match", {
        campaign: {
          niche: [...campaignNiche, ...campaignCategory].join(", "),
          budget: Number(campaignBudget) || 1000,
          target_audience: "general",
          description: "Match me with top creators"
        }
      })
      setTimeout(() => {
        const matchData = data as MatchResponse
        setMatches(matchData.results)
        setMatching(false)
        setLoadingStep(0)
      }, 3200)
    } catch (err: any) {
      setMatching(false)
      setLoadingStep(0)
      const msg = err.response?.data?.error || err.message || "Match failed";
      alert(`AI Match Failed: ${msg}`);
    }
  }

  const sendInvite = async () => {
    if (!inviteInf || !inviteDeliverable || !inviteBudget) return
    setInviteLoading(true)
    try {
      const res = await apiCall("post", "/negotiations", {
        influencerId: inviteInf.id,
        offeredBudget: parseInt(inviteBudget),
        deliverable: inviteDeliverable,
        videoLength: campaignVideoLength.length > 0 ? campaignVideoLength.join(", ") : "Any"
      })
      if (res && typeof res === 'object' && 'error' in res) {
          throw new Error(String(res.error))
      }
      setInviteInf(null)
      setInviteDeliverable("")
      setInviteBudget("")
      alert("Invite sent successfully! They can review it in their dashboard.")
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.error || err.message || "Failed to send invite."
      alert(msg)
    } finally {
      setInviteLoading(false)
    }
  }

  const filteredInfluencers = matches.length > 0 
    ? matches
      .map(m => ({ ...influencers.find(i => i.id === m.id), ...m }))
      .filter((inf): inf is Influencer => Boolean(inf.id))
    : influencers;

  const displayResults = filteredInfluencers.filter(inf => {
    if (campaignNiche.length > 0 && (!inf.niche || !campaignNiche.includes(inf.niche))) return false;
    if (campaignVideoLength.length > 0 && (!inf.videoLength || !campaignVideoLength.includes(inf.videoLength))) return false;
    if (campaignBudget) {
      const price = inf.pricing;
      const budget = parseInt(campaignBudget);
      if (budget === 500 && price > 500) return false;
      if (budget === 2000 && (price < 500 || price > 2000)) return false;
      if (budget === 5000 && price < 2000) return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/brand')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-400" />
            AI Discovery Engine
          </h1>
          <p className="text-slate-400">Minimal, precision-targeted search for the perfect influencer.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-blue-500/20 shadow-blue-900/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {["Tech", "Gaming", "Beauty", "Lifestyle", "Fashion", "Food", "Travel", "Finance"].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => toggleSelection(opt, campaignCategory, setCampaignCategory)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${campaignCategory.includes(opt) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Budget Range</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 focus:ring-2 focus:ring-blue-500 text-sm" value={campaignBudget} onChange={e => setCampaignBudget(e.target.value)}>
                <option value="">Any Budget</option>
                <option value="500">Under ₹500</option>
                <option value="2000">₹500 - ₹2,000</option>
                <option value="5000">₹2,000+</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Niche</label>
              <div className="flex flex-wrap gap-2">
                {["Hardware", "Software", "Makeup", "Fitness", "SaaS", "Skincare", "Vlogging", "Crypto"].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => toggleSelection(opt, campaignNiche, setCampaignNiche)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${campaignNiche.includes(opt) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Video Length</label>
              <div className="flex flex-wrap gap-2">
                {["60s", "3min", "5min", "15min"].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => toggleSelection(opt, campaignVideoLength, setCampaignVideoLength)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${campaignVideoLength.includes(opt) ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <Button 
              className="py-2.5 h-[42px] text-white shadow-lg shadow-blue-900/20 font-bold bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" 
              onClick={handleMatch} 
              disabled={matching}
            >
              {matching ? "Analyzing..." : "Run AI Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {matching && (
        <Card className="bg-slate-950 border-blue-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-blue-500 animate-pulse w-full transition-all duration-1000" style={{ transform: `scaleX(${loadingStep / 4})`, transformOrigin: 'left' }} />
          </div>
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
            <TerminalSquare className="h-8 w-8 text-blue-500 animate-bounce" />
            <div className="space-y-2 font-mono text-sm text-blue-400">
              <p className={loadingStep >= 1 ? "opacity-100" : "opacity-0"}>&gt; Loading Random Forest recommender...</p>
              <p className={loadingStep >= 2 ? "opacity-100" : "opacity-0"}>&gt; Normalizing reach, engagement, and budget fit...</p>
              <p className={loadingStep >= 3 ? "opacity-100" : "opacity-0"}>&gt; Encoding niche and audience signals...</p>
              <p className={loadingStep >= 4 ? "opacity-100" : "opacity-0"}>&gt; Finalizing match scores and ranking candidates...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!matching && (
        <div className="space-y-4">
          {matches.length > 0 && <h3 className="text-xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-green-400" /> AI Matches</h3>}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayResults.map((inf, i) => {
              const displayScore = typeof inf.score === "number" ? Math.round(inf.score * 100) : null;
              return (
                <Card key={i} className="group hover:border-blue-500/40 transition-all hover:bg-slate-800/50 flex flex-col">
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg">
                        {inf.name[0]}
                      </div>
                      {displayScore !== null && <Badge variant="ai" className="px-2 py-1">Score: {displayScore}%</Badge>}
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg">{inf.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{inf.platform}</Badge>
                        <Badge variant="outline" className="text-[10px]">{inf.niche}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{inf.bio || "No bio provided."}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Base Rate</p>
                        <p className="font-bold text-white">₹{inf.pricing}</p>
                      </div>
                      <Button onClick={() => setInviteInf(inf)} className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-900/20">
                        Send Invite <Send className="h-3 w-3 ml-1.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteInf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-slate-900 border-slate-700 animate-in fade-in zoom-in-95">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Invite {inviteInf.name}</h3>
              <p className="text-sm text-slate-400">Propose a project and budget to start a negotiation.</p>
              
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Deliverable</label>
                <input className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" placeholder="e.g. 1 Sponsored YouTube Video" value={inviteDeliverable} onChange={e => setInviteDeliverable(e.target.value)} />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Offered Budget (₹)</label>
                <input type="number" className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white text-sm" placeholder={inviteInf.pricing.toString()} value={inviteBudget} onChange={e => setInviteBudget(e.target.value)} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={sendInvite} disabled={inviteLoading || !inviteDeliverable || !inviteBudget} className="bg-blue-600 hover:bg-blue-700 font-bold flex-1">
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </Button>
                <Button variant="outline" onClick={() => { setInviteInf(null); setInviteDeliverable(""); setInviteBudget(""); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
