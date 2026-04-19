import { BrainCircuit, Database, Compass, Shield } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function BottomNav({ currentTab, setTab }: BottomNavProps) {
  const tabs = [
    { id: 'oracle', label: 'THE ORACLE', icon: BrainCircuit, color: '#c97cff' },
    { id: 'inner', label: 'INNER WORLD', icon: Database, color: '#c97cff' },
    { id: 'seeker', label: 'THE SEEKER', icon: Compass, color: '#c97cff' },
    { id: 'sanctuary', label: 'THE SANCTUARY', icon: Shield, color: '#c97cff' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-stretch h-20 bg-[#0e0e0e] border-t-4 border-secondary shadow-[0_-10px_30px_rgba(201,124,255,0.1)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex flex-col items-center justify-center p-2 h-full w-full transition-all duration-75 active:scale-95 ${
              isActive 
                ? 'bg-secondary text-surface' 
                : 'text-secondary hover:bg-secondary/20 hover:text-tertiary'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="font-headline font-bold text-[10px] uppercase tracking-tighter mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
