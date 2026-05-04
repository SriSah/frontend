"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency } from "@/lib/utils"
import { X, Calculator, Info } from "lucide-react"

interface CampaignModalProps {
  influencer: {
    id: number | string;
    name: string;
    platform: string;
    niche: string;
    pricing?: number;
    fraudRisk?: string;
  };
  aiScore: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { influencerId: number | string; budget: number; deliverable: string }) => void;
}

export function CampaignModal({ influencer, aiScore, isOpen, onClose, onSubmit }: CampaignModalProps) {
  const [deliverable, setDeliverable] = useState("")
  const [basePrice] = useState(influencer?.pricing || 0)
  
  if (!isOpen) return null

  // Pricing Logic:
  // +20% if AI score > 85
  // +10% niche match (simulated as true for tech/gaming in this demo)
  // -15% fraud risk (simulated if ratio was low, but here we check a mock flag)
  
  const aiPremium = aiScore > 85 ? basePrice * 0.20 : 0
  const nichePremium = (influencer.niche === 'Tech' || influencer.niche === 'Gaming') ? basePrice * 0.10 : 0
  const fraudDiscount = influencer.fraudRisk === 'high' ? basePrice * 0.15 : 0
  
  const totalBudget = basePrice + aiPremium + nichePremium - fraudDiscount

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Campaign</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-4 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
              {influencer.name[0]}
            </div>
            <div>
              <p className="font-semibold">{influencer.name}</p>
              <p className="text-sm text-slate-400">{influencer.niche} - {influencer.platform}</p>
            </div>
            <div className="ml-auto text-right">
              <Badge variant="ai">AI Score: {aiScore}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Deliverable Details</label>
            <textarea 
              className="w-full min-h-[100px] rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 1 Minute Dedicated YouTube Integration..."
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
            />
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-400" />
              Pricing Breakdown
            </h4>
            <div className="space-y-2 text-sm px-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Rate</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              {aiPremium > 0 && (
                <div className="flex justify-between text-blue-400">
                  <span className="flex items-center gap-1 italic">
                    <Info className="h-3 w-3" /> AI High Match Premium (+20%)
                  </span>
                  <span>+{formatCurrency(aiPremium)}</span>
                </div>
              )}
              {nichePremium > 0 && (
                <div className="flex justify-between text-purple-400">
                  <span>Niche Alignment (+10%)</span>
                  <span>+{formatCurrency(nichePremium)}</span>
                </div>
              )}
              {fraudDiscount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Fraud Risk Adjustment (-15%)</span>
                  <span>-{formatCurrency(fraudDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-700 pt-2 font-bold text-lg text-white">
                <span>Total Budget</span>
                <span className="text-blue-400">{formatCurrency(totalBudget)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => onSubmit({ influencerId: influencer.id, budget: totalBudget, deliverable })}
              disabled={!deliverable}
            >
              Confirm & Launch Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

