import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Hash, 
  Users, 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip,
  Mic,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
  channelId: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'), 
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'chats'), {
        text: newMessage,
        senderId: auth.currentUser?.uid,
        senderName: auth.currentUser?.displayName || 'Unknown',
        channelId: 'general',
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Channels Sidebar */}
      <Card className="w-64 bg-[#151619] border-[#2a2b2e] text-white hidden lg:flex flex-col">
        <CardHeader className="p-4 border-b border-[#2a2b2e]">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <Input 
              placeholder="Search channels..." 
              className="pl-8 h-8 bg-[#0a0a0a] border-[#2a2b2e] text-xs"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2 mb-2">Channels</p>
              {['general', 'production', 'marketing', 'studio-a'].map((ch) => (
                <Button 
                  key={ch} 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-2 h-9 text-sm font-medium",
                    ch === 'general' ? "bg-[#2a2b2e] text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Hash className="w-4 h-4 text-zinc-500" />
                  {ch}
                </Button>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2 mb-2">Direct Messages</p>
              {['Artist X', 'Producer Y', 'Manager Z'].map((user) => (
                <Button 
                  key={user} 
                  variant="ghost" 
                  className="w-full justify-start gap-2 h-9 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {user}
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 bg-[#151619] border-[#2a2b2e] text-white flex flex-col overflow-hidden">
        <CardHeader className="p-4 border-b border-[#2a2b2e] flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2a2b2e] rounded-md">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">general</CardTitle>
              <p className="text-xs text-zinc-500">Main studio communication channel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
              <Users className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === auth.currentUser?.uid;
              return (
                <div key={msg.id} className={cn(
                  "flex gap-4 group",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  <Avatar className="w-10 h-10 border border-[#2a2b2e]">
                    <AvatarFallback className="bg-[#2a2b2e] text-white uppercase">
                      {msg.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "flex flex-col max-w-[70%]",
                    isMe ? "items-end" : "items-start"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold">{msg.senderName}</span>
                      <span className="text-[10px] font-mono text-zinc-600">
                        {msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), 'HH:mm') : '...'}
                      </span>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                      isMe 
                        ? "bg-white text-black rounded-tr-none" 
                        : "bg-[#2a2b2e] text-white rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#2a2b2e]">
          <form onSubmit={handleSendMessage} className="flex gap-2 bg-[#0a0a0a] border border-[#2a2b2e] rounded-xl p-1">
            <Button type="button" variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
              <Plus className="w-5 h-5" />
            </Button>
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message #general" 
              className="flex-1 bg-transparent border-none focus:ring-0 h-10"
            />
            <div className="flex items-center gap-1 pr-1">
              <Button type="button" variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                <Smile className="w-5 h-5" />
              </Button>
              <Button type="submit" className="bg-white text-black hover:bg-zinc-200 h-8 w-8 p-0 rounded-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

// Helper for conditional classes (already in lib/utils.ts but re-declaring for safety if needed, though it's imported in App.tsx)
import { cn } from '../lib/utils';
