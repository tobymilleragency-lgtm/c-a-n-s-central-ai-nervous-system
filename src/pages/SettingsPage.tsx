import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { chatService } from "@/lib/chat";
import { ConnectedService } from "../../worker/types";
import { Settings, Shield, Mail, Database, Zap, ExternalLink, RefreshCw, CheckCircle2, UserPlus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
export function SettingsPage() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    const status = await chatService.getServiceStatus();
    setServices(status);
    setLoading(false);
  }, []);
  useEffect(() => {
    fetchStatus();
    const handleAuth = (e: MessageEvent) => {
      if (e.data?.type === 'AUTH_SUCCESS') {
        toast.success(`Synaptic Link established: ${e.data.email}`);
        fetchStatus();
      }
    };
    window.addEventListener('message', handleAuth);
    return () => window.removeEventListener('message', handleAuth);
  }, [fetchStatus]);
  const handleConnect = async () => {
    const url = await chatService.getAuthUrl('google');
    if (url) {
      window.open(url, 'CANS_AUTH', 'width=600,height=700');
    } else {
      toast.error("Failed to generate auth link");
    }
  };
  const googleAccounts = services.filter(s => s.name === 'google' || s.name === 'gmail');
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <Settings className="text-bio-cyan w-8 h-8" />
            <h1 className="text-3xl font-black tracking-tighter uppercase">System Configuration</h1>
          </div>
          <p className="text-muted-foreground font-medium">Manage your neural pathways and external account bridges.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Multi-Account Management */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Shield className="text-bio-cyan w-4 h-4" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white/50">Synaptic Identifiers</h2>
              </div>
              <Button 
                onClick={handleConnect} 
                variant="ghost" 
                size="sm" 
                className="text-[10px] uppercase font-black text-bio-cyan hover:bg-bio-cyan/10"
              >
                <UserPlus size={14} className="mr-2" /> Link Node
              </Button>
            </div>
            <NeuralCard className="p-6 space-y-6 border-bio-cyan/10">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {googleAccounts.length > 0 ? googleAccounts.map((account, idx) => (
                    <motion.div 
                      key={account.email || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-bio-cyan/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-bio-cyan/10 flex items-center justify-center text-bio-cyan">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white/90">{account.email}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                            <span className="text-[9px] uppercase font-black text-[#10b981] tracking-widest">Active Sync</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <CheckCircle2 size={16} className="text-bio-cyan opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-10 opacity-20 flex flex-col items-center gap-4">
                      <Database size={40} />
                      <p className="text-[10px] uppercase font-black tracking-[0.2em]">No Nodes Linked</p>
                      <Button onClick={handleConnect} variant="outline" className="border-white/20 text-white/40 mt-2">
                        Initialize First Link
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <div className="pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white/60">Auto-Index Shards</p>
                      <p className="text-[10px] text-white/20">Synthesize data from linked nodes automatically.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-bio-cyan" />
                 </div>
              </div>
            </NeuralCard>
          </section>
          {/* Neural Efficiency Metrics */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Zap className="text-memory-violet w-4 h-4" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white/50">Computational Load</h2>
            </div>
            <NeuralCard className="p-6 space-y-8">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span className="text-white/40">Memory Consumption</span>
                  <span className="text-bio-cyan">0.82 GB / 16.0 GB</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-bio-cyan w-[5%] shadow-[0_0_15px_rgba(0,212,255,0.4)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span className="text-white/40">Synaptic Latency</span>
                  <span className="text-memory-violet">0.02ms</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-transparent via-memory-violet to-transparent w-1/3"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={fetchStatus} 
                  variant="outline" 
                  className="w-full h-12 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                >
                  <RefreshCw size={14} className={cn("mr-2", loading && "animate-spin")} />
                  Calibrate System State
                </Button>
              </div>
            </NeuralCard>
            <NeuralCard className="p-6 border-white/5 bg-alert-pink/5">
               <div className="flex gap-4">
                 <Shield size={20} className="text-alert-pink shrink-0" />
                 <div className="space-y-1">
                   <p className="text-xs font-black text-alert-pink uppercase">Neural Encryption Active</p>
                   <p className="text-[10px] text-white/40 leading-relaxed">All synaptic bridges are end-to-end encrypted. Tokens are stored in isolated vault shards within the AppController.</p>
                 </div>
               </div>
            </NeuralCard>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}