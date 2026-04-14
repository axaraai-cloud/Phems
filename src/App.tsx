import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Toaster } from './components/ui/sonner';

// Pages
import Dashboard from './pages/Dashboard';
import FileVault from './pages/FileVault';
import Releases from './pages/Releases';
import Sessions from './pages/Sessions';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import AIManager from './pages/AIManager';
import Artists from './pages/Artists';
import Financials from './pages/Financials';
import Settings from './pages/Settings';
import Pipeline from './pages/Pipeline';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import StudioCalendar from './pages/StudioCalendar';
import Login from './pages/Login';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Ensure user exists in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'artist' // Default role
          };
          await setDoc(userDocRef, newUser);
          setUserRole('artist');
        } else {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#151619] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route element={user ? <Layout user={user} role={userRole} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard role={userRole} />} />
          <Route path="/files" element={<FileVault />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/ai" element={<AIManager />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/calendar" element={<StudioCalendar />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
