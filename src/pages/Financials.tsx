import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Receipt,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: any;
}

const chartData = [
  { name: 'Jan', income: 4500, expense: 2100 },
  { name: 'Feb', income: 5200, expense: 2400 },
  { name: 'Mar', income: 4800, expense: 2800 },
  { name: 'Apr', income: 6100, expense: 3100 },
  { name: 'May', income: 5900, expense: 2900 },
  { name: 'Jun', income: 7200, expense: 3400 },
];

export default function Financials() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = async (type: 'income' | 'expense') => {
    const amountStr = prompt(`Enter ${type} amount:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;

    const description = prompt('Description:');
    if (!description) return;

    try {
      await addDoc(collection(db, 'transactions'), {
        type,
        amount,
        description,
        category: type === 'income' ? 'Studio Session' : 'Equipment',
        date: serverTimestamp()
      });
      toast.success('Transaction recorded');
    } catch (error) {
      toast.error('Failed to record transaction');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Hub</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">REVENUE & EXPENSE TRACKING // FIN_01</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleAddTransaction('income')} className="bg-green-500 hover:bg-green-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Income
          </Button>
          <Button onClick={() => handleAddTransaction('expense')} className="bg-red-500 hover:bg-red-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="w-3 h-3" /> Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">${balance.toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-widest">Net Studio Profit</p>
          </CardContent>
        </Card>
        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-green-500 uppercase tracking-widest flex items-center gap-2">
              <ArrowUpRight className="w-3 h-3" /> Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-green-400">${totalIncome.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-green-500 font-mono">
              <TrendingUp className="w-3 h-3" /> +14.2% from last month
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono text-red-500 uppercase tracking-widest flex items-center gap-2">
              <ArrowDownRight className="w-3 h-3" /> Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-red-400">${totalExpense.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-mono">
              <TrendingDown className="w-3 h-3" /> -2.4% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500">Revenue Flow</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2e" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151619', border: '1px solid #2a2b2e' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#incomeGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500">Ledger</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
              <Download className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-zinc-500 font-mono text-xs py-10">Syncing ledger...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-zinc-500 font-mono text-xs py-10">No transactions recorded</p>
              ) : (
                transactions.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className={cn(
                      "p-2 rounded-md",
                      t.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.description}</p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">{t.category}</p>
                    </div>
                    <div className={cn(
                      "text-sm font-bold",
                      t.type === 'income' ? "text-green-400" : "text-red-400"
                    )}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
