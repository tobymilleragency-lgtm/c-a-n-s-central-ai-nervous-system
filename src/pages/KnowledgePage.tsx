import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Input } from "@/components/ui/input";
import { Database, Search, Trash2, BrainCircuit, BookOpen, UserCircle, Globe, Loader2 } from "lucide-react";
import { chatService } from "@/lib/chat";
import { formatNeuralDate } from "@/lib/neural-utils";
import { toast } from "sonner";
export function KnowledgePage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadMemories();
  }, []);
  const loadMemories = async () => {
    setLoading(true);
    const data = await chatService.getMemories();
    setMemories(data);
    setLoading(false);
  };
  const handleDelete = async (id: string) => {
    const success = await chatService.deleteMemory(id);
    if (success) {
      setMemories(prev => prev.filter(m => m.id !== id));
      toast.success("Memory node pruned successfully");
    } else {
      toast.error("Failed to prune memory node");
    }
  };
  const filteredMemories = memories.filter(m =>
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'personal': return <UserCircle size={14} className="text-bio-cyan" />;
      case 'project': return <BrainCircuit size={14} className="text-memory-violet" />;
      case 'global': return <Globe size={14} className="text-bio-cyan" />;
      default: return <BookOpen size={14} className="text-white/40" />;
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Database className="text-bio-cyan w-8 h-8" />
                <h1 className="text-3xl font-black tracking-tight">Synaptic Vault</h1>
              </div>
              <p className="text-muted-foreground">Long-term memory indexing and bio-data retrieval.</p>
            </div>
            <div className="relative max-w-md w-full group">
              <div className="absolute inset-0 bg-bio-cyan/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-bio-cyan transition-colors" size={18} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Query synaptic indices..."
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus-visible:ring-bio-cyan/30 text-white"
              />
            </div>
          </header>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-bio-cyan animate-spin" />
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Database size={64} className="mb-4" />
              <p className="uppercase tracking-[0.3em] font-bold">No Neural Indices Found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemories.map((memory) => (
                <NeuralCard
                  key={memory.id}
                  className="p-6 flex flex-col h-full group hover:border-bio-cyan/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all duration-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md">
                      {getCategoryIcon(memory.category)}
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">
                        {memory.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/20 uppercase">
                      {formatNeuralDate(memory.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed flex-1 italic">
                    "{memory.content}"
                  </p>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleDelete(memory.id)}
                      className="text-white/20 hover:text-alert-pink transition-colors p-2 rounded-lg hover:bg-alert-pink/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </NeuralCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}