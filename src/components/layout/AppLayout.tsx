import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { motion } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TopBar } from "./TopBar";
import { NeuralBackground } from "@/components/cortex/NeuralBackground";
import { PanelRightClose, PanelRightOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
type AppLayoutProps = {
  children: React.ReactNode;
  peripheral?: React.ReactNode;
  isProcessing?: boolean;
};
export function AppLayout({ children, peripheral, isProcessing = false }: AppLayoutProps): JSX.Element {
  const [isPeripheralOpen, setIsPeripheralOpen] = useState(true);
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden bg-neural-bg text-foreground relative">
          <NeuralBackground />
          {/* Synaptic Pulse Overlay */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50 bg-bio-cyan/5 shadow-[inset_0_0_100px_rgba(0,212,255,0.1)] transition-colors duration-1000"
            />
          )}
          {/* Left Sidebar (Neural Pathways) */}
          <AppSidebar />
          {/* Center Stage (The Cortex) */}
          <main className="relative flex flex-1 flex-col h-full overflow-hidden border-x border-white/5 z-10 bg-transparent">
            <TopBar />
            {/* Peripheral Toggle Trigger */}
            <div className="absolute top-20 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPeripheralOpen(!isPeripheralOpen)}
                className="text-bio-cyan/50 hover:text-bio-cyan hover:bg-bio-cyan/10 backdrop-blur-sm rounded-full"
              >
                {isPeripheralOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </Button>
            </div>
            {/* Child Content - Constrained within main view */}
            <div className="flex-1 overflow-hidden relative">
              {children}
            </div>
            {/* AI Usage Disclosure Footer */}
            <footer className="h-10 border-t border-white/5 bg-[#0a0e1a]/80 backdrop-blur-md flex items-center justify-center px-6 z-40">
              <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300">
                <AlertCircle size={10} className="text-bio-cyan" />
                <p className="text-[8px] uppercase tracking-[0.2em] font-mono text-white/60">
                  Neural Constraint: Requests limited per cluster cycle across all nodes.
                </p>
              </div>
            </footer>
          </main>
          {/* Right Panel (Peripheral Awareness) */}
          <aside className={cn("border-l border-white/5 bg-[#0a0e1a]/40 backdrop-blur-md z-20 overflow-hidden lg:block transition-all duration-300 ease-in-out shadow-[0_-10px_50px_rgba(0,212,255,0.1)]", isPeripheralOpen ? 'w-[320px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full')}>
            <div className="w-full h-full overflow-y-auto no-scrollbar">
              {peripheral}
            </div>
          </aside>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}