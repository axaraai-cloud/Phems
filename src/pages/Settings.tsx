import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Shield, 
  Bell, 
  Smartphone, 
  Globe, 
  Database,
  Bot,
  Cpu,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    studioName: 'Elite Music Studio',
    location: 'Los Angeles, CA',
    timezone: 'PST',
    autoMaintenance: true,
    aiManagerEnabled: true,
    notificationsEnabled: true,
    publicRoster: false
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'studio_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'studio_config'), config);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-mono text-zinc-500">Loading configuration...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Studio Settings</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">SYSTEM CONFIGURATION // CONFIG_01</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-zinc-200 gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* General Settings */}
        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Globe className="w-4 h-4" /> General Information
            </CardTitle>
            <CardDescription className="text-zinc-500">Basic studio identity and location settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studioName" className="text-xs font-mono uppercase text-zinc-500">Studio Name</Label>
                <Input 
                  id="studioName" 
                  value={config.studioName} 
                  onChange={(e) => setConfig({ ...config, studioName: e.target.value })}
                  className="bg-[#0a0a0a] border-[#2a2b2e] focus:ring-1 focus:ring-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-mono uppercase text-zinc-500">Location</Label>
                <Input 
                  id="location" 
                  value={config.location} 
                  onChange={(e) => setConfig({ ...config, location: e.target.value })}
                  className="bg-[#0a0a0a] border-[#2a2b2e] focus:ring-1 focus:ring-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Autonomous Systems */}
        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Autonomous Systems
            </CardTitle>
            <CardDescription className="text-zinc-500">Manage background robots and AI agents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <Label className="text-sm font-bold">Autonomous Maintenance</Label>
                </div>
                <p className="text-xs text-zinc-500">Allow background bots to optimize studio assets and scan for errors.</p>
              </div>
              <Switch 
                checked={config.autoMaintenance} 
                onCheckedChange={(checked) => setConfig({ ...config, autoMaintenance: checked })} 
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <Label className="text-sm font-bold">Gemini AI Manager</Label>
                </div>
                <p className="text-xs text-zinc-500">Enable the intelligent studio assistant for all users.</p>
              </div>
              <Switch 
                checked={config.aiManagerEnabled} 
                onCheckedChange={(checked) => setConfig({ ...config, aiManagerEnabled: checked })} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card className="bg-[#151619] border-[#2a2b2e] text-white">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Security & Privacy
            </CardTitle>
            <CardDescription className="text-zinc-500">Control data visibility and access levels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-400" />
                  <Label className="text-sm font-bold">Public Artist Roster</Label>
                </div>
                <p className="text-xs text-zinc-500">Make the artist roster visible to non-authenticated users.</p>
              </div>
              <Switch 
                checked={config.publicRoster} 
                onCheckedChange={(checked) => setConfig({ ...config, publicRoster: checked })} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
