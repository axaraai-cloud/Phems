import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Mail,
  DollarSign,
  Printer,
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
import { format } from 'date-fns';

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: any;
  description: string;
  invoiceNumber: string;
  createdAt: any;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      setInvoices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateInvoice = async () => {
    const clientName = prompt('Client Name:');
    if (!clientName) return;
    const amountStr = prompt('Amount:');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    
    try {
      await addDoc(collection(db, 'invoices'), {
        clientName,
        amount,
        status: 'pending',
        description: 'Studio Recording Session',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        dueDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      toast.success('Invoice generated');
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  const updateStatus = async (id: string, status: Invoice['status']) => {
    try {
      await updateDoc(doc(db, 'invoices', id), { status });
      toast.success(`Invoice marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteDoc(doc(db, 'invoices', id));
      toast.success('Invoice deleted');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Invoices</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">FINANCIAL DOCUMENTATION // BILL_01</p>
        </div>
        <Button onClick={handleCreateInvoice} className="bg-white text-black hover:bg-zinc-200 gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </header>

      <div className="flex items-center gap-4 bg-[#151619] border border-[#2a2b2e] p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search by client or invoice number..." 
            className="pl-10 bg-[#0a0a0a] border-[#2a2b2e] focus:ring-1 focus:ring-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-6 px-4 border-l border-[#2a2b2e]">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Outstanding</span>
            <span className="text-sm font-bold text-red-400">
              ${invoices.filter(i => i.status !== 'paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Collected</span>
            <span className="text-sm font-bold text-green-400">
              ${invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#151619] border border-[#2a2b2e] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-bottom border-[#2a2b2e] bg-white/5">
              <th className="p-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Invoice</th>
              <th className="p-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Client</th>
              <th className="p-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Amount</th>
              <th className="p-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="p-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Due Date</th>
              <th className="p-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2b2e]">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono text-xs animate-pulse">Syncing billing data...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono text-xs">No invoices found</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <motion.tr 
                    key={inv.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-md border border-white/10">
                          <FileText className="w-4 h-4 text-zinc-400" />
                        </div>
                        <span className="font-mono text-sm font-bold">{inv.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">{inv.clientName}</p>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">{inv.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold">${inv.amount.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={cn(
                        "font-mono text-[10px] uppercase tracking-widest border-none",
                        inv.status === 'paid' ? "bg-green-500/10 text-green-500" :
                        inv.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-zinc-500 font-mono">
                        {inv.dueDate?.seconds ? format(new Date(inv.dueDate.seconds * 1000), 'MMM dd, yyyy') : '---'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#151619] border-[#2a2b2e] text-white">
                            <DropdownMenuItem onClick={() => updateStatus(inv.id, 'paid')} className="gap-2 focus:bg-[#2a2b2e] focus:text-white cursor-pointer">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Mark Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 focus:bg-[#2a2b2e] focus:text-white cursor-pointer">
                              <Printer className="w-4 h-4" /> Print PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(inv.id)} className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer">
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
