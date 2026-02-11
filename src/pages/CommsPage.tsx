import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Reply, Archive, Star, Filter, ArrowLeft, BrainCircuit, Sparkles, UserCircle } from "lucide-react";
import { chatService } from "@/lib/chat";
import { useNavigate } from "react-router-dom";
import { GmailMessage, ConnectedService } from "../../worker/types";
export function CommsPage() {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [activeEmail, setActiveEmail] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loadInitial = useCallback(async () => {
    const status = await chatService.getServiceStatus();
    setServices(status);
    if (status.length > 0 && !activeEmail) {
      setActiveEmail(status[0].email || "");
    }
  }, [activeEmail]);
  const loadEmails = useCallback(async (emailToFetch?: string) => {
    if (!emailToFetch) return;
    setLoading(true);
    const data = await chatService.getEmails(emailToFetch);
    setEmails(data);
    setLoading(false);
  }, []);
  useEffect(() => { loadInitial(); }, [loadInitial]);
  useEffect(() => { if (activeEmail) loadEmails(activeEmail); }, [activeEmail, loadEmails]);
  const selectedEmail = emails.find(e => e.id === selectedId);
  const handleAISummarize = () => {
    if (!selectedEmail) return;
    const context = `Summarize shard: Account: ${activeEmail}. Subject: ${selectedEmail.subject}. Content: ${selectedEmail.snippet}`;
    navigate(`/?context=${encodeURIComponent(context)}`);
  };
  const handleAIReply = () => {
    if (!selectedEmail) return;
    const context = `Draft a reply from ${activeEmail} regarding "${selectedEmail.subject}".`;
    navigate(`/?context=${encodeURIComponent(context)}`);
  };
  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-transparent">
        <header className="shrink-0 px-8 py-4 border-b border-white/5 flex items-center justify-between bg-neural-bg/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-bio-cyan/10 border border-bio-cyan/20 flex items-center justify-center">
                <Mail className="text-bio-cyan w-5 h-5" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase">SYNAPTIC COMMS</h1>
            </div>
            <div className="hidden md:block h-6 w-[1px] bg-white/10" />
            <Select value={activeEmail} onValueChange={setActiveEmail}>
              <SelectTrigger className="w-[240px] bg-white/5 border-white/10 h-10 text-[10px] uppercase font-black tracking-widest text-bio-cyan">
                <UserCircle size={14} className="mr-2" />
                <SelectValue placeholder="Select Node" />
              </SelectTrigger>
              <SelectContent className="neural-glass border-white/10">
                {services.map(s => (
                  <SelectItem key={s.email} value={s.email || ""} className="text-[10px] uppercase font-bold">
                    {s.display_name || s.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white" onClick={() => loadEmails(activeEmail)}>
               <Filter size={12} className="mr-2" /> RE-SYNC
             </Button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {/* List */}
          <div className={`flex-1 lg:flex-none lg:w-[400px] overflow-y-auto border-r border-white/5 p-4 space-y-3 no-scrollbar ${selectedId ? 'hidden lg:block' : 'block'}`}>
            {loading ? (
              <div className="flex items-center justify-center py-20 opacity-20"><BrainCircuit className="animate-pulse" /></div>
            ) : emails.map((email) => (
              <NeuralCard
                key={email.id}
                onClick={() => setSelectedId(email.id)}
                className={`p-4 cursor-pointer transition-all duration-300 group ${selectedId === email.id ? 'bg-bio-cyan/10 border-bio-cyan/30 shadow-[0_0_15px_rgba(0,212,255,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-bio-cyan/20'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-bio-cyan uppercase truncate max-w-[180px]">{email.sender.split('<')[0]}</span>
                  <span className="text-[9px] font-mono text-white/20">{email.date.split(',')[0]}</span>
                </div>
                <h4 className="text-xs font-bold text-white/90 truncate mb-1">{email.subject}</h4>
                <p className="text-[11px] text-white/40 line-clamp-2 leading-tight">{email.snippet}</p>
              </NeuralCard>
            ))}
          </div>
          {/* Detailed View */}
          <div className={`flex-1 flex flex-col bg-neural-bg/10 ${!selectedId ? 'hidden lg:flex items-center justify-center opacity-10' : 'flex'}`}>
            {selectedEmail ? (
              <>
                <div className="p-4 border-b border-white/5 lg:hidden bg-neural-bg/50">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
                   <div className="max-w-3xl mx-auto space-y-8">
                      <header className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-bio-cyan/10 border border-bio-cyan/20 flex items-center justify-center text-bio-cyan">
                              <BrainCircuit size={24} className="animate-pulse" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-black tracking-tighter text-white uppercase">{selectedEmail.subject}</h2>
                              <p className="text-sm text-bio-cyan/60 font-mono mt-1">{selectedEmail.sender}</p>
                            </div>
                          </div>
                        </div>
                      </header>
                      <NeuralCard className="p-8 bg-white/[0.03] leading-relaxed text-white/80 whitespace-pre-wrap text-sm border-white/10 shadow-xl">
                        {selectedEmail.snippet}
                        <div className="mt-8 pt-8 border-t border-white/5 text-[10px] text-white/20 font-mono uppercase italic">
                          TRANSMISSION NODE: {activeEmail}
                        </div>
                      </NeuralCard>
                      <div className="flex flex-wrap gap-4 pt-4">
                        <Button onClick={handleAIReply} className="bg-bio-cyan text-neural-bg hover:bg-bio-cyan/80 font-black uppercase tracking-widest text-[10px] px-8 py-5 rounded-xl shadow-glow">
                          <Reply size={16} className="mr-2" /> AI Synthesis Reply
                        </Button>
                        <Button onClick={handleAISummarize} variant="outline" className="border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/10 font-black uppercase tracking-widest text-[10px] px-8 py-5 rounded-xl">
                          <Sparkles size={16} className="mr-2" /> Summarize with Cortex
                        </Button>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center">
                <Mail size={64} className="text-white/5" />
                <p className="uppercase tracking-[0.5em] text-[10px] font-black text-white/20">Select a comm node to synthesize</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}