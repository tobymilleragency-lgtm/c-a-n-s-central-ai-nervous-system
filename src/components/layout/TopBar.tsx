import React, { useState, useEffect, useCallback } from "react";
import { BrainCircuit, Cpu, Mail, Calendar, Zap } from "lucide-react";
import { chatService } from "@/lib/chat";
import { ConnectedService } from "../../../worker/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export function TopBar() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const fetchStatus = useCallback(async () => {
    try {
      setIsSyncing(true);
      const status = await chatService.getServiceStatus();
      setServices(Array.isArray(status) ? status : []);
    } catch (error) {
      console.error("TopBar sync failed:", error);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, []);
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    const handleAuth = (e: MessageEvent) => {
      if (e.data?.type === 'AUTH_SUCCESS') {
        fetchStatus();
      }
    };
    window.addEventListener('message', handleAuth);
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleAuth);
    };
  }, [fetchStatus]);
  const activeCount = services.filter(s => s.status === 'active').length;
  return (
    <TooltipProvider>
      <header className="h-16 shrink-0 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl flex items-center justify-between px-6 z-40 relative">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold hidden sm:inline">Neural Load</span>
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
          <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
          <span className="text-[10px] uppercase tracking-widest text-bio-cyan/60 font-mono hidden md:block">Neural OS v1.2</span>
        </div>
        <div className="flex items-center gap-4">
          <Orb icon={Mail} count={services.length} active={activeCount > 0} label="Synaptic Comms" color="cyan" connecting={isSyncing} emails={services.map(s => s.email).filter(Boolean) as string[]} />
          <Orb icon={Calendar} active={activeCount > 0} label="Temporal Nodes" color="violet" connecting={isSyncing} />
          <Orb icon={Cpu} active={true} label="Core Processor" color="green" connecting={isSyncing} />
        </div>
      </header>
    </TooltipProvider>
  );
}
function Orb({
  icon: Icon,
  count,
  active,
  label,
  color,
  connecting,
  emails = []
}: {
  icon: any;
  count?: number;
  active: boolean;
  label: string;
  color: 'cyan' | 'violet' | 'green';
  connecting?: boolean;
  emails?: string[];
}) {
  const colorClasses = {
    cyan: active
      ? "border-bio-cyan/40 bg-bio-cyan/10 text-bio-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]"
      : "border-white/10 bg-white/5 text-white/20",
    violet: active
      ? "border-memory-violet/40 bg-memory-violet/10 text-memory-violet shadow-[0_0_15px_rgba(139,92,246,0.2)]"
      : "border-white/10 bg-white/5 text-white/20",
    green: active
      ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]"
      : "border-white/10 bg-white/5 text-white/20"
  };
  const hasCount = count !== undefined && count > 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative cursor-help group">
          <div className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 rounded-full border flex items-center justify-center transition-all duration-700",
            connecting ? "scale-90 opacity-50 animate-pulse" : "scale-100 opacity-100",
            colorClasses[color],
            active && "border-[#10b981]/60"
          )}>
            <Icon size={14} className={cn(active && "animate-pulse")} />
          </div>
          {hasCount && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-bio-cyan text-neural-bg text-[8px] font-black flex items-center justify-center border border-[#0a0e1a] shadow-sm">
              {count}
            </div>
          )}
          {active && (
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full animate-ping opacity-70 bg-[#10b981]" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="neural-glass border-white/10 text-[10px] uppercase font-bold tracking-widest p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-[#10b981] animate-pulse" : "bg-white/20")} />
          <span>{label}</span>
        </div>
        <p className={active ? "text-[#10b981]" : "text-white/40"}>
          {active ? `LINK ACTIVE ${hasCount ? `(${count} NODES)` : ''}` : 'NODE DISCONNECTED'}
        </p>
        {emails.length > 0 && (
          <div className="mt-2 space-y-1 pt-2 border-t border-white/5">
            {emails.map(e => (
              <p key={e} className="text-[8px] text-white/40 truncate font-mono">{e}</p>
            ))}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}