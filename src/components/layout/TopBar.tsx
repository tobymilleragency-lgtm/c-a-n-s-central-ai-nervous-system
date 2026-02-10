import React, { useState, useEffect } from "react";
import { BrainCircuit, Cpu, Mail, Calendar, Info } from "lucide-react";
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
    return () => clearInterval(interval);
  }, []);
  const getStatus = (name: string) => services.find(s => s.name === name);
  return (
    <TooltipProvider>
      <header className="h-16 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-md flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">System Status</span>
          <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-bio-cyan w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <h2 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-bio-cyan via-white to-memory-violet">
            C.A.N.S.
          </h2>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-bio-cyan/60 font-mono">Neural Interface</span>
        </div>
        <div className="flex items-center gap-4">
          <Orb icon={Mail} service={getStatus('gmail')} label="Gmail Node" />
          <Orb icon={Calendar} service={getStatus('calendar')} label="Temporal Node" />
          <Orb icon={Cpu} service={{ status: 'active', name: 'system', scopes: [] }} label="Core Processor" />
        </div>
      </header>
    </TooltipProvider>
  );
}
function Orb({ icon: Icon, service, label }: { icon: any; service?: ConnectedService; label: string }) {
  const isActive = service?.status === 'active';
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative cursor-help group">
          <div className={cn(
            "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-500",
            isActive 
              ? "border-bio-cyan/40 bg-bio-cyan/5 text-bio-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]" 
              : "border-white/10 bg-white/5 text-white/20"
          )}>
            <Icon size={14} className={cn(isActive && "animate-pulse")} />
          </div>
          {isActive && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-bio-cyan rounded-full animate-ping" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="neural-glass border-bio-cyan/20 text-[10px] uppercase font-bold tracking-wider">
        <p>{label}: {isActive ? 'SYNCED' : 'DISCONNECTED'}</p>
        {service?.lastSync && <p className="text-white/40 mt-1">Last: {new Date(service.lastSync).toLocaleTimeString()}</p>}
      </TooltipContent>
    </Tooltip>
  );
}