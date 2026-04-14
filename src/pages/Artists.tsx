import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Instagram, 
  Music2, 
  ExternalLink,
  Trash2,
  Edit2,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface Artist {
  id: string;
  name: string;
  bio: string;
  imageURL: string;
  email: string;
  instagram: string;
  genre: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: any;
}

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'artists'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Artist[];
      setArtists(data);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error:', error);
      toast.error('Failed to load artists');
    });

    return () => unsubscribe();
  }, []);

  const handleAddArtist = async () => {
    const name = prompt('Artist Name:');
    if (!name) return;

    try {
      await addDoc(collection(db, 'artists'), {
        name,
        bio: '',
        imageURL: `https://picsum.photos/seed/${name}/200/200`,
        email: '',
        instagram: '',
        genre: 'Various',
        status: 'active',
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Artist added to roster');
    } catch (error) {
      toast.error('Failed to add artist');
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (!confirm('Remove this artist from the roster?')) return;
    try {
      await deleteDoc(doc(db, 'artists', id));
      toast.success('Artist removed');
    } catch (error) {
      toast.error('Failed to remove artist');
    }
  };

  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Artist Roster</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">TALENT MANAGEMENT // ROSTER_01</p>
        </div>
        <Button onClick={handleAddArtist} className="bg-white text-black hover:bg-zinc-200 gap-2">
          <UserPlus className="w-4 h-4" />
          Add Artist
        </Button>
      </header>

      <div className="flex items-center gap-4 bg-[#151619] border border-[#2a2b2e] p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search roster by name or genre..." 
            className="pl-10 bg-[#0a0a0a] border-[#2a2b2e] focus:ring-1 focus:ring-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 border-l border-[#2a2b2e]">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total:</span>
          <span className="text-sm font-bold">{artists.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-[#151619] border border-[#2a2b2e] rounded-2xl animate-pulse"></div>
            ))
          ) : filteredArtists.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-[#2a2b2e] rounded-2xl">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono text-sm">No artists found in roster</p>
            </div>
          ) : (
            filteredArtists.map((artist, i) => (
              <motion.div
                key={artist.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card className="bg-[#151619] border-[#2a2b2e] text-white overflow-hidden group hover:border-white/20 transition-all hardware-glow">
                  <CardHeader className="p-0 relative h-32 overflow-hidden">
                    <img 
                      src={artist.imageURL} 
                      alt={artist.name}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151619] to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-black/50 text-white hover:bg-white hover:text-black transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#151619] border-[#2a2b2e] text-white">
                          <DropdownMenuItem className="gap-2 focus:bg-[#2a2b2e] focus:text-white cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer"
                            onClick={() => handleDeleteArtist(artist.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Remove Artist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 -mt-12 relative">
                    <Avatar className="w-20 h-20 border-4 border-[#151619] shadow-xl mb-4">
                      <AvatarImage src={artist.imageURL} />
                      <AvatarFallback className="bg-[#2a2b2e] text-xl font-bold">
                        {artist.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold tracking-tight">{artist.name}</h3>
                      <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{artist.genre}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-[#2a2b2e]">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                        <Instagram className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                        <Music2 className="w-4 h-4" />
                      </Button>
                      <div className="ml-auto">
                        <Button variant="outline" size="sm" className="h-8 border-[#2a2b2e] hover:bg-white hover:text-black text-[10px] font-mono uppercase tracking-widest">
                          View Stats
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
