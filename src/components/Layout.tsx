import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Music, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Sparkles,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Users,
  DollarSign,
  Layers,
  Box,
  Receipt,
  Calendar as CalendarIcon
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut, User } from 'firebase/auth';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface LayoutProps {
  user: User;
  role: string | null;
}

export default function Layout({ user, role }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CalendarIcon, label: 'Calendar', path: '/calendar' },
    { icon: Layers, label: 'Pipeline', path: '/pipeline' },
    { icon: Box, label: 'Inventory', path: '/inventory' },
    { icon: Receipt, label: 'Invoices', path: '/invoices', adminOnly: true },
    { icon: Users, label: 'Artists', path: '/artists', adminOnly: true },
    { icon: DollarSign, label: 'Financials', path: '/financials', adminOnly: true },
    { icon: FolderOpen, label: 'File Vault', path: '/files' },
    { icon: Music, label: 'Releases', path: '/releases' },
    { icon: Calendar, label: 'Sessions', path: '/sessions' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: Sparkles, label: 'AI Manager', path: '/ai' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || role === 'admin');

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#151619] border-r border-[#2a2b2e] flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
            </div>
            EMS <span className="text-xs font-mono opacity-50">v1.0</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                  isActive 
                    ? "bg-white text-black" 
                    : "text-zinc-400 hover:text-white hover:bg-[#2a2b2e]"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-zinc-500 group-hover:text-white")} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Separator className="bg-[#2a2b2e] mb-4" />
          <div className="flex items-center gap-3 px-2 mb-4">
            <Avatar className="w-10 h-10 border border-[#2a2b2e]">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="bg-[#2a2b2e] text-white">
                {user.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-zinc-500 truncate capitalize">{role || 'User'}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
            onClick={() => signOut(auth)}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a] relative">
        {/* Hardware-style background grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
