import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Input } from "@/components/ui/input";
import { FileText, Search, ExternalLink, Loader2, Database, Info, FileSearch } from "lucide-react";
import { chatService } from "@/lib/chat";
export function DrivePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadFiles(); }, []);
  const loadFiles = async () => {
    setLoading(true);
    const data = await chatService.getDriveFiles();
    setFiles(data);
    setLoading(false);
  };
  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <AppLayout peripheral={
      <div className="p-6 space-y-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black flex items-center gap-2">
          <Info size={12} className="text-bio-cyan" /> Shard Insights
        </h3>
        <NeuralCard className="p-4 bg-bio-cyan/5 border-bio-cyan/20">
          <p className="text-[10px] text-white/60 leading-relaxed italic">
            "Neural Drive acts as your external neocortex. Use the Cortex to summarize these shards or synthesize new data nodes."
          </p>
        </NeuralCard>
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Storage Density</div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-bio-cyan w-1/4 animate-pulse shadow-[0_0_10px_#00d4ff]" />
          </div>
        </div>
      </div>
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-bio-cyan w-8 h-8" />
              <h1 className="text-3xl font-black tracking-tight">Neural Drive</h1>
            </div>
            <p className="text-muted-foreground">External document nodes indexed via cloud synapse.</p>
          </div>
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-bio-cyan" size={18} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Query file shards..." className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl" />
          </div>
        </header>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 text-bio-cyan animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-20"><FileSearch size={64} className="mx-auto mb-4" /><p className="uppercase tracking-widest font-bold">No Shards Found</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((file) => (
              <NeuralCard key={file.id} className="p-5 hover:border-bio-cyan/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/5 text-bio-cyan"><FileText size={20} /></div>
                  <a href={file.webkitLink} target="_blank" rel="noreferrer" className="text-white/20 hover:text-bio-cyan transition-colors"><ExternalLink size={16} /></a>
                </div>
                <h3 className="text-sm font-bold text-white/90 truncate mb-1">{file.name}</h3>
                <p className="text-[10px] text-white/30 font-mono uppercase truncate">{file.mimeType.split('.').pop()}</p>
              </NeuralCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}