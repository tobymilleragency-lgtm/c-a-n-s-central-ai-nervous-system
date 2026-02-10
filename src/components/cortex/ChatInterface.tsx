import React, { useState, useEffect, useRef } from "react";
import { chatService, renderToolCall } from "@/lib/chat";
import { Message, GmailMessage } from "../../../worker/types";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, User, Mail, ChevronRight, Zap, Calendar, Clock, ChevronDown, ChevronUp, Reply, Trash2, BrainCircuit, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const getContextName = () => {
    const paths: Record<string, string> = { '/': 'CORE CORTEX', '/comms': 'COMMS BRIDGE', '/knowledge': 'KNOWLEDGE VAULT', '/temporal': 'TEMPORAL SYNC' };
    return paths[location.pathname] || 'SYSTEM';
  };
  useEffect(() => { loadMessages(); }, [location]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  const loadMessages = async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) setMessages(res.data.messages);
  };
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    setIsLoading(true);
    const res = await chatService.sendMessage(text);
    if (res.success) await loadMessages();
    setIsLoading(false);
  };
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const renderEmailStack = (emails: GmailMessage[]) => (
    <div className="mt-4 space-y-3">
      {emails.map((email) => (
        <NeuralCard key={email.id} className="p-3 bg-white/5 border-white/10 hover:border-bio-cyan/30 transition-all">
          <div className="flex items-start gap-3">
            <Mail size={12} className="text-bio-cyan mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                 <span className="text-[9px] font-bold text-bio-cyan uppercase truncate">{email.sender}</span>
                 <span className="text-[8px] text-white/20">{email.date}</span>
              </div>
              <h4 className="text-[10px] font-bold text-white/90 truncate">{email.subject}</h4>
            </div>
          </div>
        </NeuralCard>
      ))}
    </div>
  );
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 border-b border-white/5 bg-neural-bg/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-bio-cyan animate-pulse" />
           <span className="text-[9px] font-black tracking-widest text-bio-cyan/80 uppercase">{getContextName()}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="h-7 text-[9px] text-white/20 hover:text-bio-cyan">
          RE-SYNC
        </Button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-10 pb-32 pt-12 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40 py-20">
            <BrainCircuit className="text-bio-cyan w-16 h-16 animate-neural-pulse" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] font-bold text-bio-cyan">Cortex Online</p>
              <p className="text-[10px] text-white/40 mt-2 font-mono uppercase">System initialized. Awaiting synaptic data.</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border shrink-0", msg.role === 'user' ? "border-alert-pink/30 bg-alert-pink/10" : "border-bio-cyan/30 bg-bio-cyan/10")}>
              {msg.role === 'user' ? <User size={14} className="text-alert-pink" /> : <Sparkles size={14} className="text-bio-cyan" />}
            </div>
            <div className={cn("max-w-[85%]", msg.role === 'user' ? "text-right" : "text-left")}>
              <NeuralCard className={cn("p-4", msg.role === 'user' ? "bg-alert-pink/5" : "bg-bio-cyan/5")} glow={msg.role === 'assistant'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.toolCalls?.map(tc => {
                  const toolUI = renderToolCall(tc);
                  const isWrite = toolUI.type === 'write-success';
                  return (
                    <div key={tc.id} className={cn("mt-4 pt-4 border-t border-white/5", isWrite && "animate-synaptic-fire rounded-lg px-2")}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-bio-cyan uppercase">
                        {isWrite ? <CheckCircle size={10} className="text-bio-cyan" /> : <Zap size={10} className="animate-pulse" />}
                        {toolUI.label}
                      </div>
                      {toolUI.type === 'emails' && toolUI.data && (
                        <div className="mt-2">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => setExpandedTool(expandedTool === tc.id ? null : tc.id)}
                             className="h-6 text-[9px] p-0 text-white/40 hover:text-white"
                           >
                             {expandedTool === tc.id ? 'Hide Data' : `Show ${toolUI.data.length} Nodes`}
                           </Button>
                           <AnimatePresence>
                             {expandedTool === tc.id && (
                               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                 {renderEmailStack(toolUI.data)}
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </NeuralCard>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-bio-cyan/5 border border-bio-cyan/20 flex items-center justify-center">
              <Loader2 size={14} className="text-bio-cyan animate-spin" />
            </div>
            <div className="flex gap-1.5">
              {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-bio-cyan/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-8 left-0 right-0 lg:left-[260px] lg:right-[320px] px-8 z-50">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-bio-cyan to-memory-violet rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500" />
          <NeuralCard className="relative p-1 pr-2 flex items-center gap-2 bg-neural-bg/90 border-white/5 focus-within:border-bio-cyan/30">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Transmit synaptic query..." 
              className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/10 h-14 text-sm tracking-wide" 
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 rounded-xl w-10 h-10 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,212,255,0.4)]">
              <Send size={18} />
            </Button>
          </NeuralCard>
        </div>
      </div>
    </div>
  );
}