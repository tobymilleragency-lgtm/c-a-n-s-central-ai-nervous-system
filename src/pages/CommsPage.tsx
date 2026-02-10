import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Mail, Send, Reply, Archive, Star, Search, Filter, ArrowLeft } from "lucide-react";
import { chatService } from "@/lib/chat";
import { motion, AnimatePresence } from "framer-motion";
import { GmailMessage } from "../../worker/types";
export function CommsPage() {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    loadEmails();
  }, []);
  const loadEmails = async () => {
    const data = await chatService.getEmails();
    setEmails(data);
  };
  const selectedEmail = emails.find(e => e.id === selectedId);
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="text-bio-cyan w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">Comms Stream</h1>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[10px] uppercase font-bold">
               <Filter size={12} className="mr-2" /> Filter
             </Button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {/* List */}
          <div className={`flex-1 lg:flex-none lg:w-[400px] overflow-y-auto border-r border-white/5 p-4 space-y-3 no-scrollbar ${selectedId ? 'hidden lg:block' : 'block'}`}>
            {emails.map((email) => (
              <NeuralCard 
                key={email.id} 
                onClick={() => setSelectedId(email.id)}
                className={`p-4 cursor-pointer transition-all duration-300 ${selectedId === email.id ? 'bg-bio-cyan/10 border-bio-cyan/30 shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-bio-cyan uppercase truncate max-w-[150px]">{email.sender}</span>
                  <span className="text-[9px] font-mono text-white/20">{email.date}</span>
                </div>
                <h4 className="text-xs font-bold text-white/90 truncate mb-1">{email.subject}</h4>
                <p className="text-[11px] text-white/40 line-clamp-2">{email.snippet}</p>
              </NeuralCard>
            ))}
          </div>
          {/* Detailed View */}
          <div className={`flex-1 flex flex-col bg-neural-bg/30 ${!selectedId ? 'hidden lg:flex items-center justify-center opacity-10' : 'flex'}`}>
            {selectedEmail ? (
              <>
                <div className="p-4 border-b border-white/5 lg:hidden">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                </div>
                <div className="p-10 flex-1 overflow-y-auto">
                   <div className="max-w-3xl mx-auto space-y-10">
                      <header className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-bio-cyan/20 border border-bio-cyan/30 flex items-center justify-center text-bio-cyan">
                              <Mail size={24} />
                            </div>
                            <div>
                              <h2 className="text-2xl font-black tracking-tight text-white">{selectedEmail.subject}</h2>
                              <p className="text-sm text-bio-cyan/60 font-medium mt-1">{selectedEmail.sender}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <Button size="icon" variant="ghost" className="text-white/20 hover:text-white"><Star size={18} /></Button>
                             <Button size="icon" variant="ghost" className="text-white/20 hover:text-white"><Archive size={18} /></Button>
                          </div>
                        </div>
                      </header>
                      <NeuralCard className="p-8 bg-white/5 leading-relaxed text-white/80 whitespace-pre-wrap text-sm border-white/10">
                        {selectedEmail.body || selectedEmail.snippet + "\n\n(Full message content retrieved via synaptic bridge)"}
                      </NeuralCard>
                      <div className="flex gap-4">
                        <Button className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 font-bold uppercase tracking-widest text-xs px-8">
                          <Reply size={16} className="mr-2" /> Reply
                        </Button>
                        <Button variant="outline" className="border-white/10 text-white/40 hover:text-white font-bold uppercase tracking-widest text-xs px-8">
                          Mark as Insight
                        </Button>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Mail size={48} className="text-white/10" />
                <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-white/20">Select a comm node to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}