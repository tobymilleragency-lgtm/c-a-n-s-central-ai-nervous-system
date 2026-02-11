import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NeuralCard } from "@/components/ui/neural-card";
import { Mail, Calendar, Info, Clock, BrainCircuit, Zap, CheckCircle2, Activity, ShieldAlert } from "lucide-react";
import { chatService } from "@/lib/chat";
import { ConnectedService, GmailMessage } from "../../../worker/types";
import { AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts';
import { cn } from "@/lib/utils";
export function PeripheralPanel() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({ value: 20 + Math.random() * 60 }))
  );
  const fetchData = useCallback(async () => {
    try {
      const [status, emailData, taskData] = await Promise.all([
        chatService.getServiceStatus(),
        chatService.getEmails(),
        chatService.getTasks()
      ]);
      setServices(Array.isArray(status) ? status : []);
      setEmails(Array.isArray(emailData) ? emailData.slice(0, 3) : []);
      setTasks(Array.isArray(taskData) ? taskData.slice(0, 3) : []);
      setTelemetry(prev => [...prev.slice(1), { value: 20 + Math.random() * 60 }]);
    } catch (error) {
      console.error("Peripheral failure:", error);
    }
  }, []);
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);
  const isGmailConnected = useMemo(() => services.some(s => s.name === 'gmail' && s.status === 'active'), [services]);
  const isCalendarConnected = useMemo(() => services.some(s => s.name === 'calendar' && s.status === 'active'), [services]);
  
  const radialData = useMemo(() => [
    { name: 'Gmail', value: isGmailConnected ? 100 : 20, fill: '#00d4ff' },
    { name: 'Temporal', value: isCalendarConnected ? 100 : 20, fill: '#8b5cf6' },
    { name: 'System', value: 100, fill: '#10b981' },
  ], [isGmailConnected, isCalendarConnected]);
  return (
    <div className="p-6 space-y-8 h-full flex flex-col no-scrollbar">
      {/* Neural Telemetry */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black flex items-center gap-2">
            <Activity size={12} className="text-bio-cyan" />
            Neural Telemetry
          </h3>
          <span className="text-[8px] font-mono text-bio-cyan animate-pulse">LIVE</span>
        </div>
        <div className="h-24 w-full opacity-60">
          <ResponsiveContainer width="100%" height="100%" minHeight={96}>
            <AreaChart data={telemetry}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#00d4ff" fillOpacity={1} fill="url(#colorVal)" strokeWidth={1} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      {/* Pathway Health */}
      <section className="flex items-center gap-4">
        <div className="h-24 w-24">
          <ResponsiveContainer width="100%" height="100%" minHeight={96}>
            <RadialBarChart innerRadius="60%" outerRadius="100%" data={radialData} startAngle={180} endAngle={0}>
              <RadialBar background dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {radialData.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <span className="text-[8px] uppercase tracking-widest text-white/40">{d.name}</span>
              <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-1000" style={{ width: `${d.value}%`, backgroundColor: d.fill }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="space-y-8">
        {/* Comms Stream */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
              isGmailConnected ? 'text-bio-cyan drop-shadow-[0_0_5px_rgba(0,212,255,0.5)]' : 'text-white/20'
            )}>
              <Mail size={12} />
              Synaptic Comms
            </div>
          </div>
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {emails.length > 0 ? emails.map((email) => (
                <motion.div key={email.id} layout id={email.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <NeuralCard className="p-3 border-white/5 hover:border-bio-cyan/30 transition-all cursor-default bg-white/[0.02]">
                    <h4 className="text-[10px] font-bold text-white/80 truncate">{email.subject}</h4>
                    <p className="text-[9px] text-white/30 mt-1 truncate font-mono">{email.sender.split('<')[0]}</p>
                  </NeuralCard>
                </motion.div>
              )) : (
                <p className="text-[9px] text-white/20 italic px-2 font-mono">Quiescent...</p>
              )}
            </AnimatePresence>
          </div>
        </section>
        {/* Temporal Stream */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
              isCalendarConnected ? 'text-memory-violet drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'text-white/20'
            )}>
              <Calendar size={12} />
              Temporal Buffer
            </div>
          </div>
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {tasks.length > 0 ? tasks.map((task) => (
                <motion.div key={task.id} layout id={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <NeuralCard className="p-3 border-white/5 flex items-center gap-3 bg-white/[0.02]">
                    <div className={cn("h-1 w-1 rounded-full", task.status === 'completed' ? 'bg-white/10' : 'bg-memory-violet animate-pulse')} />
                    <h4 className={cn("text-[9px] truncate flex-1 font-medium", task.status === 'completed' ? 'text-white/20 line-through' : 'text-white/70')}>
                      {task.title}
                    </h4>
                  </NeuralCard>
                </motion.div>
              )) : (
                <p className="text-[9px] text-white/20 italic px-2 font-mono">Synchronized.</p>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
      {/* System Health Status */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <NeuralCard className="p-4 bg-neural-bg/50 border-white/10">
          <div className="flex items-center justify-between text-[10px] text-white/30 font-black uppercase mb-3">
            <div className="flex items-center gap-2"><Clock size={12} /> Synaptic Flow</div>
            <span className="text-bio-cyan font-mono">0.4ms</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div
               animate={{ width: ["10%", "90%", "30%", "60%"] }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
               className="h-full bg-gradient-to-r from-bio-cyan/20 to-bio-cyan shadow-[0_0_10px_#00d4ff]"
             />
          </div>
        </NeuralCard>
      </div>
    </div>
  );
}