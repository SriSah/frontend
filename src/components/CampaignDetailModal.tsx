"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency } from "@/lib/utils"
import { apiCall } from "@/lib/api"
import {
  X, DollarSign, FileText, Clock, CheckCircle2,
  MessageSquare, ArrowRight, Pen, Send, RefreshCw,
  Sparkles, ExternalLink, Lock, AlertCircle
} from "lucide-react"

interface Negotiation {
  id: string
  offeredBudget: number
  counterBudget?: number | null
  finalBudget?: number | null
  deliverable: string
  videoLength?: string | null
  initiatedBy: string
  status: string
  brandAccepted: boolean
  influencerAccepted: boolean
  brandSigned: boolean
  influencerSigned: boolean
  note?: string | null
  counterNote?: string | null
  brand?: { name: string }
  influencer?: { name: string }
}

interface Campaign {
  id: string
  deliverable: string
  status: string
  budget: number
  niche?: string | null
  videoLength?: string | null
  isPublic?: boolean
  brand?: { id: string; name: string; industry?: string | null }
  influencer?: { id: string; name: string; niche?: string | null } | null
  contractSignedAt?: string | null
  txHash?: string | null
  submissionUrl?: string | null
  revisionNote?: string | null
}

interface CampaignDetailModalProps {
  campaign: Campaign
  role: "BRAND" | "INFLUENCER"
  userId?: string
  onClose: () => void
  onRefresh: () => void
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-700/50 text-slate-300 border-slate-600",
  NEGOTIATING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  FUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  DELIVERED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  NEEDS_REVISION: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
}

