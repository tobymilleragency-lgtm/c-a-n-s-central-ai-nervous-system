import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Zap,
  MessageSquare,
  Database,
  BrainCircuit,
  Clock,
  Cpu,
  ShieldAlert,
  Activity,
  Settings,
  Trash2
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
import { cn } from "@/lib/utils";
import { chatService } from "@/lib/chat";
import { SessionInfo } from "../../worker/types";
const pathways = [
  { icon: BrainCircuit, label: "Cortex", path: "/", color: "text-bio-cyan" },
  { icon: MessageSquare, label: "Comms", path: "/comms", color: "text-bio-cyan" },
  { icon: Database, label: "Knowledge", path: "/knowledge", color: "text-memory-violet" },
  { icon: Clock, label: "Temporal", path: "/temporal", color: "text-memory-violet" },
  { icon: Activity, label: "Reflexes", path: "/reflexes", color: "text-alert-pink" },
];
const clusters = [
  { icon: Settings, label: "System Config", path: "/settings" },
  { icon: Zap, label: "Nerve Clusters", path: "/clusters" },
  { icon: ShieldAlert, label: "Immune System", path: "/security" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const currentSessionId = chatService.getSessionId();
  useEffect(() => {
    loadSessions();
  }, [location]);
  const loadSessions = async () => {
    const list = await chatService.listSessions();
    setSessions(list);
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
            <h1 className="font-bold text-lg tracking-tight text-foreground">C.A.N.S.</h1>
            <p className="text-[10px] uppercase tracking-widest text-bio-cyan/60 font-medium">Neural OS v1.1</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/30 text-xs uppercase px-4 mb-2">Primary Pathways</SidebarGroupLabel>
          <SidebarMenu>
            {pathways.map((item) => {
              const active = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      "group relative h-12 rounded-xl transition-all duration-300 px-4 mb-1",
                      active ? "bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20" : "text-white/50 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-4">
                      <item.icon className={cn("w-5 h-5", active ? "text-bio-cyan" : "group-hover:text-bio-cyan/70")} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {active && (
                        <div className="absolute left-0 w-1 h-6 bg-bio-cyan rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-white/30 text-xs uppercase px-4 mb-2">Neural Memory</SidebarGroupLabel>
          <SidebarMenu>
            {sessions.map((session) => (
              <SidebarMenuItem key={session.id}>
                <SidebarMenuButton
                  onClick={() => {
                    chatService.switchSession(session.id);
                    window.location.reload();
                  }}
                  className={cn(
                    "text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-10 px-4 mb-1 group",
                    currentSessionId === session.id && "bg-bio-cyan/5 text-bio-cyan border-l-2 border-bio-cyan"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Clock size={12} className={currentSessionId === session.id ? "text-bio-cyan" : "text-white/20"} />
                      <span className="text-xs font-medium truncate">{session.title}</span>
                    </div>
                    <Trash2 
                      size={12} 
                      className="opacity-0 group-hover:opacity-100 hover:text-alert-pink transition-opacity" 
                      onClick={(e) => handleDeleteSession(e, session.id)}
                    />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-white/30 text-xs uppercase px-4 mb-2">Systems</SidebarGroupLabel>
          <SidebarMenu>
            {clusters.map((item) => {
              const active = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-10 px-4 mb-1",
                      active && "bg-white/10 text-white"
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-4">
                      <item.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-6 mt-auto">
        <div className="neural-glass p-3 rounded-xl border-white/5 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase">Load</span>
            <span className="text-[10px] text-bio-cyan">18%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-bio-cyan w-[18%] shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}