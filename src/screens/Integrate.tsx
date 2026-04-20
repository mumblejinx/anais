import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  GitMerge, 
  Link2, 
  RefreshCcw, 
  Database, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  Zap,
  TrendingUp,
  Brain,
  Cpu,
  History,
  CloudLightning,
  AlertCircle
} from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, query, orderBy, limit, onSnapshot, getDocs } from '../lib/firebase';
import { purgeSimulationData } from '../lib/simulation';
import { toast } from 'sonner';

// Custom Lightweight SVG Chart Component
function TrajectoryChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const width = 1000;
  const height = 400;
  const padding = 20;

  const pointsResonance = data.map((d, i) => ({
    x: (data.length > 1 ? (i / (data.length - 1)) : 0.5) * (width - 2 * padding) + padding,
    y: (1 - (d.resonance ?? 50) / 100) * (height - 2 * padding) + padding
  }));

  const pointsStoic = data.map((d, i) => ({
    x: (data.length > 1 ? (i / (data.length - 1)) : 0.5) * (width - 2 * padding) + padding,
    y: (1 - (d.stoic ?? 50) / 100) * (height - 2 * padding) + padding
  }));

  const resonancePath = `M ${pointsResonance.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const stoicPath = `M ${pointsStoic.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const resonanceArea = `${resonancePath} L ${pointsResonance[pointsResonance.length-1].x},${height-padding} L ${pointsResonance[0].x},${height-padding} Z`;
  const stoicArea = `${stoicPath} L ${pointsStoic[pointsStoic.length-1].x},${height-padding} L ${pointsStoic[0].x},${height-padding} Z`;

  return (
    <div className="w-full h-[400px] relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grids */}
        {[0, 25, 50, 75, 100].map(val => (
          <line 
            key={val} 
            x1={padding} 
            y1={(1 - val / 100) * (height - 2 * padding) + padding} 
            x2={width - padding} 
            y2={(1 - val / 100) * (height - 2 * padding) + padding} 
            stroke="rgba(var(--outline-variant), 0.1)" 
            strokeWidth="1"
          />
        ))}

        {/* Areas */}
        <path d={resonanceArea} fill="var(--primary)" fillOpacity="0.05" />
        <path d={stoicArea} fill="var(--secondary)" fillOpacity="0.05" />

        {/* Lines */}
        <path d={resonancePath} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={stoicPath} fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* Hover points (optional simplified) */}
        {data.length < 50 && data.map((d, i) => (
          <circle key={i} cx={pointsResonance[i].x} cy={pointsResonance[i].y} r="3" fill="var(--primary)" />
        ))}
      </svg>
      
      {/* Simple Y Axis Labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] font-mono opacity-40 py-4">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>
    </div>
  );
}

export default function Integrate() {
  const { user, profile } = useFirebase();
  const [isPurging, setIsPurging] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState("");
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [dataStats, setDataStats] = useState({
    memories: 0,
    expeditions: 0,
    anchors: 0,
    artifacts: 0,
    totalPoints: 0
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'trajectory_history'), 
      orderBy('createdAt', 'asc'),
      limit(1000)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          date: d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : '...',
          resonance: d.soulResonance ?? 50,
          stoic: d.stoicEquilibrium ?? 50,
          poetic: d.poeticResonance ?? 50
        };
      });
      setHistoricalData(data);
    });

    const fetchStats = async () => {
      const collections = ['memories', 'expedition_logs', 'spatial_anchors', 'artifacts', 'trajectory_history'];
      const stats: any = {};
      
      for(const coll of collections) {
          const snap = await getDocs(collection(db, 'users', user.uid, coll));
          stats[coll] = snap.size;
      }

      setDataStats({
        memories: stats.memories,
        expeditions: stats.expedition_logs,
        anchors: stats.spatial_anchors,
        artifacts: stats.artifacts,
        totalPoints: stats.trajectory_history
      });
    };

    fetchStats();
    return () => unsubscribe();
  }, [user]);

  const handlePurge = async () => {
    if (!user || isPurging) return;
    
    const confirmed = window.confirm("CRITICAL: This will PERMANENTLY DELETE all simulated historical data. Authentic real-time data will be architectural foundation moving forward. Proceed?");
    if (!confirmed) return;

    try {
      setIsPurging(true);
      toast.info("Initiating Neural Purge: Scrubbing Synthetic Fragments...");
      
      await purgeSimulationData(user.uid, (msg) => {
        setPurgeStatus(msg);
      });

      toast.success("Neural Sanctuary Restored: Operational with Real Data Only.");
    } catch (error) {
      console.error("Purge failed:", error);
      toast.error("Cleanup Error: Matrix Corruption Detected.");
    } finally {
      setIsPurging(false);
      setPurgeStatus("");
    }
  };

  const handleFutureSync = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Linking Distributed Nodes for Future Migration...',
        success: 'Sync Protocol Primed: Neural Bridges set to AUTO_MIGRATE.',
        error: 'Sync Failed: Node Timeout.'
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-10 pb-32"
    >
      <header className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <h2 className="text-6xl font-bold uppercase tracking-tighter text-on-surface">Neural_Integrate // Migration</h2>
            <p className="text-[10px] font-mono tracking-[0.5em] text-primary uppercase">Distributed_Flow_Protocol // v2.0.1</p>
          </div>
          <div className="flex gap-4">
             {dataStats.totalPoints > 0 && (
               <button 
                  onClick={handlePurge}
                  disabled={isPurging}
                  className={`px-6 py-4 flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] transition-all border border-error/50 hover:bg-error/10 ${
                  isPurging ? 'opacity-50 cursor-not-allowed' : 'text-error'
                  }`}
               >
                  {isPurging ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  {isPurging ? purgeStatus : 'PURGE_SYSTEM_HISTORY'}
               </button>
             )}
            <button 
                onClick={handleFutureSync}
                className="px-8 py-4 flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 bg-primary text-on-primary hover:brightness-110"
            >
                <GitMerge className="w-4 h-4" />
                INITIATE_FUTURE_SYNC
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Port Configuration */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 border-t-8 border-primary">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <CloudLightning className="w-4 h-4" /> Incoming_Ports
            </h3>
            <div className="space-y-6">
              <PortItem label="Real_Time_Intake" status="ACTIVE" ok />
              <PortItem label="Subconscious_Flow" status="SYNCHRONIZED" ok />
              <PortItem label="Future_Dilation" status="STANDBY" ok={false} />
              <div className="pt-4 border-t border-outline-variant">
                <p className="text-[10px] opacity-60 leading-relaxed italic">
                  "Anaïs is now calibrated to exclusively filter authentic visceral impacts. All neural migration must pass through valid bio-nodes."
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 border-t-8 border-secondary">
             <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
              <History className="w-4 h-4" /> Current_Inventory
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <StatBox label="Real_Memories" val={dataStats.memories} />
               <StatBox label="Real_Expeditions" val={dataStats.expeditions} />
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <div className="flex justify-between items-center text-error">
                <span className="text-[10px] font-bold uppercase">Synthetic_Load</span>
                <span className="text-xl font-bold font-mono">{dataStats.totalPoints > 0 ? dataStats.totalPoints : "0"} UNIT</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Real Trajectory */}
        <main className="lg:col-span-8 space-y-8">
           <div className="glass-panel p-8 border-t-8 border-tertiary shadow-xl min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-tertiary" />
                    <div>
                      <h4 className="text-xl font-bold uppercase tracking-tighter">Authentic_Trajectory</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">Real-Time Behavioral Fidelity Analysis</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <LegendItem color="var(--primary)" label="Soul_Resonance" />
                    <LegendItem color="var(--secondary)" label="Stoic_Equilibrium" />
                 </div>
              </div>

              <div className="flex-grow">
                 {historicalData.length > 0 ? (
                    <TrajectoryChart data={historicalData} />
                 ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant">
                        <Activity className="w-12 h-12 text-outline-variant mb-4 animate-pulse" />
                        <p className="text-xs uppercase tracking-widest opacity-40 font-mono">Awaiting_Neural_Sync // No_Real_Data_Detected</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 border-l-8 border-primary group hover:bg-primary/5 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <Link2 className="w-6 h-6 text-primary" />
                    <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10">BRIDGE_READY</span>
                 </div>
                 <h5 className="text-sm font-bold uppercase tracking-widest mb-2 font-headline">Distributed_Nodes</h5>
                 <p className="text-xs opacity-60 leading-relaxed">
                    Migrate future data from legacy journals, external streams, and bio-sensors. Anaïs will re-process these as real-time events.
                 </p>
              </div>
              <div className="glass-panel p-8 border-l-8 border-secondary group hover:bg-secondary/5 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                    <Cpu className="w-6 h-6 text-secondary" />
                    <span className="text-[10px] font-bold text-secondary px-2 py-1 bg-secondary/10">MIGRATION_STANDBY</span>
                 </div>
                 <h5 className="text-sm font-bold uppercase tracking-widest mb-2 font-headline">Future_Mapping</h5>
                 <p className="text-xs opacity-60 leading-relaxed">
                    Set up neural bridges to automatically pull future artifacts directly into the Archive as they manifest in the external world.
                 </p>
              </div>
           </div>
        </main>
      </div>
    </motion.div>
  );
}

function PortItem({ label, status, ok }: { label: string, status: string, ok: boolean }) {
  return (
    <div className="flex justify-between items-center group">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-1 rounded-full ${ok ? 'bg-primary' : 'bg-outline-variant'} animate-pulse`} />
        <span className="text-[11px] uppercase tracking-wider text-on-surface/60 font-mono italic">{label}</span>
      </div>
      <span className={`text-[10px] uppercase font-bold font-mono ${ok ? 'text-primary' : 'opacity-30'}`}>{status}</span>
    </div>
  );
}

function StatBox({ label, val }: { label: string, val: number }) {
  return (
    <div className="p-4 bg-surface-container-low border border-outline-variant text-center transition-all hover:border-primary">
      <span className="block text-[10px] opacity-30 uppercase mb-1">{label}</span>
      <span className="text-lg font-bold font-mono text-on-surface">{val}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 translate-y-[1px]" style={{ backgroundColor: color }}></div>
      <span className="text-[10px] font-bold uppercase opacity-40">{label}</span>
    </div>
  );
}
