import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Database, BrainCircuit, Clock, Settings, ExternalLink, CheckCircle2, FileText, Map, UserCheck } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chatService } from "@/lib/chat";
import { SessionInfo, ConnectedService } from "../../worker/types";
import { toast } from "sonner";
const pathways = [
  { icon: BrainCircuit, label: "Cortex", path: "/", color: "text-bio-cyan" },
  { icon: MessageSquare, label: "Comms", path: "/comms", color: "text-bio-cyan" },
  { icon: FileText, label: "Neural Drive", path: "/drive", color: "text-bio-cyan" },
  { icon: Database, label: "Knowledge", path: "/knowledge", color: "text-memory-violet" },
  { icon: Clock, label: "Temporal", path: "/temporal", color: "text-memory-violet" },
  { icon: Map, label: "Spatial", path: "/spatial", color: "text-bio-cyan" },
  { icon: Settings, label: "Config", path: "/settings", color: "text-bio-cyan" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [services, setServices] = useState<ConnectedService[]>([]);
  const loadSessions = useCallback(async () => setSessions(await chatService.listSessions()), []);
  const loadServices = useCallback(async () => setServices(await chatService.getServiceStatus()), []);
  useEffect(() => {
    loadSessions();
    loadServices();
    const handleAuth = (e: MessageEvent) => {
      if (e.data?.type === 'AUTH_SUCCESS') {
        loadServices();
        loadSessions();
      }
    };
    window.addEventListener('message', handleAuth);
    return () => window.removeEventListener('message', handleAuth);
  }, [loadSessions, loadServices]);
  const activeAccounts = services.filter(s => s.status === 'active');
  const isConnected = activeAccounts.length > 0;
  const primaryEmail = activeAccounts[0]?.email || '';
  const liveLabels = ['Comms', 'Neural Drive', 'Temporal', 'Spatial'];
  return (
    <Sidebar className="border-r-0 bg-transparent">
      <SidebarHeader className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full border border-bio-cyan/30 flex items-center justify-center bg-neural-bg relative z-10 group-hover:border-[#10b981]/60 transition-colors">
            <BrainCircuit className="text-bio-cyan w-6 h-6 group-hover:text-[#10b981] transition-colors" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter text-foreground">C.A.N.S.</h1>
            <p className="text-[9px] uppercase tracking-widest text-bio-cyan/60 font-black">Neural OS v1.2</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/20 text-[10px] uppercase font-black tracking-widest mb-3">Synaptic Pathways</SidebarGroupLabel>
          <SidebarMenu>
            {pathways.map((item) => {
              const active = location.pathname === item.path;
              const hasLiveNode = isConnected && liveLabels.includes(item.label) && item.label !== 'Config';
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={active} className={cn("group h-11 rounded-xl px-4 mb-1 transition-all", active ? "bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20 shadow-[0_0_15px_rgba(0,212,255,0.05)]" : "text-white/40 hover:bg-white/5")}>
                    <Link to={item.path} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-4 h-4 transition-colors", active ? "text-bio-cyan animate-pulse" : "group-hover:text-white/60")} />
                        <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                      </div>
                      {hasLiveNode && <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-white/20 text-[10px] uppercase font-black tracking-widest mb-3">Neural Linkage</SidebarGroupLabel>
          <div className="px-2 mb-2">
            <Button
              onClick={async () => {
                const url = await chatService.getAuthUrl('google');
                if(url) {
                  window.open(url, 'CANS_AUTH', 'width=600,height=700');
                }
              }}
              variant="outline"
              className={cn(
                "w-full justify-start gap-3 h-11 text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                isConnected
                  ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "bg-bio-cyan/5 border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/10"
              )}
            >
              {isConnected ? <UserCheck size={14} className="animate-pulse" /> : <ExternalLink size={14} />}
              <span className="truncate">
                {isConnected ? `${activeAccounts.length} Nodes Linked` : 'Connect Google'}
              </span>
            </Button>
            {isConnected && primaryEmail && (
              <p className="text-[8px] font-mono text-white/20 mt-2 px-1 truncate uppercase">
                Primary: {primaryEmail}
              </p>
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}