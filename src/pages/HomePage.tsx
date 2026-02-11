import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatInterface } from '@/components/cortex/ChatInterface';
import { PeripheralPanel } from '@/components/cortex/PeripheralPanel';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <AppLayout peripheral={<PeripheralPanel />}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <ChatInterface />
        </div>
      </AppLayout>
      {/* Global Neural UI Overlay for AI usage note */}
      <div className="fixed bottom-2 right-4 z-[100] pointer-events-none opacity-40">
        <p className="text-[8px] uppercase tracking-widest text-white/40 font-mono">
          System: Requests limited per cluster cycle.
        </p>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}