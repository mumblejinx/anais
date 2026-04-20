import { Flower, Database, Telescope, Shield, Compass, Network } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function BottomNav({ currentTab, setTab }: BottomNavProps) {
  const tabs = [
    { id: 'oracle', label: 'ORACLE', icon: Flower, color: '#c97cff' },
    { id: 'inner', label: 'INNER', icon: Database, color: '#c97cff' },
    { id: 'seeker', label: 'SEEKER', icon: Telescope, color: '#c97cff' },
    { id: 'sanctuary', label: 'SANCTUARY', icon: Shield, color: '#c97cff' },
    { id: 'compass', label: 'COMPASS', icon: Compass, color: '#c97cff' },
    { id: 'integrate', label: 'INTEGRATE', icon: Network, color: '#ff6b6b' },
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
                ? 'bg-secondary text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' 
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
