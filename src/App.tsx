/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import TheOracle from './screens/TheOracle';
import InnerWorld from './screens/InnerWorld';
import TheSeeker from './screens/TheSeeker';
import TheSanctuary from './screens/TheSanctuary';
import TheCompass from './screens/TheCompass';
import Integrate from './screens/Integrate';
import { useFirebase } from './components/FirebaseProvider';
import { LoginScreen, AccessDeniedScreen } from './components/AuthScreens';
import { Terminal } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App() {
  const { user, profile, loading, isAuthorized } = useFirebase();
  const [currentTab, setCurrentTab] = useState('oracle');

  const renderScreen = () => {
    switch (currentTab) {
      case 'oracle':
        return <TheOracle key="oracle" />;
      case 'inner':
        return <InnerWorld key="inner" />;
      case 'seeker':
        return <TheSeeker key="seeker" />;
      case 'sanctuary':
        return <TheSanctuary key="sanctuary" />;
      case 'compass':
        return <TheCompass key="compass" setTab={setCurrentTab} />;
      case 'integrate':
        return <Integrate key="test" />;
      default:
        return <TheOracle key="oracle" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Terminal className="w-12 h-12 text-primary animate-pulse mb-4" />
        <p className="text-primary font-mono text-sm tracking-widest uppercase">Initializing_System_Matrix...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!isAuthorized) {
    return <AccessDeniedScreen user={user} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary selection:text-white">
      <TopBar />
      
      <main className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      <BottomNav currentTab={currentTab} setTab={setCurrentTab} />
      
      {/* Global CRT Scanline Effect */}
      <div className="fixed inset-0 scanline z-[100] opacity-10 hidden md:block" />
      
      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface-container-low)',
            border: '2px solid var(--color-primary)',
            color: 'var(--color-on-surface)',
            borderRadius: '0px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }
        }}
      />
    </div>
  );
}

