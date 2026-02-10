import React, { useState, useEffect } from "react";
import { NeuralCard } from "@/components/ui/neural-card";
import { Mail, Calendar, Info, Clock, ArrowUpRight, ShieldAlert } from "lucide-react";
import { getMockSignals } from "@/lib/neural-utils";
import { chatService } from "@/lib/chat";
import { ConnectedService } from "../../../worker/types";
export function PeripheralPanel() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const signals = getMockSignals();
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await chatService.getServiceStatus();
      setServices(status);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  const isConnected = (name: string) => services.some(s => s.name === name && s.status === 'active');
  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-white/30 font-bold mb-4 flex items-center gap-2">
          <Info size={12} className="text-bio-cyan" />
          Peripheral Awareness
        </h3>
        {!isConnected('gmail') && (
          <NeuralCard className="p-3 border-alert-pink/20 bg-alert-pink/5 mb-6">
            <div className="flex gap-3">
              <ShieldAlert size={14} className="text-alert-pink shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-alert-pink uppercase">Link Severed</p>
                <p className="text-[9px] text-white/50 leading-tight">Google Workspace connection is inactive. Temporal and Comms data may be stale.</p>
              </div>
            </div>
          </NeuralCard>
        )}
        <div className="space-y-4">
          {/* Signal: Comms */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase ${isConnected('gmail') ? 'text-bio-cyan' : 'text-white/20'}`}>
                <Mail size={12} />
                Comms {isConnected('gmail') && '(Active)'}
              </div>
              <span className="text-[10px] text-white/20 font-mono">3 New</span>
            </div>
            <div className="space-y-2">
              {signals.emails.map((email, i) => (
                <NeuralCard key={i} className="p-3 border-white/5 hover:border-bio-cyan/20 cursor-pointer group">
                  <h4 className="text-[11px] font-bold text-white/80 group-hover:text-bio-cyan transition-colors truncate">{email.subject}</h4>
                  <p className="text-[10px] text-white/40 mt-1 line-clamp-1">{email.preview}</p>
                </NeuralCard>
              ))}
            </div>
          </section>
          {/* Signal: Temporal */}
          <section>
             <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-[10px] text-memory-violet font-semibold uppercase">
                <Calendar size={12} />
                Temporal
              </div>
            </div>
            <div className="space-y-2">
              {signals.events.map((event, i) => (
                <NeuralCard key={i} className="p-3 border-white/5 bg-white/5 flex items-center gap-3">
                  <div className="text-center shrink-0 border-r border-white/10 pr-3 min-w-[45px]">
                    <p className="text-[10px] font-bold text-memory-violet">{event.time}</p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[11px] font-medium text-white/70 truncate">{event.title}</h4>
                  </div>
                  <ArrowUpRight size={12} className="text-white/20" />
                </NeuralCard>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="pt-6 border-t border-white/5">
        <NeuralCard className="p-4 bg-bio-cyan/5 border-bio-cyan/10">
          <div className="flex items-center gap-2 text-[10px] text-bio-cyan font-bold uppercase mb-2">
            <Clock size={12} />
            Next Core Task
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Finalize neural architecture integration by 16:00.
          </p>
        </NeuralCard>
      </div>
    </div>
  );
}