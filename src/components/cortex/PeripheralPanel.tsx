import React, { useState, useEffect } from "react";
import { NeuralCard } from "@/components/ui/neural-card";
import { Mail, Calendar, Info, Clock, ArrowUpRight, ShieldAlert, BrainCircuit, Zap, CheckCircle2 } from "lucide-react";
import { chatService } from "@/lib/chat";
import { ConnectedService, GmailMessage } from "../../../worker/types";
import { cn } from "@/lib/utils";
export function PeripheralPanel() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
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
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    const handleAuth = () => fetchData();
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'AUTH_SUCCESS') handleAuth();
    });
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleAuth);
    };
  }, []);
  const isConnected = (name: string) => services.some(s => s.name === name && s.status === 'active');
  const systemLinked = isConnected('gmail') || isConnected('calendar');
  return (
    <div className="p-6 space-y-8 h-full flex flex-col no-scrollbar">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black flex items-center gap-2">
            <Info size={12} className="text-bio-cyan" />
            Peripheral Awareness
          </h3>
          {systemLinked && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
              <div className="h-1 w-1 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[8px] font-black text-[#10b981] uppercase tracking-tighter">Link Active</span>
            </div>
          )}
        </div>
        {systemLinked ? (
          <NeuralCard className="p-4 border-[#10b981]/20 bg-[#10b981]/5 mb-8 animate-synaptic-fire">
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="text-[#10b981] shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Synapse Secured</p>
                <p className="text-[9px] text-white/60 leading-tight">External nodes successfully integrated into cortex stream.</p>
              </div>
            </div>
          </NeuralCard>
        ) : (
          <NeuralCard className="p-4 border-alert-pink/20 bg-alert-pink/5 mb-8 group cursor-pointer hover:bg-alert-pink/10 transition-colors">
            <div className="flex gap-3">
              <ShieldAlert size={16} className="text-alert-pink shrink-0 animate-pulse" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-alert-pink uppercase tracking-widest">Link Severed</p>
                <p className="text-[9px] text-white/50 leading-tight">Workspace connection inactive. Synaptic data limited.</p>
              </div>
            </div>
          </NeuralCard>
        )}
        <div className="space-y-8">
          {/* Section: Comms */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <div className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                isConnected('gmail') ? 'text-bio-cyan drop-shadow-[0_0_5px_rgba(0,212,255,0.5)]' : 'text-white/20'
              )}>
                <Mail size={12} />
                Comms Stream
              </div>
              <span className="text-[9px] text-white/20 font-mono">{emails.length} Nodes</span>
            </div>
            <div className="space-y-2.5">
              {emails.length > 0 ? emails.map((email) => (
                <NeuralCard key={email.id} className="p-3 border-white/5 hover:border-bio-cyan/20 group cursor-default transition-all duration-500">
                  <h4 className="text-[10px] font-bold text-white/80 truncate group-hover:text-bio-cyan transition-colors">{email.subject}</h4>
                  <p className="text-[9px] text-white/40 mt-1 truncate font-mono uppercase tracking-tighter">{email.sender.split('<')[0]}</p>
                </NeuralCard>
              )) : (
                <p className="text-[9px] text-white/20 italic px-2 font-mono">Waiting for transmission...</p>
              )}
            </div>
          </section>
          {/* Section: Temporal */}
          <section>
             <div className="flex items-center justify-between mb-4 px-1">
              <div className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                isConnected('calendar') || tasks.length > 0 ? 'text-memory-violet drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'text-white/20'
              )}>
                <Calendar size={12} />
                Temporal Sync
              </div>
            </div>
            <div className="space-y-2.5">
              {tasks.length > 0 ? tasks.map((task) => (
                <NeuralCard key={task.id} className={cn(
                  "p-3 border-white/5 flex items-center gap-3 transition-all",
                  task.status === 'pending' && "border-memory-violet/20"
                )}>
                  <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", task.status === 'completed' ? 'bg-white/10' : 'bg-memory-violet animate-pulse')} />
                  <h4 className={cn("text-[10px] truncate flex-1 font-medium", task.status === 'completed' ? 'text-white/20 line-through' : 'text-white/70')}>
                    {task.title}
                  </h4>
                  {task.status === 'pending' && <Zap size={10} className="shrink-0 text-memory-violet/60" />}
                </NeuralCard>
              )) : (
                <p className="text-[9px] text-white/20 italic px-2 font-mono">Timeline synchronized...</p>
              )}
            </div>
          </section>
          {/* Section: Brain Circuit Insight */}
          {memories.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-[10px] text-bio-cyan font-black uppercase tracking-widest mb-4 px-1">
                <BrainCircuit size={12} />
                Last Insight
              </div>
              <NeuralCard className="p-4 bg-bio-cyan/5 border-bio-cyan/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                   <ArrowUpRight size={24} className="text-bio-cyan" />
                </div>
                <p className="text-[10px] text-white/80 italic leading-relaxed relative z-10">
                  "{memories[0].content}"
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center relative z-10">
                   <span className="text-[8px] uppercase font-black text-bio-cyan/60 tracking-widest">{memories[0].category}</span>
                   <span className="text-[8px] font-mono text-white/20">SEQ-{memories[0].id.slice(0,4)}</span>
                </div>
              </NeuralCard>
            </section>
          )}
        </div>
      </div>
      <div className="mt-auto pt-6 border-t border-white/5">
        <NeuralCard className="p-4 bg-neural-bg/50 border-white/5">
          <div className="flex items-center justify-between text-[10px] text-white/30 font-black uppercase mb-3">
            <div className="flex items-center gap-2"><Clock size={12} /> Synaptic Flow</div>
            <span className="text-bio-cyan">74%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               animate={{ width: ["40%", "74%", "60%"] }}
               transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
               className="h-full bg-gradient-to-r from-bio-cyan/20 to-bio-cyan shadow-[0_0_10px_#00d4ff]" 
             />
          </div>
        </NeuralCard>
      </div>
    </div>
  );
}