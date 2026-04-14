import { useState, useEffect } from 'react';
import { 
  Layers, 
  Mic2, 
  Settings2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface TrackStage {
  id: string;
  title: string;
  artistName: string;
  stage: 'writing' | 'recording' | 'mixing' | 'mastering' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

const STAGES = [
  { id: 'writing', label: 'Writing', icon: Layers, color: 'text-blue-400' },
  { id: 'recording', label: 'Recording', icon: Mic2, color: 'text-red-400' },
  { id: 'mixing', label: 'Mixing', icon: Settings2, color: 'text-purple-400' },
  { id: 'mastering', label: 'Mastering', icon: Clock, color: 'text-yellow-400' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-400' },
];

export default function Pipeline() {
  const [tracks, setTracks] = useState<TrackStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pipeline'), orderBy('dueDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TrackStage[];
      setTracks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const moveStage = async (trackId: string, currentStage: string) => {
    const stageIndex = STAGES.findIndex(s => s.id === currentStage);
    if (stageIndex === STAGES.length - 1) return;

    const nextStage = STAGES[stageIndex + 1].id;
    try {
      await updateDoc(doc(db, 'pipeline', trackId), { stage: nextStage });
      toast.success(`Moved to ${nextStage}`);
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production Pipeline</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">TRACK LIFECYCLE MANAGEMENT // FLOW_01</p>
        </div>
        <Button className="bg-white text-black hover:bg-zinc-200 gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </header>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-[1200px]">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex-1 flex flex-col gap-4 min-w-[250px]">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <stage.icon className={cn("w-4 h-4", stage.color)} />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">{stage.label}</h3>
                </div>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-mono">
                  {tracks.filter(t => t.stage === stage.id).length}
                </Badge>
              </div>

              <div className="flex-1 bg-[#151619]/50 border border-[#2a2b2e] rounded-2xl p-3 space-y-3 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {tracks
                    .filter(t => t.stage === stage.id)
                    .map((track) => (
                      <motion.div
                        key={track.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="bg-[#151619] border-[#2a2b2e] hover:border-white/20 transition-all cursor-grab active:cursor-grabbing group">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm leading-tight">{track.title}</h4>
                                <p className="text-[10px] font-mono text-zinc-500 uppercase">{track.artistName}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 group-hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1.5 text-zinc-500">
                                <Clock className="w-3 h-3" />
                                <span className="text-[9px] font-mono uppercase">{track.dueDate}</span>
                              </div>
                              {stage.id !== 'completed' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-white/10"
                                  onClick={() => moveStage(track.id, track.stage)}
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </AnimatePresence>
                {tracks.filter(t => t.stage === stage.id).length === 0 && (
                  <div className="h-20 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                    <p className="text-[10px] font-mono text-zinc-700 uppercase">Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
