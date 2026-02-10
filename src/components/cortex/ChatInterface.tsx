import React, { useState, useEffect, useRef } from "react";
import { chatService } from "@/lib/chat";
import { Message } from "../../../worker/types";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, User } from "lucide-react";
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
  }, [messages]);
  const loadMessages = async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      setMessages(res.data.messages);
    }
  };
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput("");
    setIsLoading(true);
    // Optimistic update
    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    const res = await chatService.sendMessage(userMessage);
    if (res.success) {
      await loadMessages();
    }
    setIsLoading(false);
  };
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-8">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-24 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
            >
              <div className="w-16 h-16 rounded-full border border-bio-cyan/20 flex items-center justify-center animate-neural-pulse">
                <Sparkles className="text-bio-cyan w-8 h-8" />
              </div>
              <p className="text-bio-cyan/60 font-medium tracking-wide">INITIALIZING CORTEX CONNECT...</p>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border shrink-0",
                msg.role === 'user' ? "border-alert-pink/30 bg-alert-pink/10" : "border-bio-cyan/30 bg-bio-cyan/10"
              )}>
                {msg.role === 'user' ? <User size={14} className="text-alert-pink" /> : <Sparkles size={14} className="text-bio-cyan" />}
              </div>
              <NeuralCard 
                className={cn(
                  "max-w-[80%] p-4",
                  msg.role === 'user' ? "border-alert-pink/20 bg-alert-pink/5" : "border-bio-cyan/20 bg-bio-cyan/5"
                )}
                glow={msg.role === 'assistant'}
              >
                <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">{msg.content}</p>
              </NeuralCard>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border border-bio-cyan/30 bg-bio-cyan/10">
                <Loader2 size={14} className="text-bio-cyan animate-spin" />
              </div>
              <div className="h-4 w-12 bg-bio-cyan/10 rounded animate-pulse" />
            </div>
          )}
        </AnimatePresence>
      </div>
      {/* Console Input */}
      <div className="fixed bottom-8 left-0 right-0 lg:left-[260px] lg:right-[320px] px-8">
        <div className="max-w-4xl mx-auto relative">
          <NeuralCard className="p-1 pr-2 border-white/10 flex items-center gap-2 focus-within:border-bio-cyan/40 transition-colors">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Transmit neural query..."
              className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-white/20 h-12"
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 rounded-lg shrink-0"
            >
              <Send size={18} />
            </Button>
          </NeuralCard>
          <div className="absolute -bottom-5 left-4 flex gap-4">
             <span className="text-[9px] uppercase tracking-tighter text-white/20 font-mono">Status: Connected</span>
             <span className="text-[9px] uppercase tracking-tighter text-bio-cyan/40 font-mono animate-pulse">Encryption: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}