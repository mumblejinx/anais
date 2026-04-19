import { Terminal, LogOut } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { logout } from '../lib/firebase';

export default function TopBar() {
  const { user, profile } = useFirebase();

  return (
    <header className="flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e] border-b-4 border-[#9cff93] sticky top-0 z-50 shadow-[0_0_20px_rgba(156,255,147,0.15)] overflow-hidden">
      <div className="flex items-center gap-3 relative z-10">
        <Terminal className="text-[#9cff93] w-6 h-6" />
        <h1 className="text-2xl font-bold text-[#ffe792] tracking-tighter font-headline">ANAIS_V4.0</h1>
      </div>
      
      <div className="hidden lg:flex items-center gap-8 font-headline uppercase tracking-widest text-xs text-[#9cff93] relative z-10">
        <span className="opacity-70">METRICS_READY</span>
        <span className="opacity-70">CORE_SYNCED</span>
        <div className="text-[#ffe792] border-b-2 border-[#ffe792]">ORACLE_ACTIVE</div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 border border-primary/20">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
          {user?.email}
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="hidden sm:block text-[#9cff93] font-mono uppercase tracking-widest text-[10px] opacity-80 text-right">
          SYS_STABLE // NEURAL: {profile?.subconsciousDepth ?? 0}%
          <br />
          XP_{profile?.xp ?? '---'} // LVL_{profile?.lvl ?? '--'}
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
