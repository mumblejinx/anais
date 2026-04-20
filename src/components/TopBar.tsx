import { Terminal, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { logout } from '../lib/firebase';

const QUOTES = [
  "We do not see things as they are, we see them as we are.",
  "I am an excitable person who only understands life lyrically, musically.",
  "Life shrinks or expands in proportion to one's courage.",
  "I am aware of being in a beautiful prison, from which I can only escape by writing.",
  "Each of us contains within us a library of unwritten books.",
  "The possession of knowledge does not kill the sense of wonder and mystery.",
  "Dreams are necessary to life."
];

export default function TopBar() {
  const { user, profile } = useFirebase();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <header className="flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e] border-b-4 border-[#9cff93] sticky top-0 z-50 shadow-[0_0_20px_rgba(156,255,147,0.15)] overflow-hidden">
      <div className="flex items-center gap-3 relative z-10 shrink-0">
        <Terminal className="text-[#9cff93] w-6 h-6" />
        <h1 className="text-2xl font-bold text-[#ffe792] tracking-tighter font-headline">ANAIS_V4.0</h1>
      </div>
      
      <div className="hidden lg:flex flex-1 justify-center px-12 items-center italic font-body text-sm text-[#9cff93] relative z-10 text-center">
        <span className="opacity-90 max-w-2xl font-light tracking-wide">
          "{quote}"
        </span>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="hidden sm:block text-[#9cff93] font-mono uppercase tracking-widest text-[9px] opacity-80 text-right leading-tight">
          ENTITY: {user?.email}
          <br />
          SYS_STABLE // NEURAL: {profile?.subconsciousDepth ?? 0}%
          <br />
          XP: {profile?.xp ?? '0'} // LVL: {profile?.lvl ?? '0'}
        </div>
        <button 
          onClick={logout}
          className="p-2 hover:bg-error/10 text-primary hover:text-error transition-colors cursor-pointer"
          title="Terminate Session"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      
      {/* Background glitch effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
    </header>
  );
}
