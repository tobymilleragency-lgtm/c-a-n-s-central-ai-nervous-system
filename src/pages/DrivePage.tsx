import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Search, ExternalLink, Loader2, Database, Info, FileSearch, Sparkles, Plus } from "lucide-react";
import { chatService } from "@/lib/chat";
import { useNavigate } from "react-router-dom";
export function DrivePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => { loadFiles(); }, []);
  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await chatService.getDriveFiles();
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load shards:", e);
    } finally {
      setLoading(false);
    }
  };
  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const stats = useMemo(() => {
    const total = files.length || 1;
    const docs = files.filter(f => f.mimeType?.includes('document')).length;
    const sheets = files.filter(f => f.mimeType?.includes('spreadsheet')).length;
    return {
      docs: (docs / total) * 100,
      sheets: (sheets / total) * 100
    };
  }, [files]);
  return (
    <AppLayout peripheral={
      <div className="p-6 space-y-8 h-full flex flex-col no-scrollbar">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black flex items-center gap-2">
          <Info size={12} className="text-bio-cyan" /> Shard Analytics
        </h3>
        <NeuralCard className="p-4 bg-bio-cyan/[0.03] border-bio-cyan/10">
          <p className="text-[10px] text-white/60 leading-relaxed italic">
            "Neural Drive acts as your external neocortex. Use the Cortex to summarize these shards or synthesize new data nodes."
          </p>
        </NeuralCard>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
              <span>Textual Shards</span>
              <span className="text-bio-cyan">{Math.round(stats.docs)}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-bio-cyan" style={{ width: `${stats.docs}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <Button onClick={() => navigate('/?context=New shard initialization')} className="w-full bg-bio-cyan/10 border border-bio-cyan/20 text-bio-cyan hover:bg-bio-cyan/20 font-black uppercase tracking-widest text-[9px] h-12 rounded-xl">
            <Plus size={14} className="mr-2" /> Initialize Shard
          </Button>
        </div>
      </div>
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-bio-cyan/10 border border-bio-cyan/20 flex items-center justify-center">
                  <Database className="text-bio-cyan w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">NEURAL DRIVE</h1>
              </div>
              <p className="text-muted-foreground font-medium">External document nodes indexed via cloud synapse.</p>
            </div>
            <div className="relative max-w-md w-full group">
              <div className="absolute inset-0 bg-bio-cyan/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-bio-cyan transition-colors" size={18} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Query file shards..."
                className="pl-10 h-12 bg-white/[0.02] border-white/10 rounded-xl focus-visible:ring-bio-cyan/30"
              />
            </div>
          </header>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-bio-cyan animate-spin opacity-50" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <FileSearch size={64} className="mx-auto mb-4" />
              <p className="uppercase tracking-[0.5em] font-black text-xs">No Shards Found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((file) => (
                <NeuralCard key={file.id} className="p-6 hover:border-bio-cyan/40 transition-all group relative overflow-hidden flex flex-col h-full bg-[#0f1428]/60 backdrop-blur-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 rounded-2xl bg-white/[0.03] text-bio-cyan group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => navigate(`/?context=Summarize shard ${file.name}`)} size="icon" variant="ghost" className="h-8 w-8 text-bio-cyan/40 hover:text-bio-cyan">
                        <Sparkles size={16} />
                      </Button>
                      {file.webViewLink && (
                        <a href={file.webViewLink} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-white/20 hover:text-white transition-colors h-8 w-8 flex items-center justify-center">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white/90 truncate mb-1 uppercase tracking-tight">{file.name}</h3>
                    <p className="text-[10px] text-white/30 font-mono uppercase truncate mt-auto">TYPE: {file.mimeType?.split('.').pop() || 'UNKNOWN'}</p>
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