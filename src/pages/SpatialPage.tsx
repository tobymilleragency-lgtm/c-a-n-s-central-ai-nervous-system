import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Input } from "@/components/ui/input";
import { Map as MapIcon, Navigation, Search, MapPin, Globe, Loader2, Zap, Radio } from "lucide-react";
import { chatService } from "@/lib/chat";
import { motion, AnimatePresence } from "framer-motion";
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
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AppLayout peripheral={
      <div className="p-6 space-y-8 h-full flex flex-col no-scrollbar">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black flex items-center gap-2">
          <Navigation size={12} className="text-bio-cyan" /> Route Telemetry
        </h3>
        <AnimatePresence mode="popLayout">
          {route ? (
            <div className="space-y-4">
              {route.steps?.map((step: string, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <NeuralCard className="p-4 bg-white/[0.03] border-white/5 text-[11px] text-white/70 leading-relaxed font-medium">
                    <div className="flex gap-3">
                      <span className="text-bio-cyan font-mono text-[9px] mt-0.5">{i + 1}</span>
                      {step}
                    </div>
                  </NeuralCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 opacity-20 text-center gap-4">
              <Radio size={32} className="animate-pulse" />
              <p className="text-[10px] text-white font-black uppercase tracking-widest font-mono">Awaiting spatial telemetry...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    }>
      <div className="h-full flex flex-col">
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-neural-bg/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-bio-cyan/10 border border-bio-cyan/20 flex items-center justify-center">
              <MapIcon className="text-bio-cyan w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">SPATIAL AWARENESS</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl focus-within:border-bio-cyan/40 transition-all">
              <MapPin size={14} className="text-white/20" />
              <Input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="ORIGIN NODE" className="h-6 w-32 bg-transparent border-0 text-[10px] font-bold p-0 focus-visible:ring-0 uppercase tracking-widest" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl focus-within:border-bio-cyan/40 transition-all">
              <Zap size={14} className="text-white/20" />
              <Input value={dest} onChange={e => setDest(e.target.value)} placeholder="DESTINATION" className="h-6 w-32 bg-transparent border-0 text-[10px] font-bold p-0 focus-visible:ring-0 uppercase tracking-widest" />
            </div>
            <button onClick={findRoute} className="h-10 w-10 flex items-center justify-center rounded-xl bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 transition-all shadow-glow">
              <Search size={18} />
            </button>
          </div>
        </header>
        <div className="flex-1 relative bg-[#0a0e1a] overflow-hidden">
          {/* Radar Visualization */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[800px] h-[800px] border border-bio-cyan/20 rounded-full relative">
                <div className="absolute inset-0 border border-bio-cyan/10 rounded-full scale-75" />
                <div className="absolute inset-0 border border-bio-cyan/5 rounded-full scale-50" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-bio-cyan origin-left ml-[400px]" />
                </motion.div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {loading ? (
              <div className="flex flex-col items-center gap-4 bg-neural-bg/80 backdrop-blur-2xl p-10 rounded-3xl border border-bio-cyan/20 shadow-glow relative z-20">
                <Loader2 size={32} className="text-bio-cyan animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-bio-cyan">Recalibrating Topology</span>
              </div>
            ) : !route ? (
              <div className="flex flex-col items-center gap-6 opacity-10">
                <Globe size={120} className="text-white" />
                <p className="uppercase tracking-[0.8em] text-xs font-black">Spatial Field Quiescent</p>
              </div>
            ) : (
              <div className="w-full h-full relative p-20">
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute top-[20%] left-[30%]">
                  <NeuralCard className="p-4 w-56 shadow-glow animate-float-slow bg-bio-cyan/5 border-bio-cyan/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-bio-cyan" />
                      <span className="text-[10px] font-black text-bio-cyan uppercase tracking-widest">Source Node</span>
                    </div>
                    <p className="text-xs font-bold text-white/90 uppercase tracking-tight truncate">{origin}</p>
                    <p className="text-[8px] font-mono text-white/30 mt-2 uppercase">COORD: 40.7128° N, 74.0060° W</p>
                  </NeuralCard>
                </motion.div>
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="absolute bottom-[30%] right-[25%]">
                  <NeuralCard className="p-4 w-56 shadow-glow-violet animate-float-slow bg-memory-violet/5 border-memory-violet/20" style={{ animationDelay: '2s' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-memory-violet" />
                      <span className="text-[10px] font-black text-memory-violet uppercase tracking-widest">Target Node</span>
                    </div>
                    <p className="text-xs font-bold text-white/90 uppercase tracking-tight truncate">{dest}</p>
                    <p className="text-[8px] font-mono text-white/30 mt-2 uppercase">DISTANCE: 2.4K SHARDS</p>
                  </NeuralCard>
                </motion.div>
                {/* Animated Path SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <motion.path
                    d="M 350 250 Q 500 500 650 450"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}