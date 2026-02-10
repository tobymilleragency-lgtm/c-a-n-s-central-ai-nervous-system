import React from "react";
import { 
  Zap, 
  MessageSquare, 
  Database, 
  BrainCircuit, 
  Clock, 
  Cpu, 
  ShieldAlert,
  Activity
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
const pathways = [
  { icon: BrainCircuit, label: "Cortex", active: true, color: "text-bio-cyan" },
  { icon: MessageSquare, label: "Comms", color: "text-bio-cyan" },
  { icon: Database, label: "Knowledge", color: "text-memory-violet" },
  { icon: Clock, label: "Temporal", color: "text-memory-violet" },
  { icon: Activity, label: "Reflexes", color: "text-alert-pink" },
];
const clusters = [
  { icon: Zap, label: "Nerve Clusters" },
  { icon: Cpu, label: "Logic Core" },
  { icon: ShieldAlert, label: "Immune System" },
];
export function AppSidebar(): JSX.Element {
  return (
    <Sidebar className="border-r-0 bg-transparent">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-bio-cyan blur-md opacity-20 animate-neural-pulse" />
            <div className="h-10 w-10 rounded-full border border-bio-cyan/30 flex items-center justify-center bg-neural-bg relative z-10">
              <BrainCircuit className="text-bio-cyan w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-foreground">C.A.N.S.</h1>
            <p className="text-[10px] uppercase tracking-widest text-bio-cyan/60 font-medium">Neural OS v1.0</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/30 text-xs uppercase px-4 mb-2">Primary Pathways</SidebarGroupLabel>
          <SidebarMenu>
            {pathways.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton 
                  asChild 
                  isActive={item.active}
                  className={cn(
                    "group relative h-12 rounded-xl transition-all duration-300 px-4",
                    item.active ? "bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20" : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <a href="#" className="flex items-center gap-4">
                    <item.icon className={cn("w-5 h-5", item.active ? "text-bio-cyan" : "group-hover:text-bio-cyan/70")} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.active && (
                      <div className="absolute left-0 w-1 h-6 bg-bio-cyan rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-white/30 text-xs uppercase px-4 mb-2">Systems</SidebarGroupLabel>
          <SidebarMenu>
            {clusters.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-10 px-4">
                  <a href="#" className="flex items-center gap-4">
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-6 mt-auto">
        <div className="neural-glass p-3 rounded-xl border-white/5 bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase">Load</span>
            <span className="text-[10px] text-bio-cyan">14%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-bio-cyan w-[14%] shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}