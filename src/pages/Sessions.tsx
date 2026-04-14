import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  Mic2, 
  MoreVertical,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  artistId: string;
  producerId: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Session[];
      setSessions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddSession = async () => {
    const title = prompt('Session Title:');
    if (!title) return;

    try {
      await addDoc(collection(db, 'sessions'), {
        title,
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '18:00',
        artistId: 'mock-artist',
        producerId: 'mock-producer',
        notes: '',
        status: 'scheduled',
        createdAt: serverTimestamp()
      });
      toast.success('Session scheduled');
    } catch (error) {
      toast.error('Failed to schedule session');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Cancel this session?')) return;
    try {
      await deleteDoc(doc(db, 'sessions', id));
      toast.success('Session cancelled');
    } catch (error) {
      toast.error('Failed to cancel session');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 uppercase text-[9px]">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-500/10 text-red-400 border-red-400/20 uppercase text-[9px]">Cancelled</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-400 border-blue-400/20 uppercase text-[9px]">Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Studio Sessions</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">BOOKING & SCHEDULING // CALENDAR_01</p>
        </div>
        <Button onClick={handleAddSession} className="bg-white text-black hover:bg-zinc-200 gap-2">
          <Plus className="w-4 h-4" />
          Book Session
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-[#151619] border border-[#2a2b2e] rounded-xl animate-pulse"></div>
          ))
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#2a2b2e] rounded-xl">
            <CalendarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-mono text-sm">No sessions scheduled</p>
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="bg-[#151619] border-[#2a2b2e] text-white hover:border-white/10 transition-colors">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#2a2b2e] rounded-lg border border-[#3a3b3e]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{format(new Date(session.date), 'MMM')}</span>
                  <span className="text-2xl font-bold tracking-tighter">{format(new Date(session.date), 'dd')}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg truncate">{session.title}</h3>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex items-center gap-6 text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono uppercase">{session.startTime} - {session.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mic2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono uppercase truncate max-w-[100px]">Studio A</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono uppercase truncate max-w-[100px]">Artist X</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-zinc-500 hover:text-red-400"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
