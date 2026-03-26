import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Zap, ShieldCheck, BarChart3, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
        </div>
        
        <div className="container mx-auto px-6 text-center">
          <Badge variant="ai" className="mb-6 px-4 py-1.5 text-sm">Now Powered by Llama 3.1 & Polygon</Badge>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            The Future of Influencer <br /> Engineering is Here.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 text-balance">
            InfluenceX uses deep semantic matching to pair brands with verified influencers. 
            Automated campaign logic, instant NFT proof-of-work, and zero-trust verification.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">Get Started</Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 border-slate-700">View Ecosystem</Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "AI Matches", value: "1,200+" },
              { label: "Blockchain Tx", value: "50k+" },
              { label: "Active Brands", value: "450" },
              { label: "NFTs Minted", value: "8.4k" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold mb-1 text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-900/50 hover:border-blue-500/50 transition-colors group">
            <CardContent className="pt-8">
              <div className="h-12 w-12 rounded-lg bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">On-Chain Verification</h3>
              <p className="text-slate-400 leading-relaxed">
                Every campaign is a smart contract. Deliverables are minted as unique ERC-721 NFTs on Polygon.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 hover:border-purple-500/50 transition-colors group">
            <CardContent className="pt-8">
              <div className="h-12 w-12 rounded-lg bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-purple-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Semantic AI Matching</h3>
              <p className="text-slate-400 leading-relaxed">
                Groq-powered Llama 3.1 analyzes niches, bios, and engagement to find the perfect semantic fit.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 hover:border-indigo-500/50 transition-colors group">
            <CardContent className="pt-8">
              <div className="h-12 w-12 rounded-lg bg-indigo-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-indigo-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">ROI Analytics</h3>
              <p className="text-slate-400 leading-relaxed">
                Real-time tracking of engagement vs costs with high-fidelity charts and dashboard insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="h-5 w-5 text-blue-500" />
            InfluenceX
          </div>
          <p className="text-slate-500 text-sm">© 2026 InfluenceX Intelligence Systems. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
