import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Zap,
  MessageSquare,
  Database,
  BrainCircuit,
  Clock,
  Activity,
  Settings,
  Trash2,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chatService } from "@/lib/chat";
import { SessionInfo, ConnectedService } from "../../worker/types";
const pathways = [
  { icon: BrainCircuit, label: "Cortex", path: "/", color: "text-bio-cyan" },
  { icon: MessageSquare, label: "Comms", path: "/comms", color: "text-bio-cyan" },
  { icon: Database, label: "Knowledge", path: "/knowledge", color: "text-memory-violet" },
  { icon: Clock, label: "Temporal", path: "/temporal", color: "text-memory-violet" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [services, setServices] = useState<ConnectedService[]>([]);
  const currentSessionId = chatService.getSessionId();
  useEffect(() => {
    loadSessions();
    loadServices();
    const handleAuth = (e: MessageEvent) => {
      if (e.data?.type === 'AUTH_SUCCESS') loadServices();
    };
    window.addEventListener('message', handleAuth);
    return () => window.removeEventListener('message', handleAuth);
  }, [location]);
  const loadSessions = async () => {
    const list = await chatService.listSessions();
    setSessions(list);
  };
  const loadServices = async () => {
    const status = await chatService.getServiceStatus();
    setServices(status);
  };
  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await chatService.deleteSession(id);
    if (success) {
      if (id === currentSessionId) {
        chatService.switchSession(crypto.randomUUID());
        window.location.reload();
      } else {
        loadSessions();
      }
    }
  };
  const handleConnect = async () => {
    if (isConnected('gmail')) {
      await loadServices();
      return;
    }
    const url = await chatService.getAuthUrl('gmail');
    if (url) window.open(url, 'CANS_AUTH', 'width=600,height=700');
  };
  const isConnected = (name: string) => services.some(s => s.name === name && s.status === 'active');
  return (
    <Sidebar className="border-r-0 bg-transparent">
      <SidebarHeader className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-bio-cyan blur-md opacity-20 animate-neural-pulse" />
            <div className="h-10 w-10 rounded-full border border-bio-cyan/30 flex items-center justify-center bg-neural-bg relative z-10 group-hover:border-bio-cyan/60 transition-colors">
              <BrainCircuit className="text-bio-cyan w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter text-foreground uppercase">C.A.N.S.</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-bio-cyan/60 font-black">Neural OS v1.2</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em] px-4 mb-3">Synaptic Pathways</SidebarGroupLabel>
          <SidebarMenu>
            {pathways.map((item) => {
              const active = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={active} className={cn(
                    "group h-11 rounded-xl px-4 mb-1 transition-all duration-500", 
                    active ? "bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20 shadow-[0_0_20px_rgba(0,212,255,0.1)]" : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}>
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4", active ? "text-bio-cyan animate-pulse" : "group-hover:text-bio-cyan/70")} />
                      <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em] px-4 mb-3">Integrations</SidebarGroupLabel>
          <div className="px-2 mb-6">
            <Button 
              onClick={handleConnect} 
              variant="outline" 
              className={cn(
                "w-full justify-start gap-3 h-11 transition-all duration-700 relative overflow-hidden group",
                isConnected('gmail') 
                  ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/20" 
                  : "bg-bio-cyan/5 border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/10 hover:border-bio-cyan/40"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isConnected('gmail') ? <CheckCircle2 size={14} className="relative z-10" /> : <ExternalLink size={14} className="relative z-10" />}
              <span className="text-[10px] font-black uppercase tracking-widest relative z-10">
                {isConnected('gmail') ? 'Google Synced ✓' : 'Connect Google'}
              </span>
            </Button>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-white/40 hover:text-white h-10 px-4 group">
                <Link to="/settings">
                  <Settings size={14} className="mr-3 group-hover:rotate-45 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Configuration</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em] px-4 mb-3">Synaptic History</SidebarGroupLabel>
          <SidebarMenu>
            <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-1">
              {sessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton 
                    onClick={() => { chatService.switchSession(session.id); window.location.reload(); }} 
                    className={cn(
                      "text-white/30 hover:text-white hover:bg-white/5 rounded-xl h-12 px-4 transition-all group", 
                      currentSessionId === session.id && "bg-bio-cyan/5 text-bio-cyan border-l-2 border-bio-cyan shadow-[inset_4px_0_15px_-5px_rgba(0,212,255,0.4)]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[11px] font-bold truncate tracking-tight uppercase">{session.title}</span>
                        <span className="text-[8px] text-white/20 uppercase font-mono tracking-tighter">
                          STAMP: {new Date(session.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                      <Trash2 
                        size={12} 
                        className="opacity-0 group-hover:opacity-100 hover:text-alert-pink transition-opacity shrink-0 ml-2" 
                        onClick={(e) => handleDeleteSession(e, session.id)} 
                      />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}