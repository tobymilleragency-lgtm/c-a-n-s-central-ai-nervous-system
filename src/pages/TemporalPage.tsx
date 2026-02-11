import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NeuralCard } from "@/components/ui/neural-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertCircle, Zap, Loader2 } from "lucide-react";
import { chatService } from "@/lib/chat";
import { cn } from "@/lib/utils";
export function TemporalPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const loadTasks = useCallback(async () => {
    const data = await chatService.getTasks();
    setTasks(data);
    setLoading(false);
  }, []);
  useEffect(() => {
    loadTasks();
    const handleFocus = () => loadTasks();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(loadTasks, 30000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [loadTasks]);
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const success = await chatService.updateTaskStatus(taskId, newStatus);
    if (success) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  };
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-memory-violet w-8 h-8" />
              <h1 className="text-3xl font-black tracking-tight text-white">Temporal Timeline</h1>
            </div>
            <p className="text-muted-foreground">Managing sequential tasks and synaptic scheduling.</p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <NeuralCard className="p-8 border-memory-violet/20 bg-memory-violet/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black uppercase tracking-widest text-memory-violet">Current Load Cycle</h2>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-white/40">EFFICIENCY</span>
                    <span className="text-memory-violet">{Math.round(progress)}%</span>
                  </div>
                </div>
                <Progress value={progress} className="h-1.5 bg-white/5 transition-all duration-700" />
              </NeuralCard>
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/20 px-2">Synaptic Load</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-memory-violet animate-spin" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
                    <CheckCircle2 size={40} className="mx-auto mb-4 text-white/10" />
                    <p className="text-white/30 uppercase text-xs tracking-widest font-bold">Timeline Clear</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <NeuralCard
                      key={task.id}
                      className={cn(
                        "p-5 flex items-center gap-4 transition-all duration-500",
                        task.status === 'completed' ? "opacity-40" : "opacity-100 border-memory-violet/10"
                      )}
                    >
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleToggleTask(task.id, task.status)}
                        className="h-5 w-5 rounded-full border-memory-violet/40 data-[state=checked]:bg-memory-violet"
                      />
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium tracking-wide",
                          task.status === 'completed' && "line-through text-white/50"
                        )}>
                          {task.title}
                        </p>
                        <span className="text-[9px] font-mono text-white/20 uppercase mt-1 block">
                          SEQ-ID: {task.id.split('-')[0]}
                        </span>
                      </div>
                      {task.status !== 'completed' && (
                        <Zap size={14} className="text-memory-violet animate-pulse shrink-0" />
                      )}
                    </NeuralCard>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-8">
              <section>
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-4 px-2">System Health</h3>
                <NeuralCard className="p-6 bg-alert-pink/5 border-alert-pink/10">
                  <div className="flex gap-3">
                    <AlertCircle size={16} className="text-alert-pink shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-alert-pink uppercase">Density Alert</p>
                      <p className="text-[10px] text-white/60 leading-tight mt-1">High synaptic density detected. Optimizing temporal buffers.</p>
                    </div>
                  </div>
                </NeuralCard>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}