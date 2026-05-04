"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Zap, ShieldCheck, BarChart3, ArrowRight, X, Sparkles, Network, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type FeatureType = "blockchain" | "ai" | "analytics" | null;

const FEATURES_DATA = {
  blockchain: {
    title: "On-Chain Verification & Escrow",
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-900/30",
    border: "border-blue-500/50",
    gradient: "from-blue-500 to-cyan-400",
    short: "Every campaign is a smart contract. Deliverables are minted as unique ERC-721 NFTs on Ethereum.",
    details: (
      <div className="space-y-4 text-slate-300">
        <p>Our platform uses a completely decentralized escrow system built on Ethereum testnets to eliminate trust issues between Brands and Influencers.</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Fund Locking:</strong> The negotiated INR budget is converted to native crypto (ETH) and deposited into a smart contract. The funds are locked transparently on-chain.</li>
          <li><strong>Zero-Trust Fulfillment:</strong> Influencers know the money is guaranteed. Once they submit their deliverable and the brand verifies it, the smart contract automatically releases the funds to the influencer&apos;s wallet.</li>
          <li><strong>Proof-of-Work NFTs:</strong> Upon successful completion, a unique ERC-721 NFT is minted to the influencer&apos;s wallet. This serves as an immutable, on-chain resume showing their reliability and quality of work.</li>
        </ul>
      </div>
    )
  },
  ai: {
    title: "Semantic AI Matching",
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-900/30",
    border: "border-purple-500/50",
    gradient: "from-purple-500 to-pink-400",
    short: "Groq-powered Llama 1 analyzes niches, bios, and engagement to find the perfect semantic fit.",
    details: (
      <div className="space-y-4 text-slate-300">
        <p>Stop relying on basic keyword searches. InfluenceX uses a dedicated Python FastAPI microservice utilizing local embeddings and Groq inference to deeply understand context.</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Deep Contextual Embeddings:</strong> We convert the brand&apos;s campaign description and the influencer&apos;s profile into high-dimensional vector embeddings using local sentence-transformers to capture abstract meaning.</li>
          <li><strong>Llama 1 Reasoning:</strong> Powered by Groq&apos;s lightning-fast LPU inference engine, we pass the top semantic matches to Llama-1, which reads the context and returns a final, heavily reasoned compatibility score.</li>
          <li><strong>Abstract Matching:</strong> A brand asking for "eco-friendly outdoor gear" will be matched with an influencer whose bio talks about "sustainable hiking", even if they never use the exact same keywords.</li>
        </ul>
      </div>
    )
  },
  analytics: {
    title: "ROI Analytics & Intelligence",
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-900/30",
    border: "border-emerald-500/50",
    gradient: "from-emerald-500 to-green-400",
    short: "Real-time tracking of engagement vs costs with high-fidelity charts and dashboard insights.",
    details: (
      <div className="space-y-4 text-slate-300">
        <p>Data is the most important asset for scaling marketing campaigns. Our analytics suite gives brands unprecedented visibility into performance.</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Cost-Per-Engagement (CPE):</strong> Real-time tracking of how much you are spending per actual interaction. We use the influencer&apos;s follower count and engagement rate against their negotiated base price to calculate exactly what each like and comment costs your brand.</li>
          <li><strong>Data-Driven Negotiation:</strong> Influencers set their own rates, but you can see their true CPE in real-time, allowing you to negotiate effectively based on actual mathematical ROI.</li>
          <li><strong>Automated Reporting:</strong> Export comprehensive campaign reports directly from your dashboard, showing the total lifecycle from negotiation to smart-contract release.</li>
        </ul>
      </div>
    )
  }
};

