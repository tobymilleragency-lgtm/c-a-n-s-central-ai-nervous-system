import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { chatService } from "@/lib/chat";
import { ConnectedService, SystemStats } from "../../worker/types";
import { Settings, Shield, Mail, Database, Zap, RefreshCw, CheckCircle2, UserPlus, Trash2, Globe, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export function SettingsPage() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [status, sysStats] = await Promise.all([
        chatService.getServiceStatus(),
        chatService.getSystemStats()
      ]);
      setServices(Array.isArray(status) ? status : []);
      setStats(sysStats);
    } catch (error) {
      console.error("System calibration failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchStatus();
    const handleAuth = (e: MessageEvent) => {
      if (e.data?.type === 'AUTH_SUCCESS') {
        toast.success(`Synaptic Link established: ${e.data.display_name || e.data.email}`);
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
      toast.error("Failed to generate auth bridge");
    }
  };
  const handleAddMock = async () => {
    const email = window.prompt("Enter mock identity email:");
    if (!email || !email.includes('@')) return;
    try {
      const success = await chatService.addMockAccount(email);
      if (success) {
        toast.success(`Mock Identity Injected: ${email}`);
        fetchStatus();
      } else {
        toast.error("Mock injection failed");
      }
    } catch (e) {
      toast.error("Injection fault");
    }
  };
  const handleDisconnect = async (email: string) => {
    try {
      const success = await chatService.disconnectNode('google', email);
      if (success) {
        toast.success(`Synaptic Node pruned: ${email}`);
        fetchStatus();
      } else {
        toast.error("Pruning sequence failed");
      }
    } catch (e) {
      toast.error("Critical fault during disconnection");
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-10 w-10 rounded-xl bg-bio-cyan/10 border border-bio-cyan/20 flex items-center justify-center">
                <Settings className="text-bio-cyan w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">System Configuration</h1>
            </div>
            <p className="text-muted-foreground font-medium">Manage your multi-synaptic links and operational load.</p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Account Management */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Shield className="text-bio-cyan w-4 h-4" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Linked Identity Nodes</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddMock}
                    variant="ghost"
                    size="sm"
                    className="text-[10px] uppercase font-black text-memory-violet hover:bg-memory-violet/10"
                  >
                    <FlaskConical size={14} className="mr-2" /> Mock Node
                  </Button>
                  <Button
                    onClick={handleConnect}
                    variant="ghost"
                    size="sm"
                    className="text-[10px] uppercase font-black text-bio-cyan hover:bg-bio-cyan/10"
                  >
                    <UserPlus size={14} className="mr-2" /> Add Google Link
                  </Button>
                </div>
              </div>
              <NeuralCard className="p-6 space-y-4 border-bio-cyan/10 bg-bio-cyan/[0.02]">
                <AnimatePresence mode="popLayout">
                  {services.length > 0 ? (
                    services.map((account, idx) => (
                      <motion.div
                        key={account.email || idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-bio-cyan/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-bio-cyan/10 flex items-center justify-center text-bio-cyan relative">
                            <Mail size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{account.display_name || 'Synaptic Node'}</p>
                            <p className="text-[10px] font-mono text-white/40 uppercase">{account.email}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                               <CheckCircle2 size={10} className="text-[#10b981]" />
                               <span className="text-[9px] font-black uppercase text-[#10b981] tracking-widest">Connected</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => account.email && handleDisconnect(account.email)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/20 hover:text-alert-pink hover:bg-alert-pink/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 opacity-20 flex flex-col items-center gap-4 border-2 border-dashed border-white/5 rounded-2xl">
                      <Globe size={40} />
                      <p className="text-[10px] uppercase font-black tracking-widest">No Synaptic Links found</p>
                      <Button onClick={handleConnect} variant="outline" className="border-white/10 hover:bg-white/5 text-[9px] uppercase tracking-widest">
                        Initiate First Connection
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white/70">Auto-Index Documents</p>
                      <p className="text-[10px] text-white/30">Sync shards across all linked Drive accounts.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-bio-cyan" />
                  </div>
                </div>
              </NeuralCard>
            </section>
            {/* System Performance */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <Zap className="text-memory-violet w-4 h-4" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Load Telemetry</h2>
              </div>
              <NeuralCard className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-5 rounded-xl border border-white/5 group hover:border-bio-cyan/20 transition-all">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Memory Shards</span>
                    <p className="text-2xl font-black text-bio-cyan mt-1">{stats?.memories || 0}</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-xl border border-white/5 group hover:border-memory-violet/20 transition-all">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Temporal Links</span>
                    <p className="text-2xl font-black text-memory-violet mt-1">{stats?.tasks || 0}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                    <span className="text-white/30">Synaptic Efficiency</span>
                    <span className="text-bio-cyan">Optimized</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-bio-cyan shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={fetchStatus}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-12 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                  >
                    <RefreshCw size={14} className={cn("mr-2", loading && "animate-spin")} />
                    Refresh Core Telemetry
                  </Button>
                </div>
              </NeuralCard>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}