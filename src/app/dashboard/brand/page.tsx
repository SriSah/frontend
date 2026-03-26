"use client"
import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { apiCall } from "@/lib/api"
import { CampaignModal } from "@/components/CampaignModal"
import { 
  Search, BarChart3, TrendingUp, Users, Target, CheckCircle2, 
  ExternalLink, Sparkles, AlertCircle 
} from "lucide-react"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'

const data = [
  { name: 'Jan', reach: 4000, conv: 2400 },
  { name: 'Feb', reach: 3000, conv: 1398 },
  { name: 'Mar', reach: 2000, conv: 9800 },
  { name: 'Apr', reach: 2780, conv: 3908 },
  { name: 'May', reach: 1890, conv: 4800 },
  { name: 'Jun', reach: 2390, conv: 3800 },
]

export default function BrandDashboard() {
  const [brand, setBrand] = useState<any>(null)
  const [influencers, setInfluencers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [campaignSearch, setCampaignSearch] = useState("")
  const [matching, setMatching] = useState(false)
  const [selectedInf, setSelectedInf] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [brandData, infData] = await Promise.all([
        apiCall("get", "/brands/me"),
        apiCall("get", "/influencers")
      ])
      setBrand(brandData)
      setInfluencers(infData)
    } catch (err) {
      console.warn("Failed to fetch brand/influencers", err)
    }
  }

  const handleMatch = async () => {
    if (!campaignSearch) return
    setMatching(true)
    try {
      const data = await apiCall("post", "/ai/match", { campaignDesc: campaignSearch })
      setMatches(data.results)
    } finally {
      setMatching(false)
    }
  }

  const createCampaign = async (campaignData: any) => {
    try {
      await apiCall("post", "/campaigns", campaignData)
      setSelectedInf(null)
      alert("Campaign Created On-Chain!")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Analytics Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary"><TrendingUp className="h-3 w-3 mr-1" /> ROI +12%</Badge>
              <BarChart3 className="text-blue-500 h-6 w-6" />
            </div>
            <p className="text-slate-400 text-sm">{brand?.name || 'Campaign'} Spend</p>
            <h2 className="text-3xl font-bold text-white">$45,200</h2>
            <div className="h-24 mt-4 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                   <Area type="monotone" dataKey="reach" stroke="#3b82f6" fill="#3b82f633" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-950">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary">Global Reach</Badge>
              <Users className="text-purple-500 h-6 w-6" />
            </div>
            <p className="text-slate-400 text-sm">Total Audience</p>
            <h2 className="text-3xl font-bold text-white">2.4M</h2>
            <div className="h-24 mt-4 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                   <Line type="monotone" dataKey="conv" stroke="#a855f7" strokeWidth={2} dot={false} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-950">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary">Active Contracts</Badge>
              <CheckCircle2 className="text-green-500 h-6 w-6" />
            </div>
            <p className="text-slate-400 text-sm">Active Campaigns</p>
            <h2 className="text-3xl font-bold text-white">14</h2>
            <div className="mt-4 space-y-2">
              <div className="w-full bg-slate-800 rounded-full h-1.5 font-bold">
                <div className="bg-green-500 h-1.5 rounded-full w-[65%]" />
              </div>
              <p className="text-xs text-slate-500">65% Fulfillment Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Search Section */}
      <Card className="bg-slate-900 border-blue-500/20 shadow-blue-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            AI Influencer Sourcing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input 
                placeholder="Describe your campaign (e.g. Mechanical keyboard review for tech enthusiasts)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
              />
            </div>
            <Button className="md:w-32 py-2.5 h-auto text-white shadow-lg shadow-blue-900/20 font-bold" onClick={handleMatch} disabled={matching}>
              {matching ? "Matching..." : "Run AI Search"}
            </Button>
          </div>

          {/* Results Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(matches.length > 0 ? matches : influencers.map(i => ({ id: i.id, score: 0, reason: "Initial Discovery" }))).map((match, i) => {
              const inf = influencers.find(inf => inf.id === match.id) || influencers[i]
              if (!inf) return null
              
              return (
                <Card key={i} className="group hover:border-blue-500/40 transition-all hover:bg-slate-800/50">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-full bg-slate-800 group-hover:bg-blue-600 transition-colors flex items-center justify-center font-bold">
                        {inf.name[0]}
                      </div>
                      {match.score > 0 && (
                        <Badge variant="ai">Score: {match.score}</Badge>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold">{inf.name}</h4>
                      <p className="text-xs text-slate-500">{inf.platform} • {inf.niche}</p>
                    </div>
                    {match.reason && (
                      <div className="bg-slate-950 p-2 rounded text-[11px] text-slate-400 flex gap-2">
                        <Target className="h-3 w-3 text-blue-400 mt-0.5" />
                        {match.reason}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-slate-400">Rate: ${inf.pricing}</span>
                       <Button variant="ghost" size="sm" onClick={() => setSelectedInf({ ...inf, aiScore: match.score || 75 })}>
                         Hire Now <Sparkles className="h-3 w-3 ml-1" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedInf && (
        <CampaignModal 
          isOpen={!!selectedInf}
          influencer={selectedInf}
          aiScore={selectedInf.aiScore}
          onClose={() => setSelectedInf(null)}
          onSubmit={createCampaign}
        />
      )}
    </div>
  )
}
