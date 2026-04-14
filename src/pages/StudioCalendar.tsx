import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Session {
  id: string;
  artistName: string;
  type: string;
  date: any;
  startTime: string;
  duration: string;
  status: string;
}

export default function StudioCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('date', 'asc'));
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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getSessionsForDay = (day: Date) => {
    return sessions.filter(session => {
      if (!session.date?.seconds) return false;
      const sessionDate = new Date(session.date.seconds * 1000);
      return isSameDay(sessionDate, day);
    });
  };

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Studio Calendar</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">MASTER SCHEDULE // CAL_01</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#151619] border border-[#2a2b2e] rounded-lg p-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-zinc-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 text-sm font-bold min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-zinc-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button className="bg-white text-black hover:bg-zinc-200 gap-2">
            <Plus className="w-4 h-4" />
            Book Session
          </Button>
        </div>
      </header>

      <div className="flex-1 bg-[#151619] border border-[#2a2b2e] rounded-2xl overflow-hidden flex flex-col">
        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-[#2a2b2e] bg-white/5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {calendarDays.map((day, i) => {
            const daySessions = getSessionsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-[#2a2b2e] transition-colors relative group",
                  !isCurrentMonth && "bg-black/20 opacity-30",
                  isToday && "bg-white/[0.02]"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-xs font-mono",
                    isToday ? "text-white font-bold" : "text-zinc-500"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {daySessions.length > 0 && (
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">
                      {daySessions.length} {daySessions.length === 1 ? 'Session' : 'Sessions'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((session) => (
                    <div 
                      key={session.id}
                      className="p-1.5 rounded bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                    >
                      <p className="text-[10px] font-bold truncate leading-tight">{session.artistName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase truncate">{session.startTime}</span>
                      </div>
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <p className="text-[9px] font-mono text-zinc-600 text-center pt-1">
                      + {daySessions.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
