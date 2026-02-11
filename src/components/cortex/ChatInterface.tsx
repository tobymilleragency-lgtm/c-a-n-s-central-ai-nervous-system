import React, { useState, useEffect, useRef, useCallback } from "react";
import { chatService, renderToolCall } from "@/lib/chat";
import { Message } from "../../../worker/types";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, User, Zap, BrainCircuit, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation, useSearchParams } from "react-router-dom";
export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const getContextName = useCallback(() => {
    const paths: Record<string, string> = {
      '/': 'CORE CORTEX',
      '/comms': 'COMMS BRIDGE',
      '/knowledge': 'KNOWLEDGE VAULT',
      '/temporal': 'TEMPORAL SYNC',
      '/drive': 'NEURAL DRIVE',
      '/spatial': 'SPATIAL AWARENESS'
    };
    return paths[location.pathname] || 'SYSTEM';
  }, [location.pathname]);
  const loadMessages = useCallback(async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) setMessages(res.data.messages);
  }, []);
  const scrollToBottom = useCallback((force = false) => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 400;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < threshold;
      if (force || isAtBottom) {
        scrollRef.current.scrollTo({
          top: scrollHeight,
          behavior: force ? 'auto' : 'smooth'
        });
      }
    }
  }, []);
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    // Passing onChunk callback for real-time streaming updates
    const res = await chatService.sendMessage(text, undefined, (chunk) => {
      setStreamingMessage(prev => prev + chunk);
      scrollToBottom();
    });
    if (res.success) {
      setStreamingMessage("");
      await loadMessages();
    }
    setIsLoading(false);
  }, [isLoading, loadMessages, scrollToBottom]);
  useEffect(() => {
    loadMessages();
  }, [loadMessages, location.pathname]);
  useEffect(() => {
    const context = searchParams.get('context');
    if (context) {
      sendMessage(context);
      setSearchParams(new URLSearchParams(), { replace: true });
    }
  }, [searchParams, sendMessage, setSearchParams]);
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, isLoading, scrollToBottom]);
  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <div className="sticky top-0 left-0 right-0 flex justify-between items-center py-4 border-b border-white/5 bg-neural-bg/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-bio-cyan shadow-[0_0_10px_#00d4ff] animate-pulse" />
           <span className="text-[10px] font-black tracking-[0.3em] text-bio-cyan uppercase">{getContextName()}</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-white/20">
          <span className="hidden sm:inline">THROUGHPUT: {isLoading ? '4.8' : '1.2'} GB/s</span>
          <div className="hidden sm:block h-3 w-[1px] bg-white/10" />
          <span>STATUS: {isLoading ? 'PROCESSING' : 'SYNCED'}</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar py-8 md:py-10 lg:py-12 pb-40">
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.length === 0 && !streamingMessage && (
            <div className="flex flex-col items-center justify-center text-center space-y-8 opacity-40 py-24 min-h-[40vh]">
              <div className="relative">
                <BrainCircuit className="text-bio-cyan w-20 h-20 animate-pulse" />
                <div className="absolute inset-0 bg-bio-cyan/20 blur-3xl rounded-full" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.5em] font-black text-bio-cyan">Synaptic Core Online</p>
                <p className="text-[11px] text-white/40 mt-3 font-mono uppercase tracking-widest max-w-xs leading-relaxed mx-auto">
                  System initialized. Neural pathways calibrated. Awaiting synaptic input from host.
                </p>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={cn("flex items-start gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0", msg.role === 'user' ? "border-alert-pink/20 bg-alert-pink/5" : "border-bio-cyan/20 bg-bio-cyan/5 shadow-glow")}>
                {msg.role === 'user' ? <User size={18} className="text-alert-pink" /> : <Sparkles size={18} className="text-bio-cyan" />}
              </div>
              <div className={cn("max-w-[85%]", msg.role === 'user' ? "text-right" : "text-left")}>
                <NeuralCard className={cn("p-5 border-white/5", msg.role === 'user' ? "bg-alert-pink/[0.03]" : "bg-bio-cyan/[0.03]")} glow={msg.role === 'assistant'}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-white/90">{msg.content}</p>
                  {msg.toolCalls?.map(tc => {
                    const toolUI = renderToolCall(tc);
                    const isWrite = toolUI.type === 'write-success';
                    const isError = toolUI.type === 'error';
                    return (
                      <div key={tc.id} className={cn("mt-6 pt-6 border-t border-white/10", isWrite && "bg-bio-cyan/5 -mx-5 -mb-5 px-5 pb-5 rounded-b-2xl animate-synaptic-fire")}>
                        <div className={cn("flex items-center gap-2 text-[11px] font-black uppercase tracking-widest", isError ? "text-alert-pink" : "text-bio-cyan")}>
                          {isError ? <XCircle size={14} /> : isWrite ? <CheckCircle size={14} className="text-bio-cyan" /> : <Zap size={14} className="animate-pulse" />}
                          {toolUI.label}
                        </div>
                      </div>
                    );
                  })}
                </NeuralCard>
              </div>
            </motion.div>
          ))}
          {/* Streaming Message Implementation */}
          {streamingMessage && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-bio-cyan/20 bg-bio-cyan/5 shadow-glow shrink-0">
                <Sparkles size={18} className="text-bio-cyan animate-pulse" />
              </div>
              <div className="max-w-[85%] text-left">
                <NeuralCard className="p-5 border-white/5 bg-bio-cyan/[0.03]" glow>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-white/90">
                    {streamingMessage}
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-4 bg-bio-cyan ml-1 align-middle"
                    />
                  </p>
                </NeuralCard>
              </div>
            </div>
          )}
          {isLoading && !streamingMessage && (
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
      </div>
      <div className="absolute bottom-8 left-0 right-0 pointer-events-none z-40">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          <div className="relative group px-6 sm:px-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-bio-cyan to-memory-violet rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-700" />
            <NeuralCard className="relative p-1.5 pr-3 flex items-center gap-2 bg-[#0a0e1a]/90 backdrop-blur-2xl border-white/10 focus-within:border-bio-cyan/40">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Transmit synaptic query"
                disabled={isLoading}
                className="border-0 bg-transparent text-white placeholder:text-white/30 focus-visible:ring-0 text-sm tracking-[0.05em] font-black uppercase h-14"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 rounded-xl w-12 h-12 transition-all active:scale-95 shadow-glow shrink-0"
              >
                <Send size={20} />
              </Button>
            </NeuralCard>
          </div>
        </div>
      </div>
    </div>
  );
}