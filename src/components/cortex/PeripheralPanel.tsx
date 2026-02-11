import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NeuralCard } from "@/components/ui/neural-card";
import { Mail, Calendar, Activity, Clock, UserCircle, ChevronDown } from "lucide-react";
import { chatService } from "@/lib/chat";
import { ConnectedService, GmailMessage } from "../../../worker/types";
import { AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
export function PeripheralPanel() {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({ value: 20 + Math.random() * 60 }))
  );
  const fetchData = useCallback(async (email?: string) => {
    try {
      const [status, emailData, taskData] = await Promise.all([
        chatService.getServiceStatus(),
        chatService.getEmails(email),
        chatService.getTasks(email)
      ]);
      setServices(Array.isArray(status) ? status : []);
      setEmails(Array.isArray(emailData) ? emailData.slice(0, 3) : []);
      setTasks(Array.isArray(taskData) ? taskData.slice(0, 3) : []);
      setTelemetry(prev => [...prev.slice(1), { value: 30 + Math.random() * 50 }]);
      if (!email && Array.isArray(status) && status.length > 0 && !activeAccount) {
        setActiveAccount(status[0].email || null);
      }
    } catch (error) {
      console.error("Peripheral failure:", error);
    }
  }, [activeAccount]);
  useEffect(() => {
    fetchData(activeAccount || undefined);
    const interval = setInterval(() => fetchData(activeAccount || undefined), 15000);
    return () => clearInterval(interval);
  }, [fetchData, activeAccount]);
  const activeNode = useMemo(() => services.find(s => s.email === activeAccount), [services, activeAccount]);
  const isGmailConnected = useMemo(() => services.some(s => s.name === 'google' && s.status === 'active'), [services]);
  const radialData = useMemo(() => [
    { name: 'Synapse', value: isGmailConnected ? 100 : 30, fill: '#00d4ff' },
    { name: 'System', value: 100, fill: '#10b981' },
  ], [isGmailConnected]);
  return (
    <div className="p-6 space-y-8 h-full flex flex-col no-scrollbar">
      {/* Node Selector */}
      <section>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-bio-cyan/5 border border-bio-cyan/20 text-bio-cyan group hover:bg-bio-cyan/10 transition-all">
              <div className="flex items-center gap-3">
                <UserCircle size={16} />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Identity Node</p>
                  <p className="text-[9px] font-mono text-white/40 truncate max-w-[140px] mt-1">
                    {activeAccount || 'Link Account...'}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className="opacity-40 group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="neural-glass border-white/10 w-64 p-2">
            {services.map((s) => (
              <DropdownMenuItem 
                key={s.email} 
                onClick={() => setActiveAccount(s.email || null)}
                className="flex items-center justify-between rounded-lg p-3 cursor-pointer hover:bg-bio-cyan/10"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{s.display_name || 'User'}</p>
                  <p className="text-[9px] font-mono text-white/40">{s.email}</p>
                </div>
                {activeAccount === s.email && <div className="h-1.5 w-1.5 rounded-full bg-bio-cyan shadow-[0_0_8px_#00d4ff]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
      {/* Neural Telemetry */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black flex items-center gap-2">
            <Activity size={12} className="text-bio-cyan" /> Telemetry
          </h3>
          <span className="text-[8px] font-mono text-bio-cyan animate-pulse">LIVE</span>
        </div>
        <div className="h-24 w-full opacity-60">
          <ResponsiveContainer width="100%" height={96}>
            <AreaChart data={telemetry}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#00d4ff" fillOpacity={1} fill="url(#colorVal)" strokeWidth={1} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="space-y-8">
        {/* Comms Stream */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500",
              isGmailConnected ? 'text-[#10b981] drop-shadow-[0_0_8px_#10b981]' : 'text-white/20'
            )}>
              <Mail size={12} />
              Synaptic Comms
            </div>
            {isGmailConnected && <div className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />}
          </div>
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {emails.length > 0 ? emails.map((email) => (
                <motion.div key={email.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <NeuralCard className="p-3 border-white/5 hover:border-bio-cyan/30 bg-white/[0.02]">
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
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500",
              tasks.length > 0 ? 'text-[#10b981] drop-shadow-[0_0_8px_#10b981]' : 'text-white/20'
            )}>
              <Calendar size={12} />
              Temporal Buffer
            </div>
          </div>
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {tasks.length > 0 ? tasks.map((task) => (
                <motion.div key={task.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <NeuralCard className="p-3 border-white/5 flex items-center gap-3 bg-white/[0.02]">
                    <div className={cn("h-1 w-1 rounded-full", task.status === 'completed' ? 'bg-white/10' : 'bg-[#10b981] animate-pulse')} />
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
             <motion.div animate={{ width: ["10%", "90%", "30%", "60%"] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="h-full bg-gradient-to-r from-bio-cyan/20 to-[#10b981] shadow-[0_0_12px_#10b981]" />
          </div>
        </NeuralCard>
      </div>
    </div>
  );
}