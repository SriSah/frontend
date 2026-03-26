"use client"
import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { apiCall } from "@/lib/api"
import { 
  Wallet, Award, DollarSign, Clock, Settings, 
  ExternalLink, CheckCircle, Smartphone 
} from "lucide-react"

export default function InfluencerDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [pricing, setPricing] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [prof, camps] = await Promise.all([
      apiCall("get", "/influencers/me"),
      apiCall("get", "/campaigns")
    ])
    setProfile(prof)
    setPricing(prof.pricing)
    setCampaigns(camps)
  }

  const updatePricing = async () => {
    try {
      await apiCall("patch", "/influencers/me/pricing", { pricing })
      alert("Base rate updated!")
    } catch (err) {
      console.error(err)
    }
  }

  const completeCampaign = async (id: number) => {
    try {
      const res = await apiCall("post", `/campaigns/${id}/complete`)
      alert(`Success! NFT Minted.`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  if (!profile) return <div className="p-10 text-center text-slate-500 font-bold">Loading Profile Assets...</div>

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 flex gap-6 items-center">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-black">
            {profile.name[0]}
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">{profile.name}</h2>
            <div className="flex gap-2">
              <Badge variant="secondary"><Award className="h-3 w-3 mr-1" /> Verified Partner</Badge>
              <Badge variant="outline">{profile.platform}</Badge>
              <Badge variant="outline">{profile.niche}</Badge>
              <Badge variant="success">{profile.engagementRate}% Engagement</Badge>
            </div>
            <p className="text-slate-400 text-sm max-w-md">{profile.bio}</p>
          </div>
        </div>

        <Card className="bg-slate-900 w-full md:w-auto min-w-[300px]">
          <CardContent className="p-6 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <DollarSign className="h-4 w-4" /> Base Rate (USD)
                </div>
             </div>
             <div className="flex gap-3">
               <input 
                 type="number"
                 className="flex-1 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-lg font-bold outline-none font-bold"
                 value={pricing}
                 onChange={(e) => setPricing(parseInt(e.target.value))}
               />
               <Button onClick={updatePricing} size="icon" variant="ghost">
                 <Settings className="h-4 w-4" />
               </Button>
             </div>
             <p className="text-[10px] text-slate-500 italic">Adjusting rate affects future AI match scoring.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Active Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Active Deliverables
          </h3>
          
          <div className="space-y-4">
            {campaigns.filter(c => c.status !== 'COMPLETED').map((camp, i) => (
              <Card key={i} className="hover:border-slate-700 transition-colors">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-blue-400">Campaign #{camp.id}</p>
                    <h4 className="font-bold text-lg">{camp.deliverable}</h4>
                    <p className="text-slate-500 text-sm">Status: <span className="text-white uppercase font-bold text-xs">{camp.status}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold mb-3">${camp.budget}</p>
                    <Button onClick={() => completeCampaign(camp.id)} className="bg-blue-600 hover:bg-blue-700 font-bold">
                       Submit for Proof-of-Work
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {campaigns.filter(c => c.status !== 'COMPLETED').length === 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                No active campaigns found. Check back later.
              </div>
            )}
          </div>
        </div>

        {/* Right: NFT Wallet / History */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-400" />
            On-Chain History
          </h3>
          <div className="space-y-4">
            {campaigns.filter(c => c.status === 'COMPLETED').map((camp, i) => (
              <Card key={i} className="bg-slate-900/20 border-slate-800">
                <CardContent className="p-4 flex gap-4 items-center font-bold">
                  <div className="h-10 w-10 rounded bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-xs text-slate-500">NFT Token ID</p>
                    <p className="font-mono text-sm text-green-400">#{camp.nftTokenId || 'Minting...'}</p>
                  </div>
                  <a 
                    href={`https://amoy.polygonscan.com/tx/${camp.txHash}`} 
                    target="_blank" 
                    className="p-2 hover:bg-slate-800 rounded text-slate-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
