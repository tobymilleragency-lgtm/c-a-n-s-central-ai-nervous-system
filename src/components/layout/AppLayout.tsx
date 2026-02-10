import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
type AppLayoutProps = {
  children: React.ReactNode;
  peripheral?: React.ReactNode;
};
export function AppLayout({ children, peripheral }: AppLayoutProps): JSX.Element {
  const [isPeripheralOpen, setIsPeripheralOpen] = useState(true);
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-neural-bg text-foreground">
        {/* Left Sidebar (Neural Pathways) */}
        <AppSidebar />
        {/* Center Stage (The Cortex) */}
        <main className="relative flex flex-1 flex-col overflow-hidden border-x border-white/5">
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPeripheralOpen(!isPeripheralOpen)}
              className="text-bio-cyan/50 hover:text-bio-cyan hover:bg-bio-cyan/10"
            >
              {isPeripheralOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
        {/* Right Panel (Peripheral Awareness) */}
        <AnimatePresence>
          {isPeripheralOpen && peripheral && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="hidden lg:block border-l border-white/5 bg-[#0a0e1a]/40 backdrop-blur-md"
            >
              <div className="w-[320px] h-full overflow-y-auto">
                {peripheral}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </SidebarProvider>
  );
}