import React, { useState, useEffect } from "react";
import { BrainCircuit, Cpu, Mail, Calendar, Info, Zap } from "lucide-react";
import { chatService } from "@/lib/chat";
import { ConnectedService } from "../../../worker/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export function TopBar() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await chatService.getServiceStatus();
      setServices(status);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    const handleAuth = () => fetchStatus();
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'AUTH_SUCCESS') handleAuth();
    });
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleAuth);
    };
  }, []);
  const getStatus = (name: string) => services.find(s => s.name === name);
  return (
    <TooltipProvider>
      <header className="h-16 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-md flex items-center justify-between px-6 z-40 relative">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Neural Load</span>
          <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-bio-cyan w-2/3 animate-pulse shadow-[0_0_10px_#00d4ff]" />
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="relative">
            <BrainCircuit className="text-bio-cyan w-5 h-5 animate-pulse" />
            <div className="absolute inset-0 bg-bio-cyan/20 blur-md rounded-full" />
          </div>
          <h2 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-bio-cyan via-white to-memory-violet">
            C.A.N.S.
          </h2>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-bio-cyan/60 font-mono">Neural OS v1.2</span>
        </div>
        <div className="flex items-center gap-4">
          <Orb icon={Mail} service={getStatus('gmail')} label="Gmail Node" color="cyan" />
          <Orb icon={Calendar} service={getStatus('calendar')} label="Temporal Node" color="violet" />
          <Orb icon={Cpu} service={{ status: 'active', name: 'system', scopes: [] }} label="Core Processor" color="green" />
        </div>
      </header>
    </TooltipProvider>
  );
}
function Orb({ icon: Icon, service, label, color }: { icon: any; service?: ConnectedService; label: string; color: 'cyan' | 'violet' | 'green' }) {
  const isActive = service?.status === 'active';
  const colorClasses = {
    cyan: isActive ? "border-bio-cyan/40 bg-bio-cyan/10 text-bio-cyan shadow-[0_0_20px_rgba(0,212,255,0.3)]" : "border-white/10 bg-white/5 text-white/20",
    violet: isActive ? "border-memory-violet/40 bg-memory-violet/10 text-memory-violet shadow-[0_0_20px_rgba(139,92,246,0.3)]" : "border-white/10 bg-white/5 text-white/20",
    green: isActive ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "border-white/10 bg-white/5 text-white/20"
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative cursor-help group">
          <div className={cn(
            "h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-700",
            colorClasses[color]
          )}>
            <Icon size={14} className={cn(isActive && "animate-pulse")} />
          </div>
          {isActive && (
            <div className={cn(
              "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full animate-ping",
              color === 'cyan' ? "bg-bio-cyan" : color === 'violet' ? "bg-memory-violet" : "bg-[#10b981]"
            )} />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="neural-glass border-white/10 text-[10px] uppercase font-bold tracking-widest p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-[#10b981] animate-pulse" : "bg-white/20")} />
          <span>{label}</span>
        </div>
        <p className={isActive ? "text-[#10b981]" : "text-white/40"}>
          {isActive ? 'SYNAPTIC LINK ACTIVE' : 'NODE DISCONNECTED'}
        </p>
        {service?.lastSync && <p className="text-white/20 mt-1 font-mono">STAMP: {new Date(service.lastSync).toLocaleTimeString()}</p>}
      </TooltipContent>
    </Tooltip>
  );
}