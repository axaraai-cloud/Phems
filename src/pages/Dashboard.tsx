import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Users, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  Mic2,
  Disc,
  Plus,
  Box,
  Receipt,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

const data = [
  { name: 'Mon', streams: 4000, sessions: 24 },
  { name: 'Tue', streams: 3000, sessions: 13 },
  { name: 'Wed', streams: 2000, sessions: 98 },
  { name: 'Thu', streams: 2780, sessions: 39 },
  { name: 'Fri', streams: 1890, sessions: 48 },
  { name: 'Sat', streams: 2390, sessions: 38 },
  { name: 'Sun', streams: 3490, sessions: 43 },
];

export default function Dashboard({ role }: { role: string | null }) {
  const [counts, setCounts] = useState({
    artists: 0,
    releases: 0,
    sessions: 0,
    tasks: 0
  });
  const [botStatus, setBotStatus] = useState('Initializing...');

  useEffect(() => {
    // Real-time listeners for counts
    const unsubArtists = onSnapshot(collection(db, 'artists'), (snap) => {
      setCounts(prev => ({ ...prev, artists: snap.size }));
    });
    const unsubReleases = onSnapshot(collection(db, 'releases'), (snap) => {
      setCounts(prev => ({ ...prev, releases: snap.size }));
    });
    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snap) => {
      setCounts(prev => ({ ...prev, sessions: snap.size }));
    });
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
      setCounts(prev => ({ ...prev, tasks: snap.size }));
    });

    const fetchBot = async () => {
      try {
        const res = await fetch('/api/bot/status');
        const data = await res.json();
        setBotStatus(data.status);
      } catch (e) {}
    };
    fetchBot();
    const botInterval = setInterval(fetchBot, 10000);

    return () => {
      unsubArtists();
      unsubReleases();
      unsubSessions();
      unsubTasks();
      clearInterval(botInterval);
    };
  }, []);

  const stats = role === 'admin' ? [
    { label: 'Active Artists', value: counts.artists.toString(), icon: Users, color: 'text-blue-400' },
    { label: 'Total Releases', value: counts.releases.toString(), icon: Music, color: 'text-purple-400' },
    { label: 'Total Sessions', value: counts.sessions.toString(), icon: Calendar, color: 'text-green-400' },
    { label: 'System Health', value: '98%', icon: CheckCircle2, color: 'text-orange-400' },
  ] : [
    { label: 'Your Releases', value: '4', icon: Music, color: 'text-purple-400' },
    { label: 'Upcoming Sessions', value: '2', icon: Calendar, color: 'text-green-400' },
    { label: 'Pending Tasks', value: '5', icon: CheckCircle2, color: 'text-orange-400' },
    { label: 'Studio Status', value: 'Online', icon: Clock, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {role === 'admin' ? 'System Overview' : 'Artist Dashboard'}
          </h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">
            {role === 'admin' ? 'REAL-TIME STUDIO ANALYTICS // NODE_01' : 'PERSONAL PRODUCTION HUB // ARTIST_01'}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#151619] border border-[#2a2b2e] px-4 py-2 rounded-md">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", botStatus.includes('Running') ? "bg-green-500" : "bg-blue-500")}></div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{botStatus}</span>
          </div>
          <div className="w-px h-4 bg-[#2a2b2e]"></div>
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Lat: 12ms</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#151619] border-[#2a2b2e] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-12 h-12" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-400 font-mono">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.5%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500">
              Streaming Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2e" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151619', border: '1px solid #2a2b2e' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="streams" 
                  stroke="#fff" 
                  fillOpacity={1} 
                  fill="url(#colorStreams)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { type: 'Session', title: 'Vocal Tracking - Artist X', time: '2h ago', icon: Mic2 },
                { type: 'Release', title: 'New Single "Midnight"', time: '5h ago', icon: Disc },
                { type: 'Task', title: 'Mix Review - Track 04', time: '1d ago', icon: CheckCircle2 },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 items-start group cursor-pointer">
                  <div className="mt-1 p-2 bg-[#2a2b2e] rounded-md group-hover:bg-white group-hover:text-black transition-colors">
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{activity.type}</span>
                      <span className="text-[10px] font-mono text-zinc-600">•</span>
                      <span className="text-[10px] font-mono text-zinc-600">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Book Session', icon: CalendarIcon, path: '/calendar', color: 'hover:border-green-500/50' },
          { label: 'Add Gear', icon: Box, path: '/inventory', color: 'hover:border-blue-500/50' },
          { label: 'New Invoice', icon: Receipt, path: '/invoices', color: 'hover:border-yellow-500/50', adminOnly: true },
          { label: 'Studio Chat', icon: CheckCircle2, path: '/chat', color: 'hover:border-purple-500/50' },
        ].filter(action => !action.adminOnly || role === 'admin').map((action) => (
          <Link key={action.label} to={action.path}>
            <Button 
              variant="outline" 
              className={cn(
                "w-full h-24 bg-[#151619] border-[#2a2b2e] flex flex-col gap-2 transition-all",
                action.color
              )}
            >
              <action.icon className="w-6 h-6 text-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-widest">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
