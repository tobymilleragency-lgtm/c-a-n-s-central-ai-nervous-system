import React, { useState, useEffect } from "react";
import { NeuralCard } from "@/components/ui/neural-card";
import { Mail, Calendar, Info, Clock, ArrowUpRight, ShieldAlert, BrainCircuit, Zap } from "lucide-react";
import { chatService } from "@/lib/chat";
import { ConnectedService, GmailMessage } from "../../../worker/types";
import { cn } from "@/lib/utils";
export function PeripheralPanel() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  useEffect(() => {
    const fetchData = async () => {
      const [status, emailData, taskData, memoryData] = await Promise.all([
        chatService.getServiceStatus(),
        chatService.getEmails(),
        chatService.getTasks(),
        chatService.getMemories()
      ]);
      setServices(status);
      setEmails(emailData.slice(0, 3));
      setTasks(taskData.slice(0, 3));
      setMemories(memoryData.slice(0, 1));
      setLastUpdate(Date.now());
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);
  const isConnected = (name: string) => services.some(s => s.name === name && s.status === 'active');
  const isRecent = () => (Date.now() - lastUpdate) < 60000;
  return (
    <div className="p-6 space-y-8 h-full flex flex-col no-scrollbar">
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
                <p className="text-[9px] text-white/50 leading-tight">Google Workspace connection is inactive.</p>
              </div>
            </div>
          </NeuralCard>
        )}
        <div className="space-y-6">
          {/* Section: Comms */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className={cn("flex items-center gap-2 text-[10px] font-semibold uppercase", isConnected('gmail') ? 'text-bio-cyan' : 'text-white/20')}>
                <Mail size={12} />
                Recent Comms
              </div>
              <span className="text-[9px] text-white/20 font-mono">{emails.length} Nodes</span>
            </div>
            <div className="space-y-2">
              {emails.length > 0 ? emails.map((email) => (
                <NeuralCard key={email.id} className="p-3 border-white/5 hover:border-bio-cyan/20 group cursor-default">
                  <h4 className="text-[10px] font-bold text-white/80 truncate group-hover:text-bio-cyan transition-colors">{email.subject}</h4>
                  <p className="text-[9px] text-white/40 mt-1 truncate">{email.sender}</p>
                </NeuralCard>
              )) : (
                <p className="text-[9px] text-white/20 italic px-2">No active transmissions...</p>
              )}
            </div>
          </section>
          {/* Section: Temporal */}
          <section>
             <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-[10px] text-memory-violet font-semibold uppercase">
                <Calendar size={12} />
                Live Timeline
              </div>
            </div>
            <div className="space-y-2">
              {tasks.length > 0 ? tasks.map((task) => (
                <NeuralCard key={task.id} className={cn("p-2 border-white/5 flex items-center gap-3", isRecent() && task.status === 'pending' && "animate-synaptic-fire")}>
                  <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", task.status === 'completed' ? 'bg-white/20' : 'bg-memory-violet animate-pulse')} />
                  <h4 className={cn("text-[10px] truncate flex-1", task.status === 'completed' ? 'text-white/20 line-through' : 'text-white/70')}>
                    {task.title}
                  </h4>
                  <Zap size={10} className={cn("shrink-0", task.status === 'completed' ? 'text-white/10' : 'text-memory-violet')} />
                </NeuralCard>
              )) : (
                <p className="text-[9px] text-white/20 italic px-2">Timeline clear...</p>
              )}
            </div>
          </section>
          {/* Section: Insights */}
          {memories.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-[10px] text-bio-cyan font-semibold uppercase mb-3 px-1">
                <BrainCircuit size={12} />
                Latest Insight
              </div>
              <NeuralCard className="p-4 bg-bio-cyan/5 border-bio-cyan/10">
                <p className="text-[10px] text-white/70 italic leading-relaxed">
                  "{memories[0].content}"
                </p>
                <div className="mt-2 flex justify-between items-center">
                   <span className="text-[8px] uppercase font-bold text-bio-cyan/60">{memories[0].category}</span>
                   <ArrowUpRight size={10} className="text-bio-cyan/40" />
                </div>
              </NeuralCard>
            </section>
          )}
        </div>
      </div>
      <div className="mt-auto pt-6 border-t border-white/5">
        <NeuralCard className="p-4 bg-neural-bg/50 border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase mb-2">
            <Clock size={12} />
            System Load
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-bio-cyan/40 w-[45%] animate-pulse" />
          </div>
        </NeuralCard>
      </div>
    </div>
  );
}