export function CampaignDetailModal({ campaign, role, onClose, onRefresh }: CampaignDetailModalProps) {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [loadingNegs, setLoadingNegs] = useState(false)
  const [showNegs, setShowNegs] = useState(false)
  const [offerBudget, setOfferBudget] = useState("")
  const [offerNote, setOfferNote] = useState("")
  const [counterBudget, setCounterBudget] = useState("")
  const [counterNote, setCounterNote] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeNeg, setActiveNeg] = useState<Negotiation | null>(null)
  
  // Escrow States
  const [submissionUrl, setSubmissionUrl] = useState(campaign.submissionUrl || "")
  const [revisionMsg, setRevisionMsg] = useState("")

  const loadNegotiations = async () => {
    setLoadingNegs(true)
    try {
      const data = await apiCall("get", "/negotiations") as Negotiation[]
      // Filter to those linked to this campaign or between these parties
      setNegotiations(data)
      setShowNegs(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingNegs(false)
    }
  }

  const sendOffer = async () => {
    if (!offerBudget) return
    const budgetNum = parseInt(offerBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      alert("Offer budget must be a number greater than 0.");
      return;
    }
    setActionLoading("offer")
    try {
      const payload: Record<string, unknown> = {
        offeredBudget: parseInt(offerBudget),
        deliverable: campaign.deliverable,
        videoLength: campaign.videoLength,
        note: offerNote,
        campaignId: campaign.id,
      }
      if (role === "BRAND") {
        payload.influencerId = campaign.influencer?.id
      } else {
        payload.brandId = campaign.brand?.id
      }
      await apiCall("post", "/negotiations", payload)
      setOfferBudget("")
      setOfferNote("")
      await loadNegotiations()
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAccept = async (negId: string) => {
    setActionLoading(negId)
    try {
      const updated = await apiCall("patch", `/negotiations/${negId}/accept`) as Negotiation
      setActiveNeg(updated)
      await loadNegotiations()
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (negId: string) => {
    setActionLoading(negId + "_reject")
    try {
      await apiCall("patch", `/negotiations/${negId}/reject`)
      await loadNegotiations()
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCounter = async (negId: string) => {
    if (!counterBudget) return
    const budgetNum = parseInt(counterBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      alert("Counter offer must be a number greater than 0.");
      return;
    }
    setActionLoading(negId + "_counter")
    try {
      const updated = await apiCall("patch", `/negotiations/${negId}/counter`, {
        counterBudget: parseInt(counterBudget),
        counterNote
      }) as Negotiation
      setActiveNeg(updated)
      setCounterBudget("")
      setCounterNote("")
      await loadNegotiations()
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSign = async (negId: string) => {
    setActionLoading(negId + "_sign")
    try {
      await apiCall("patch", `/negotiations/${negId}/sign`)
      await loadNegotiations()
      onRefresh()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // --- ESCROW HANDLERS ---
  const handleSubmitWork = async () => {
    if (!submissionUrl) return;
    setActionLoading("submit_work");
    try {
      await apiCall("post", `/campaigns/${campaign.id}/submit`, { submissionUrl });
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const handleDeposit = async () => {
    setActionLoading("deposit_funds");
    try {
      await apiCall("post", `/campaigns/${campaign.id}/deposit`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const handleVerify = async () => {
    setActionLoading("verify_work");
    try {
      await apiCall("post", `/campaigns/${campaign.id}/complete`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }
  const handleRevision = async () => {
    if (!revisionMsg) return;
    setActionLoading("request_revision");
    try {
      await apiCall("post", `/campaigns/${campaign.id}/revision`, { note: revisionMsg });
      setRevisionMsg("");
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }
  useEffect(() => {
    loadNegotiations()
    setSubmissionUrl(campaign.submissionUrl || "")
  }, [campaign.id, campaign.submissionUrl])

  const activeNegotiation = negotiations.find(n => ['PENDING', 'COUNTERED', 'ACCEPTED'].includes(n.status))
  const statusCls = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <Card className="w-full max-w-2xl my-4 animate-in fade-in zoom-in-95 duration-200 bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl font-bold">Campaign Details</CardTitle>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${statusCls}`}>
                {campaign.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm">#{campaign.id.slice(-8)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Campaign Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Deliverable
                </p>
                <p className="text-white font-medium">{campaign.deliverable}</p>
              </div>
              {campaign.niche && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Niche</p>
                  <Badge variant="outline">{campaign.niche}</Badge>
                </div>
              )}
              {campaign.videoLength && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Video Length
                  </p>
                  <p className="text-white">{campaign.videoLength}</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Budget
                </p>
                <p className="text-2xl font-bold text-white">{formatCurrency(campaign.budget)}</p>
              </div>
              {campaign.brand && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Brand</p>
                  <p className="text-white">{campaign.brand.name}</p>
                  {campaign.brand.industry && <p className="text-slate-500 text-xs">{campaign.brand.industry}</p>}
                </div>
              )}
              {campaign.influencer && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Influencer</p>
                  <p className="text-white">{campaign.influencer.name}</p>
                </div>
              )}
              {campaign.contractSignedAt && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-400" /> Signed
                  </p>
                  <p className="text-green-400 text-xs">{new Date(campaign.contractSignedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Escrow & Work Section */}
          {['ACTIVE', 'DELIVERED', 'FUNDED', 'NEEDS_REVISION', 'COMPLETED'].includes(campaign.status) && (
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Escrow & Fulfillment
              </h4>

              {/* Mini Timeline Tracker */}
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex flex-col items-center gap-1 w-1/3">
                  <div className={`h-4 w-4 rounded-full ${['ACTIVE', 'DELIVERED', 'FUNDED', 'NEEDS_REVISION', 'COMPLETED'].includes(campaign.status) ? "bg-emerald-500" : "bg-slate-700"}`} />
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">Agreement Signed</p>
                </div>
                <div className={`h-0.5 flex-1 ${['DELIVERED', 'FUNDED', 'NEEDS_REVISION', 'COMPLETED'].includes(campaign.status) ? "bg-emerald-500" : "bg-slate-700"} -mt-5`} />
                <div className="flex flex-col items-center gap-1 w-1/3">
                  <div className={`h-4 w-4 rounded-full ${['FUNDED', 'NEEDS_REVISION', 'COMPLETED'].includes(campaign.status) ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : "bg-slate-700"} flex items-center justify-center`} />
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">Funds Locked</p>
                </div>
                <div className={`h-0.5 flex-1 ${['COMPLETED'].includes(campaign.status) ? "bg-blue-500" : "bg-slate-700"} -mt-5`} />
                <div className="flex flex-col items-center gap-1 w-1/3">
                  <div className={`h-4 w-4 rounded-full ${['COMPLETED'].includes(campaign.status) ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" : "bg-slate-700"} flex items-center justify-center`} />
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">Funds Released</p>
                </div>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-4 relative overflow-hidden">
                {/* Visual subtle blockchain background grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay pointer-events-none" />
                
                <div className="relative z-10">
                  {/* STAGE 1: ACTIVE (Signed, waiting for deposit) */}
                  {campaign.status === 'ACTIVE' && role === 'BRAND' && (
                    <div className="space-y-3 text-center">
                      <p className="text-sm text-blue-400 font-bold">Contract Signed! Next Step: Escrow</p>
                      <p className="text-sm text-slate-300">Deposit {formatCurrency(campaign.budget)} to the smart contract to secure the deal and allow the influencer to start work.</p>
                      <Button onClick={handleDeposit} disabled={!!actionLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        {actionLoading === "deposit_funds" ? "Locking Funds on Chain..." : `Deposit ${formatCurrency(campaign.budget)} to Escrow`}
                      </Button>
                    </div>
                  )}
                  {campaign.status === 'ACTIVE' && role === 'INFLUENCER' && (
                    <p className="text-slate-400 text-sm text-center py-2 italic">Contract signed. Waiting for Brand to deposit funds into escrow before you can submit work...</p>
                  )}

                  {/* STAGE 2: FUNDED or NEEDS_REVISION (waiting for submission) */}
                  {['FUNDED', 'NEEDS_REVISION'].includes(campaign.status) && role === 'INFLUENCER' && (
                    <div className="space-y-3">
                      <p className="text-sm text-blue-400 font-bold flex items-center gap-2">
                        {campaign.status === 'NEEDS_REVISION' ? <AlertCircle className="h-4 w-4 text-yellow-400" /> : <Lock className="h-4 w-4" />}
                        {campaign.status === 'NEEDS_REVISION' ? "Revision Requested" : "Funds Secured in Escrow!"}
                      </p>
                      
                      {campaign.status === 'NEEDS_REVISION' && campaign.revisionNote && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded text-sm text-yellow-200 italic mb-2">
                          <span className="font-bold text-yellow-500 non-italic block mb-1">Brand Feedback:</span>
                          &quot;{campaign.revisionNote}&quot;
                        </div>
                      )}

                      <p className="text-sm text-slate-300">
                        {campaign.status === 'NEEDS_REVISION' ? "Please review the feedback and re-submit the updated link." : "The money is locked in the smart contract. You can now safely submit your work URL."}
                      </p>
                      <input
                        type="text"
                        placeholder="https://youtube.com/..."
                        className="w-full text-sm px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={submissionUrl}
                        onChange={e => setSubmissionUrl(e.target.value)}
                      />
                      <Button onClick={handleSubmitWork} disabled={!!actionLoading || !submissionUrl} className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        {actionLoading === "submit_work" ? "Submitting..." : (campaign.status === 'NEEDS_REVISION' ? "Re-submit Deliverable" : "Submit Deliverable")}
                      </Button>
                    </div>
                  )}

                  {campaign.status === 'NEEDS_REVISION' && role === 'BRAND' && (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-sm text-yellow-400 font-bold flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" /> Revision in Progress
                      </p>
                      <p className="text-sm text-slate-400 italic">Waiting for Influencer to re-submit work based on your feedback...</p>
                    </div>
                  )}
                  {campaign.status === 'FUNDED' && role === 'BRAND' && (
                    <div className="text-center py-4 space-y-2">
                       <p className="text-sm text-blue-400 font-bold flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4" /> Funds Locked on Chain
                      </p>
                      <p className="text-sm text-slate-400 italic">Waiting for Influencer to submit their work...</p>
                    </div>
                  )}

                  {/* STAGE 3: DELIVERED (Submitted, waiting for verification) */}
                  {campaign.status === 'DELIVERED' && role === 'BRAND' && (
                    <div className="space-y-4">
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded text-sm break-all text-blue-400">
                        <span className="text-slate-500 block mb-1 font-bold text-xs">Submission Link:</span>
                        <a href={campaign.submissionUrl || "#"} target="_blank" rel="noreferrer" className="underline hover:text-blue-300 transition-colors">{campaign.submissionUrl}</a>
                      </div>
                      <p className="text-sm text-slate-300 text-center">Please review the work. You can either release the funds or request changes.</p>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleVerify} disabled={!!actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          {actionLoading === "verify_work" ? "Releasing..." : "Verify & Payout"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowNegs(!showNegs)} className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                          Request Changes
                        </Button>
                      </div>

                      {showNegs && (
                        <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                          <textarea
                            placeholder="What needs to be changed? (e.g. Please use the blue logo...)"
                            className="w-full text-sm px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white h-20 resize-none mb-2"
                            value={revisionMsg}
                            onChange={e => setRevisionMsg(e.target.value)}
                          />
                          <Button 
                            onClick={handleRevision} 
                            disabled={!revisionMsg || !!actionLoading}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 font-bold"
                          >
                            {actionLoading === "request_revision" ? "Sending..." : "Send Revision Request"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {campaign.status === 'DELIVERED' && role === 'INFLUENCER' && (
                    <p className="text-sm text-emerald-400 italic text-center py-4 font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Work submitted! Waiting for Brand to verify and release funds.
                    </p>
                  )}

                  {campaign.status === 'COMPLETED' && (
                    <div className="text-center space-y-3">
                      <p className="text-sm text-purple-400 font-bold flex items-center justify-center gap-1">
                        <Sparkles className="h-4 w-4" /> Campaign Complete!
                      </p>
                      <p className="text-sm text-slate-300">Funds released to Influencer & NFT Proof-of-Work Minted.</p>
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded text-sm break-all text-blue-400 text-left">
                        <span className="text-slate-500 block mb-1 font-bold text-xs">Submission Link:</span>
                        <a href={campaign.submissionUrl || "#"} target="_blank" rel="noreferrer" className="underline hover:text-blue-300 transition-colors">{campaign.submissionUrl}</a>
                      </div>
                      
                      {campaign.txHash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${campaign.txHash}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors border border-purple-500/30"
                        >
                          <ExternalLink className="h-3 w-3" /> View Escrow Release Transaction
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Negotiation Section (Only show if not Active+) */}
          {['DRAFT', 'NEGOTIATING', 'CANCELLED'].includes(campaign.status) && (
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" /> Negotiation
                </h4>
                <Button variant="outline" size="sm" onClick={loadNegotiations} disabled={loadingNegs}>
                  {loadingNegs
                    ? <span className="h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    : <RefreshCw className="h-3 w-3" />}
                  <span className="ml-1.5">Load Offers</span>
                </Button>
              </div>

              {/* Active negotiation thread */}
              {showNegs && negotiations.length === 0 && (
                <p className="text-slate-400 text-sm">Waiting for Brand to sign the final contract...</p>
              )}

              {negotiations.map(neg => (
                <div key={neg.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[neg.status] || STATUS_COLORS.DRAFT}`}>
                        {neg.status}
                      </span>
                      <span className="text-xs text-slate-500">by {neg.initiatedBy === 'BRAND' ? neg.brand?.name : neg.influencer?.name}</span>
                    </div>
                    <span className="text-blue-400 font-bold">{formatCurrency(neg.offeredBudget)}</span>
                  </div>

                  {neg.note && (
                    <p className="text-slate-300 text-sm italic">&quot;{neg.note}&quot;</p>
                  )}

                  {neg.counterBudget && (
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-3 w-3 text-purple-400" />
                      <span className="text-slate-400">Counter offer:</span>
                      <span className="text-purple-400 font-bold">{formatCurrency(neg.counterBudget)}</span>
                      {neg.counterNote && <span className="text-slate-500 italic">&mdash; &quot;{neg.counterNote}&quot;</span>}
                    </div>
                  )}

                  {/* Acceptance status */}
                  <div className="flex gap-3 text-xs">
                    <span className={neg.brandAccepted ? "text-green-400" : "text-slate-500"}>
                      {neg.brandAccepted ? "✓" : "○"} Brand accepted
                    </span>
                    <span className={neg.influencerAccepted ? "text-green-400" : "text-slate-500"}>
                      {neg.influencerAccepted ? "✓" : "○"} Influencer accepted
                    </span>
                  </div>

                  {/* Action buttons */}
                  {['PENDING', 'COUNTERED'].includes(neg.status) && (
                    <div className="flex gap-2 flex-wrap pt-1">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAccept(neg.id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === neg.id ? <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        <span className="ml-1.5">Accept</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleReject(neg.id)}
                        disabled={!!actionLoading}
                      >
                        Reject
                      </Button>
                      <div className="flex gap-1 items-center">
                        <input
                          type="number"
                          placeholder="Counter ₹"
                          className="w-24 text-xs px-2 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
                          value={counterBudget}
                          onChange={e => setCounterBudget(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Note (opt.)"
                          className="w-28 text-xs px-2 py-1.5 rounded bg-slate-950 border border-slate-700 text-white"
                          value={counterNote}
                          onChange={e => setCounterNote(e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                          onClick={() => handleCounter(neg.id)}
                          disabled={!!actionLoading || !counterBudget}
                        >
                          Counter
                        </Button>
                      </div>
                    </div>
                  )}

                  {neg.status === 'ACCEPTED' && (
                    <div className="pt-1">
                      <p className="text-green-400 text-sm font-semibold flex items-center gap-1 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> Both parties agreed! Ready to sign.
                      </p>
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold"
                        onClick={() => handleSign(neg.id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === neg.id + "_sign"
                          ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Pen className="h-4 w-4" />}
                        <span className="ml-2">Sign Contract & Activate</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Send new offer (only if no active negotiation exists) */}
              {!activeNegotiation && campaign.status !== 'CANCELLED' && (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-400" />
                    {role === "BRAND" ? "Send offer to influencer" : "Pitch your price"}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Offer budget (₹)"
                      className="flex-1 text-sm px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white"
                      value={offerBudget}
                      onChange={e => setOfferBudget(e.target.value)}
                    />
                  </div>
                  <textarea
                    placeholder="Add a note (optional)..."
                    className="w-full text-sm px-3 py-2 rounded bg-slate-950 border border-slate-700 text-white h-16 resize-none"
                    value={offerNote}
                    onChange={e => setOfferNote(e.target.value)}
                  />
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                    onClick={sendOffer}
                    disabled={!offerBudget || !!actionLoading}
                  >
                    {actionLoading === "offer"
                      ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="h-4 w-4" />}
                    <span className="ml-2">Send Offer</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
