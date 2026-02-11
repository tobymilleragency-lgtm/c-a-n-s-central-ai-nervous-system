import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Mail, Send, Reply, Archive, Star, Filter, ArrowLeft, BrainCircuit, Sparkles } from "lucide-react";
import { chatService } from "@/lib/chat";
import { useNavigate } from "react-router-dom";
import { GmailMessage } from "../../worker/types";
export function CommsPage() {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    loadEmails();
  }, []);
  const loadEmails = async () => {
    const data = await chatService.getEmails();
    setEmails(data);
  };
  const selectedEmail = emails.find(e => e.id === selectedId);
  const handleAISummarize = () => {
    if (!selectedEmail) return;
    const context = `Summarize this email from ${selectedEmail.sender} with subject: ${selectedEmail.subject}. Content: ${selectedEmail.snippet}`;
    navigate(`/?context=${encodeURIComponent(context)}`);
  };
  const handleAIReply = () => {
    if (!selectedEmail) return;
    const context = `Draft a professional reply to ${selectedEmail.sender} regarding "${selectedEmail.subject}".`;
    navigate(`/?context=${encodeURIComponent(context)}`);
  };
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-neural-bg/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-bio-cyan/10 border border-bio-cyan/20 flex items-center justify-center">
              <Mail className="text-bio-cyan w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">SYNAPTIC COMMS</h1>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[10px] uppercase font-bold tracking-widest hover:bg-white/10">
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
                className={`p-4 cursor-pointer transition-all duration-300 group ${selectedId === email.id ? 'bg-bio-cyan/10 border-bio-cyan/30 shadow-[0_0_15px_rgba(0,212,255,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-bio-cyan/20'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-bio-cyan uppercase truncate max-w-[180px] group-hover:drop-shadow-[0_0_5px_rgba(0,212,255,0.5)] transition-all">{email.sender.split('<')[0]}</span>
                  <span className="text-[9px] font-mono text-white/20">{email.date.split(',')[0]}</span>
                </div>
                <h4 className="text-xs font-bold text-white/90 truncate mb-1">{email.subject}</h4>
                <p className="text-[11px] text-white/40 line-clamp-2 leading-tight">{email.snippet}</p>
              </NeuralCard>
            ))}
          </div>
          {/* Detailed View */}
          <div className={`flex-1 flex flex-col bg-[#0a0e1a]/20 ${!selectedId ? 'hidden lg:flex items-center justify-center opacity-10' : 'flex'}`}>
            {selectedEmail ? (
              <>
                <div className="p-4 border-b border-white/5 lg:hidden">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                </div>
                <div className="p-10 flex-1 overflow-y-auto">
                   <div className="max-w-3xl mx-auto space-y-8">
                      <header className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-bio-cyan/10 border border-bio-cyan/20 flex items-center justify-center text-bio-cyan animate-pulse">
                              <BrainCircuit size={24} />
                            </div>
                            <div>
                              <h2 className="text-2xl font-black tracking-tighter text-white uppercase">{selectedEmail.subject}</h2>
                              <p className="text-sm text-bio-cyan/60 font-mono mt-1">{selectedEmail.sender}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold border-white/10 hover:bg-white/10"><Star size={14} className="mr-2" /> Mark as Key</Button>
                           <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold border-white/10 hover:bg-white/10"><Archive size={14} className="mr-2" /> Archival</Button>
                        </div>
                      </header>
                      <NeuralCard className="p-8 bg-white/[0.03] leading-relaxed text-white/80 whitespace-pre-wrap text-sm border-white/10 shadow-xl">
                        {selectedEmail.snippet}
                        <div className="mt-8 pt-8 border-t border-white/5 text-[10px] text-white/20 font-mono uppercase italic">
                          End of transmission segment. Full shard retrieval available via Cortex.
                        </div>
                      </NeuralCard>
                      <div className="flex flex-wrap gap-4 pt-4">
                        <Button onClick={handleAIReply} className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-xl shadow-glow">
                          <Reply size={16} className="mr-2" /> AI Synthesis Reply
                        </Button>
                        <Button onClick={handleAISummarize} variant="outline" className="border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/10 font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-xl">
                          <Sparkles size={16} className="mr-2" /> Summarize with Cortex
                        </Button>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                  <Mail size={64} className="text-white/5" />
                  <div className="absolute inset-0 bg-bio-cyan/5 blur-3xl rounded-full" />
                </div>
                <p className="uppercase tracking-[0.5em] text-[10px] font-black text-white/20">Select a comm node to synthesize</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}