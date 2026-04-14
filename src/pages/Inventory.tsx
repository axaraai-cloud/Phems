import { useState, useEffect } from 'react';
import { 
  Box, 
  Plus, 
  Search, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  MoreVertical,
  History,
  Tag,
  Cpu,
  Mic2,
  Music,
  Monitor,
  Trash2
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
import { Badge } from '../components/ui/badge';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Equipment {
  id: string;
  name: string;
  category: 'Microphones' | 'Outboard' | 'Instruments' | 'Monitoring' | 'Computing';
  status: 'available' | 'in-use' | 'maintenance';
  serialNumber: string;
  lastMaintenance: any;
  location: string;
}

const CATEGORY_ICONS = {
  Microphones: Mic2,
  Outboard: Cpu,
  Instruments: Music,
  Monitoring: Monitor,
  Computing: Box
};

export default function Inventory() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'inventory'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[];
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddItem = async () => {
    const name = prompt('Equipment Name:');
    if (!name) return;
    const category = prompt('Category (Microphones, Outboard, Instruments, Monitoring, Computing):') as any;
    
    try {
      await addDoc(collection(db, 'inventory'), {
        name,
        category: category || 'Outboard',
        status: 'available',
        serialNumber: `SN-${Math.random().toString(36).toUpperCase().substr(2, 6)}`,
        lastMaintenance: serverTimestamp(),
        location: 'Studio A',
        createdAt: serverTimestamp()
      });
      toast.success('Equipment added to inventory');
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  const updateStatus = async (id: string, status: Equipment['status']) => {
    try {
      await updateDoc(doc(db, 'inventory', id), { status });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from inventory?')) return;
    try {
      await deleteDoc(doc(db, 'inventory', id));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipment Inventory</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">ASSET MANAGEMENT // GEAR_01</p>
        </div>
        <Button onClick={handleAddItem} className="bg-white text-black hover:bg-zinc-200 gap-2">
          <Plus className="w-4 h-4" />
          Add Gear
        </Button>
      </header>

      <div className="flex items-center gap-4 bg-[#151619] border border-[#2a2b2e] p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search inventory by name, category, or SN..." 
            className="pl-10 bg-[#0a0a0a] border-[#2a2b2e] focus:ring-1 focus:ring-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 border-l border-[#2a2b2e]">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Assets:</span>
          <span className="text-sm font-bold">{items.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-[#151619] border border-[#2a2b2e] rounded-2xl animate-pulse"></div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-[#2a2b2e] rounded-2xl">
              <Box className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono text-sm">No equipment found in inventory</p>
            </div>
          ) : (
            filteredItems.map((item, i) => {
              const Icon = CATEGORY_ICONS[item.category] || Box;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <Card className="bg-[#151619] border-[#2a2b2e] text-white overflow-hidden group hover:border-white/20 transition-all hardware-glow">
                    <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                          <Icon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold tracking-tight">{item.name}</CardTitle>
                          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{item.category}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:text-white transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#151619] border-[#2a2b2e] text-white">
                          <DropdownMenuItem onClick={() => updateStatus(item.id, 'available')} className="gap-2 focus:bg-[#2a2b2e] focus:text-white cursor-pointer">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Mark Available
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(item.id, 'maintenance')} className="gap-2 focus:bg-[#2a2b2e] focus:text-white cursor-pointer">
                            <Wrench className="w-4 h-4 text-yellow-500" /> Mark Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item.id)} className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer">
                            <Trash2 className="w-4 h-4" /> Remove Asset
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-6 pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase">Status</p>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              item.status === 'available' ? "bg-green-500" : 
                              item.status === 'maintenance' ? "bg-yellow-500" : "bg-red-500"
                            )}></div>
                            <span className="text-xs font-bold capitalize">{item.status}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase">Serial Number</p>
                          <p className="text-xs font-mono">{item.serialNumber}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Tag className="w-3 h-3" />
                          <span className="text-[10px] font-mono uppercase tracking-widest">{item.location}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white">
                          <History className="w-3 h-3 mr-1" /> Log
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
