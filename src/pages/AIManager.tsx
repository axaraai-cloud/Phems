import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Music, 
  Mic2, 
  Wand2,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { getGeminiResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AIManager() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your EMS AI Manager. I can help you with track ideas, lyric analysis, production advice, or managing your studio workflow. What's on your mind today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await getGeminiResponse(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error while processing your request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { icon: Music, label: "Generate track names for a dark techno EP" },
    { icon: Mic2, label: "Give me production tips for vocal clarity" },
    { icon: Wand2, label: "Help me write a bridge for a pop ballad" },
    { icon: BrainCircuit, label: "Analyze my studio workflow for efficiency" }
  ];

  const [botData, setBotData] = useState<{ status: string; lastCheck: string; logs: string[] }>({
    status: 'Initializing...',
    lastCheck: '',
    logs: []
  });

  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        const res = await fetch('/api/bot/status');
        const data = await res.json();
        setBotData(data);
      } catch (error) {
        console.error('Failed to fetch bot status');
      }
    };

    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerBot = async () => {
    try {
      await fetch('/api/bot/trigger', { method: 'POST' });
      toast.success('Autonomous Bot triggered');
    } catch (error) {
      toast.error('Failed to trigger bot');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-white" />
            AI Manager & Autonomous Systems
          </h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">INTELLIGENT STUDIO ASSISTANT // CORE_AI_01</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", botData.status.includes('Running') ? "bg-green-500" : "bg-blue-500")} />
            <span className="text-[10px] font-mono uppercase tracking-widest">{botData.status}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Gemini 1.5 Flash Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Bot Logs Sidebar */}
        <div className="w-80 flex flex-col gap-4 hidden lg:flex">
          <Card className="flex-1 bg-[#151619] border-[#2a2b2e] text-white flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b border-[#2a2b2e] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-zinc-500">Bot Activity Logs</CardTitle>
                <p className="text-[10px] text-zinc-600 mt-1">Autonomous Maintenance</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500" onClick={triggerBot}>
                <Zap className="w-4 h-4" />
              </Button>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {botData.logs.map((log, i) => (
                  <div key={i} className="text-[10px] font-mono text-zinc-400 border-l border-white/10 pl-3 py-1">
                    {log}
                  </div>
                ))}
                {botData.logs.length === 0 && (
                  <p className="text-[10px] font-mono text-zinc-600 italic">No logs recorded yet...</p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 bg-[#151619] border-[#2a2b2e] text-white flex flex-col overflow-hidden hardware-glow">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      msg.role === 'ai' ? "bg-white text-black" : "bg-[#2a2b2e] text-zinc-400"
                    )}>
                      {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'ai' 
                        ? "bg-[#2a2b2e] text-zinc-100 rounded-tl-none" 
                        : "bg-white text-black rounded-tr-none font-medium"
                    )}>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0"></div>
                  <div className="h-10 w-32 bg-white/10 rounded-2xl rounded-tl-none"></div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-[#2a2b2e] bg-[#1a1b1e]">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI Manager anything..." 
                className="bg-[#0a0a0a] border-[#2a2b2e] focus:ring-1 focus:ring-white h-12"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-white text-black hover:bg-zinc-200 h-12 px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Sidebar Suggestions */}
        <div className="w-72 space-y-4 hidden xl:block">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2">Quick Actions</p>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s.label)}
              className="w-full text-left p-4 bg-[#151619] border border-[#2a2b2e] rounded-xl hover:border-white/20 transition-all group"
            >
              <s.icon className="w-5 h-5 text-zinc-500 group-hover:text-white mb-3 transition-colors" />
              <p className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 leading-snug">
                {s.label}
              </p>
            </button>
          ))}
          
          <Card className="bg-white/5 border-dashed border-white/10 text-white mt-8">
            <CardHeader className="p-4">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-zinc-500">AI Context</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                The AI Manager has access to your studio metadata, session history, and release schedule to provide contextual assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
