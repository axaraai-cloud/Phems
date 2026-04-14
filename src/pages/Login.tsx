import { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Music, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

import { toast } from 'sonner';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome to EMS');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(`Login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-[#151619] border-[#2a2b2e] text-white shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
              <Music className="w-8 h-8 text-black" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tighter">ELITE MUSIC STUDIO</CardTitle>
              <CardDescription className="text-zinc-400">
                Professional Management for Modern Creators
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <Button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-lg font-semibold gap-3"
              >
                <LogIn className="w-5 h-5" />
                {loading ? 'Connecting...' : 'Sign in with Google'}
              </Button>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
                Secure Enterprise Access
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">Production Environment // Live Mode</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
