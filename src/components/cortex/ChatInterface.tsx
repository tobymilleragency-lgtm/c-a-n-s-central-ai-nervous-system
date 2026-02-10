import React, { useState, useEffect, useRef } from "react";
import { chatService, renderToolCall } from "@/lib/chat";
import { Message, GmailMessage } from "../../../worker/types";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, User, Mail, ChevronRight, Zap, Calendar, Clock, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadMessages();
  }, []);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  const loadMessages = async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      setMessages(res.data.messages);
    }
  };
  const handleSend = async (customText?: string) => {
    const text = customText || input;
    if (!text.trim() || isLoading) return;
    setInput("");
    setIsLoading(true);
    const res = await chatService.sendMessage(text);
    if (res.success) await loadMessages();
    setIsLoading(false);
  };
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const renderEmailStack = (emails: GmailMessage[]) => (
    <div className="mt-4 space-y-3">
      {emails.map((email) => {
        const isExpanded = expandedEmail === email.id;
        return (
          <NeuralCard key={email.id} className="p-3 bg-white/5 border-white/10 hover:border-bio-cyan/30 transition-all group">
            <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedEmail(isExpanded ? null : email.id)}>
              <div className="w-8 h-8 rounded-full bg-bio-cyan/10 flex items-center justify-center text-bio-cyan shrink-0">
                <Mail size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-bio-cyan uppercase">{email.sender}</span>
                  <span className="text-[10px] text-white/30 font-mono">{email.date}</span>
                </div>
                <h4 className="text-xs font-semibold text-white/90 truncate mb-1">{email.subject}</h4>
                <p className="text-[11px] text-white/50 line-clamp-1">{email.snippet}</p>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-white/70 leading-relaxed whitespace-pre-wrap">
                        {email.body || "No additional content available."}
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-[10px] border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/10" onClick={(e) => {
                            e.stopPropagation();
                            setInput(`Draft a reply to this email from ${email.sender} about ${email.subject}: `);
                          }}>
                            <Reply size={12} className="mr-2" />
                            Draft Reply
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isExpanded ? <ChevronUp size={14} className="text-bio-cyan mt-1" /> : <ChevronDown size={14} className="text-white/20 mt-1" />}
            </div>
          </NeuralCard>
        );
      })}
    </div>
  );
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8 relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pb-32 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
            <div className="relative">
              <div className="absolute inset-0 bg-bio-cyan blur-2xl opacity-20 animate-pulse" />
              <BrainCircuit className="text-bio-cyan w-16 h-16 relative z-10" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] font-bold text-bio-cyan">Cortex Online</p>
              <p className="text-[10px] text-white/40 mt-2 font-mono uppercase">Awaiting synaptic transmission...</p>
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
                  return (
                    <div key={tc.id} className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-bio-cyan uppercase mb-2">
                        <Zap size={10} className="animate-pulse" />
                        {toolUI.label}
                      </div>
                      {toolUI.type === 'emails' && toolUI.data && renderEmailStack(toolUI.data)}
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
          <NeuralCard className="relative p-1 pr-2 flex items-center gap-2 bg-neural-bg/90 border-white/5 focus-within:border-bio-cyan/30 focus-within:animate-synaptic-fire">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Transmit synaptic query..." className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/10 h-14 text-sm tracking-wide" />
            <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} size="icon" className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 rounded-xl w-10 h-10 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,212,255,0.4)]">
              <Send size={18} />
            </Button>
          </NeuralCard>
        </div>
      </div>
    </div>
  );
}
function BrainCircuit(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 .3 4.96 2.5 2.5 0 0 0 3.32 1.45 2.5 2.5 0 0 0 3.32-1.45 2.5 2.5 0 0 0 .3-4.96 2.5 2.5 0 0 0-1.98-3 2.5 2.5 0 0 0-4.96.46"/><path d="M15 8h5"/><path d="M15 12h5"/><path d="M15 16h5"/><path d="M8 16h.01"/><path d="M8 20h.01"/><path d="M12 18h.01"/><path d="M12 22h.01"/></svg>
  );
}