export default function Home() {
  const { role } = useAuth();
  const [activeFeature, setActiveFeature] = useState<FeatureType>(null);
  const [flowTab, setFlowTab] = useState<'brand' | 'influencer'>('brand');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle mouse tracking for the background gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-6 pb-12 lg:pt-8 lg:pb-20 overflow-hidden z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 text-sm mb-8 backdrop-blur-md shadow-2xl hover:bg-slate-200/80 dark:bg-slate-800/80 transition-colors">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-slate-300">Now Powered by <strong className="text-white">Llama 1</strong> & <strong className="text-white">Ethereum</strong></span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">The Future of</span><br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Influencer Engineering.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-400 mb-12 text-balance leading-relaxed">
            InfluenceX uses deep semantic matching to pair brands with verified influencers. 
            Automated campaign logic, instant NFT proof-of-work, and zero-trust escrow verification.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={role ? `/dashboard/${role.toLowerCase()}` : "/auth"}>
              <Button size="lg" className="h-14 bg-blue-600 hover:bg-blue-700 px-10 text-lg font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all rounded-xl">
                {role ? "Let's get started" : "Get Started Free"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-10 text-lg border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 rounded-xl"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Ecosystem
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-800/50">
            {[
              { label: "AI Matches", value: "1,200+", icon: Network },
              { label: "Escrow Locked", value: "₹50M+", icon: Coins },
              { label: "Active Brands", value: "450", icon: Zap },
              { label: "NFTs Minted", value: "8.4k", icon: ShieldCheck }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center group px-4">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-slate-200/50 dark:bg-slate-800/50 group-hover:bg-slate-700 transition-colors">
                      <Icon className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  <p className="text-3xl lg:text-4xl font-black mb-1 text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Ecosystem */}
      <section id="features" className="pt-12 pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black mb-4">A Complete <span className="text-blue-400">Ecosystem</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Click on any module below to understand the technical architecture powering InfluenceX.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(Object.keys(FEATURES_DATA) as FeatureType[]).map((key) => {
              if (!key) return null;
              const feature = FEATURES_DATA[key];
              const Icon = feature.icon;
              return (
                <button 
                  key={key} 
                  onClick={() => setActiveFeature(key)}
                  className="text-left w-full group outline-none"
                >
                  <Card className={`h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-800 hover:bg-slate-200/80 dark:bg-slate-800/80 transition-all duration-300 relative overflow-hidden`}>
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                          <Icon className={`${feature.color} h-7 w-7`} />
                        </div>
                        <div className="h-8 w-8 rounded-full border border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-slate-700 transition-all -translate-x-2 group-hover:translate-x-0">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {feature.short}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / Flow */}
      <section className="pt-12 pb-24 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-100/50 dark:bg-slate-950/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Choose your role to see the exact workflow from start to finish.</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="bg-slate-900 border border-slate-800 rounded-full p-1.5 flex shadow-lg">
              <button 
                onClick={() => setFlowTab('brand')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${flowTab === 'brand' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-200/50 dark:bg-slate-800/50'}`}
              >
                For Brands
              </button>
              <button 
                onClick={() => setFlowTab('influencer')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${flowTab === 'influencer' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-200/50 dark:bg-slate-800/50'}`}
              >
                For Influencers
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {(flowTab === 'brand' ? [
              { step: "01", title: "Create Campaign", desc: "Set your budget, deliverable requirements, and target audience." },
              { step: "02", title: "AI Matching", desc: "Our Semantic AI instantly finds and ranks the best influencers for your exact needs." },
              { step: "03", title: "Escrow Contract", desc: "Negotiate terms and lock funds securely in a Polygon smart contract." },
              { step: "04", title: "Verify & Release", desc: "Review the delivered content. One click releases the funds directly to the influencer." }
            ] : [
              { step: "01", title: "Setup Profile", desc: "Define your niche, platform, and base pricing to become searchable." },
              { step: "02", title: "Get Matched", desc: "Receive automated campaign offers from brands looking for your specific audience." },
              { step: "03", title: "Negotiate & Sign", desc: "Agree on the final price. You start work only after the brand's funds are locked on-chain." },
              { step: "04", title: "Deliver & Mint", desc: "Submit your work, get paid instantly, and earn an immutable Reputation NFT on your profile." }
            ]).map((item, i) => (
              <div key={i} className="relative p-6 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-700 transition-colors">
                <div className={`text-4xl font-black mb-4 opacity-20 ${flowTab === 'brand' ? 'text-blue-500' : 'text-purple-500'}`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-slate-700 -translate-y-1/2 z-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Details Modal */}
      {activeFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveFeature(null)} />
          <div className="relative bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`h-2 w-full bg-gradient-to-r ${FEATURES_DATA[activeFeature].gradient}`} />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${FEATURES_DATA[activeFeature].bg} flex items-center justify-center`}>
                    {(() => {
                      const Icon = FEATURES_DATA[activeFeature].icon;
                      return <Icon className={`${FEATURES_DATA[activeFeature].color} h-6 w-6`} />
                    })()}
                  </div>
                  <h3 className="text-2xl font-black">{FEATURES_DATA[activeFeature].title}</h3>
                </div>
                <button onClick={() => setActiveFeature(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="prose prose-invert prose-slate max-w-none">
                {FEATURES_DATA[activeFeature].details}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                <Button onClick={() => setActiveFeature(null)} className="bg-slate-800 hover:bg-slate-700">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-950 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <Zap className="h-6 w-6 text-blue-500" />
            InfluenceX
          </div>
          <p className="text-slate-500 dark:text-slate-500 text-sm">Copyright 2026 InfluenceX Intelligence Systems. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

