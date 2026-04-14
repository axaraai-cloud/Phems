import { useState, useEffect } from 'react';
import { 
  Music, 
  Plus, 
  Disc, 
  Calendar, 
  Tag, 
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface Release {
  id: string;
  title: string;
  artistId: string;
  releaseDate: string;
  coverURL: string;
  status: 'draft' | 'scheduled' | 'released';
}

export default function Releases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'releases'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Release[];
      setReleases(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddRelease = async () => {
    const title = prompt('Enter release title:');
    if (!title) return;

    try {
      await addDoc(collection(db, 'releases'), {
        title,
        artistId: 'mock-artist-id',
        releaseDate: new Date().toISOString().split('T')[0],
        coverURL: `https://picsum.photos/seed/${title}/400/400`,
        status: 'draft',
        createdAt: serverTimestamp()
      });
      toast.success('Release created');
    } catch (error) {
      toast.error('Failed to create release');
    }
  };

  const handleDeleteRelease = async (id: string) => {
    if (!confirm('Delete this release?')) return;
    try {
      await deleteDoc(doc(db, 'releases', id));
      toast.success('Release deleted');
    } catch (error) {
      toast.error('Failed to delete release');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Releases</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">CATALOG MANAGEMENT // CATALOG_01</p>
        </div>
        <Button onClick={handleAddRelease} className="bg-white text-black hover:bg-zinc-200 gap-2">
          <Plus className="w-4 h-4" />
          New Release
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-[300px] bg-[#151619] border border-[#2a2b2e] rounded-xl animate-pulse"></div>
          ))
        ) : releases.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-[#2a2b2e] rounded-xl">
            <Disc className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-mono text-sm">No releases found in catalog</p>
          </div>
        ) : (
          releases.map((release) => (
            <Card key={release.id} className="bg-[#151619] border-[#2a2b2e] text-white overflow-hidden group hover:border-white/20 transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={release.coverURL} 
                  alt={release.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="rounded-full h-10 w-10"
                    onClick={() => handleDeleteRelease(release.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Badge className={cn("absolute top-3 right-3 uppercase text-[10px] font-mono tracking-widest", getStatusColor(release.status))}>
                  {release.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg truncate">{release.title}</h3>
                <div className="flex items-center gap-4 mt-3 text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">{release.releaseDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">Single</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
