import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { chatService } from "@/lib/chat";
import { ConnectedService } from "../../worker/types";
import { Settings, Shield, Mail, Database, Zap, ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
export function SettingsPage() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchStatus = async () => {
    setLoading(true);
    const status = await chatService.getServiceStatus();
    setServices(status);
    setLoading(false);
  };
  useEffect(() => {
    fetchStatus();
    const handleAuth = (e: MessageEvent) => {
      if (e.data.type === 'AUTH_SUCCESS') fetchStatus();
    };
    window.addEventListener('message', handleAuth);
    return () => window.removeEventListener('message', handleAuth);
  }, []);
  const handleConnect = async (service: string) => {
    const url = await chatService.getAuthUrl(service);
    if (url) {
      window.open(url, 'CANS_AUTH', 'width=600,height=700');
    }
  };
  const isConnected = (name: string) => services.some(s => s.name === name && s.status === 'active');
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <Settings className="text-bio-cyan w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          </div>
          <p className="text-muted-foreground">Manage your neural pathways and external system bridges.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity Sync */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Shield className="text-bio-cyan w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">External Nodes</h2>
            </div>
            <NeuralCard className="p-6 space-y-6 border-bio-cyan/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isConnected('gmail') ? 'bg-bio-cyan/20 text-bio-cyan' : 'bg-white/5 text-white/20'}`}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">Google Workspace</h3>
                    <p className="text-xs text-muted-foreground">Gmail, Drive, Calendar</p>
                  </div>
                </div>
                {isConnected('gmail') ? (
                  <div className="flex items-center gap-2 text-bio-cyan text-xs font-bold uppercase">
                    <Zap size={12} className="animate-pulse" />
                    Linked
                  </div>
                ) : (
                  <Button onClick={() => handleConnect('gmail')} variant="outline" className="border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/10">
                    Connect
                    <ExternalLink size={14} className="ml-2" />
                  </Button>
                )}
              </div>
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gmail Sync</span>
                  <Switch checked={isConnected('gmail')} disabled={!isConnected('gmail')} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Indexing</span>
                  <Switch checked={isConnected('gmail')} disabled={!isConnected('gmail')} />
                </div>
              </div>
            </NeuralCard>
          </section>
          {/* System Health */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Database className="text-memory-violet w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">Neural Load</h2>
            </div>
            <NeuralCard className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/40">MEMORY CAPACITY</span>
                  <span className="text-bio-cyan">1.2GB / 10GB</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-bio-cyan w-[12%] shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/40">SYNAPTIC THROUGHPUT</span>
                  <span className="text-memory-violet">Active</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-transparent via-memory-violet to-transparent w-1/2" 
                  />
                </div>
              </div>
              <Button onClick={fetchStatus} variant="ghost" className="w-full text-white/40 hover:text-white">
                <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh System State
              </Button>
            </NeuralCard>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}