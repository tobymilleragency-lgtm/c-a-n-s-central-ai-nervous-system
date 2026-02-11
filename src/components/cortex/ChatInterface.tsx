import React, { useState, useEffect, useRef, useCallback } from "react";
import { chatService, renderToolCall } from "@/lib/chat";
import { Message } from "../../../worker/types";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, User, Zap, BrainCircuit, CheckCircle, FileText, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation, useSearchParams } from "react-router-dom";
export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const getContextName = useCallback(() => {
    const paths: Record<string, string> = { '/': 'CORE CORTEX', '/comms': 'COMMS BRIDGE', '/knowledge': 'KNOWLEDGE VAULT', '/temporal': 'TEMPORAL SYNC' };
    return paths[location.pathname] || 'SYSTEM';
  }, [location.pathname]);
  const loadMessages = useCallback(async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) setMessages(res.data.messages);
  }, []);
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;
    if (!overrideText) setInput("");
    setIsLoading(true);
    const res = await chatService.sendMessage(text);
    if (res.success) await loadMessages();
    setIsLoading(false);
  }, [input, isLoading, loadMessages]);
  useEffect(() => {
    loadMessages();
  }, [loadMessages, location.pathname]);
  useEffect(() => {
    const context = searchParams.get('context');
    if (context) {
      handleSend(context);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, handleSend, setSearchParams]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8 relative">
      {/* Context Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-3 border-b border-white/5 bg-neural-bg/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-bio-cyan shadow-[0_0_10px_#00d4ff] animate-pulse" />
           <span className="text-[10px] font-black tracking-[0.3em] text-bio-cyan uppercase">{getContextName()}</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-white/20">
          <span>LATENCY: 0.12ms</span>
          <div className="h-3 w-[1px] bg-white/10" />
          <span>STATUS: SYNCED</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-12 pb-32 pt-16 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40 py-24">
            <div className="relative">
              <BrainCircuit className="text-bio-cyan w-20 h-20 animate-pulse" />
              <div className="absolute inset-0 bg-bio-cyan/20 blur-3xl rounded-full" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.5em] font-black text-bio-cyan">Synaptic Core Online</p>
              <p className="text-[11px] text-white/40 mt-3 font-mono uppercase tracking-widest max-w-xs leading-relaxed">System initialized. Neural pathways calibrated. Awaiting synaptic input from host.</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cn("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-500", msg.role === 'user' ? "border-alert-pink/20 bg-alert-pink/5" : "border-bio-cyan/20 bg-bio-cyan/5 shadow-glow")}>
              {msg.role === 'user' ? <User size={18} className="text-alert-pink" /> : <Sparkles size={18} className="text-bio-cyan" />}
            </div>
            <div className={cn("max-w-[85%]", msg.role === 'user' ? "text-right" : "text-left")}>
              <NeuralCard className={cn("p-5 border-white/5", msg.role === 'user' ? "bg-alert-pink/[0.03]" : "bg-bio-cyan/[0.03]")} glow={msg.role === 'assistant'}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-white/90">{msg.content}</p>
                {msg.toolCalls?.map(tc => {
                  const toolUI = renderToolCall(tc);
                  const isWrite = toolUI.type === 'write-success';
                  return (
                    <div key={tc.id} className={cn("mt-6 pt-6 border-t border-white/10", isWrite && "bg-bio-cyan/5 -mx-5 -mb-5 px-5 pb-5 rounded-b-2xl animate-synaptic-fire")}>
                      <div className="flex items-center gap-2 text-[11px] font-black text-bio-cyan uppercase tracking-widest">
                        {isWrite ? <CheckCircle size={14} className="text-bio-cyan" /> : <Zap size={14} className="animate-pulse" />}
                        {toolUI.label}
                      </div>
                      {toolUI.type === 'files' && toolUI.data && (
                        <div className="mt-4 grid grid-cols-1 gap-2">
                          {toolUI.data.slice(0, 3).map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-bio-cyan/30 transition-all cursor-pointer group">
                              <div className="flex items-center gap-3">
                                <FileText size={14} className="text-bio-cyan" />
                                <span className="text-[11px] font-bold text-white/80 truncate max-w-[200px]">{file.name}</span>
                              </div>
                              <ArrowUpRight size={14} className="text-white/20 group-hover:text-bio-cyan transition-colors" />
                            </div>
                          ))}
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
            <div className="w-10 h-10 rounded-2xl bg-bio-cyan/5 border border-bio-cyan/20 flex items-center justify-center">
              <Loader2 size={18} className="text-bio-cyan animate-spin" />
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-2 h-2 bg-bio-cyan rounded-full shadow-[0_0_10px_#00d4ff]"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-12 left-0 right-0 lg:left-[260px] lg:right-[320px] px-8 z-50">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-bio-cyan to-memory-violet rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-700" />
          <NeuralCard className="relative p-1.5 pr-3 flex items-center gap-2 bg-[#0a0e1a]/90 backdrop-blur-2xl border-white/10 focus-within:border-bio-cyan/40">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="TRANSMIT SYNAPTIC QUERY..."
              className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/10 h-14 text-sm font-black tracking-widest uppercase no-scrollbar"
            />
            <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} size="icon" className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 rounded-xl w-12 h-12 transition-all active:scale-90 shadow-glow">
              <Send size={20} />
            </Button>
          </NeuralCard>
        </div>
      </div>
    </div>
  );
}