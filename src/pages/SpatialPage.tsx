import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Input } from "@/components/ui/input";
import { Map as MapIcon, Navigation, Search, MapPin, Globe, Loader2, Zap } from "lucide-react";
import { chatService } from "@/lib/chat";
export function SpatialPage() {
  const [route, setRoute] = useState<any>(null);
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [loading, setLoading] = useState(false);
  const findRoute = async () => {
    if (!origin || !dest) return;
    setLoading(true);
    try {
      const data = await chatService.getDirections(origin, dest);
      setRoute(data);
    } catch (error) {
      console.error('Route calculation failed:', error);
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AppLayout peripheral={
      <div className="p-6 space-y-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black flex items-center gap-2">
          <Navigation size={12} className="text-bio-cyan" /> Route Telemetry
        </h3>
        {route ? (
          <div className="space-y-4">
            {route.steps?.map((step: string, i: number) => (
              <NeuralCard key={i} className="p-3 bg-white/5 border-white/5 text-[11px] text-white/70">
                {step}
              </NeuralCard>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-white/20 italic font-mono">Awaiting spatial input...</p>
        )}
      </div>
    }>
      <div className="h-full flex flex-col">
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapIcon className="text-bio-cyan w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">Spatial Awareness</h1>
          </div>
          <div className="flex items-center gap-4">
            <Input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Origin Node" className="h-9 w-40 bg-white/5 text-xs" />
            <Input value={dest} onChange={e => setDest(e.target.value)} placeholder="Destination" className="h-9 w-40 bg-white/5 text-xs" />
            <button onClick={findRoute} className="p-2 rounded-lg bg-bio-cyan/10 text-bio-cyan hover:bg-bio-cyan/20 transition-all"><Search size={18} /></button>
          </div>
        </header>
        <div className="flex-1 relative bg-[#0a0e1a] overflow-hidden">
          {/* Mock Map Visualization */}
          <div className="absolute inset-0 opacity-40">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 212, 255, 0.1)" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
              {route && (
                <path d="M 20 80 Q 50 20 80 50" fill="none" stroke="#00d4ff" strokeWidth="1" strokeDasharray="2,2" className="animate-[dash_20s_linear_infinite]" />
              )}
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {loading ? (
              <div className="flex flex-col items-center gap-4 bg-neural-bg/80 backdrop-blur-xl p-8 rounded-3xl border border-bio-cyan/20 shadow-glow">
                <Loader2 size={32} className="text-bio-cyan animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-bio-cyan">Recalibrating Topology</span>
              </div>
            ) : !route ? (
              <div className="flex flex-col items-center gap-4 opacity-20">
                <Globe size={80} className="text-white" />
                <p className="uppercase tracking-[0.5em] text-xs font-black">Spatial Field Inactive</p>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <NeuralCard className="absolute top-20 left-20 p-4 w-48 shadow-glow animate-float-slow">
                  <div className="flex items-center gap-2 mb-2"><MapPin size={14} className="text-bio-cyan" /><span className="text-[10px] font-bold text-bio-cyan uppercase">Origin</span></div>
                  <p className="text-xs font-medium text-white/90">{origin}</p>
                </NeuralCard>
                <NeuralCard className="absolute bottom-40 right-40 p-4 w-48 shadow-glow-violet animate-float-slow" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-2 mb-2"><Zap size={14} className="text-memory-violet" /><span className="text-[10px] font-bold text-memory-violet uppercase">Target</span></div>
                  <p className="text-xs font-medium text-white/90">{dest}</p>
                </NeuralCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}