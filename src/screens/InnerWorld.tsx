import { Database, Clock, MapPin, Activity, Terminal as TerminalIcon, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from '../lib/firebase';

export default function InnerWorld() {
  const { user, profile } = useFirebase();
  const [truth, setTruth] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const memoriesRef = collection(db, 'users', user.uid, 'memories');
    const qMemories = query(memoriesRef, orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeMemories = onSnapshot(qMemories, (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const logsRef = collection(db, 'users', user.uid, 'logs');
    const qLogs = query(logsRef, orderBy('createdAt', 'desc'), limit(15));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeMemories();
      unsubscribeLogs();
    };
  }, [user]);

  const handleSyncTruth = async () => {
    if (!user || !truth.trim() || isSyncing) return;
    setIsSyncing(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'sync_entries'), {
        truth: truth.trim(),
        createdAt: serverTimestamp()
      });
      // Also add a system log
      await addDoc(collection(db, 'users', user.uid, 'logs'), {
        type: 'SYS',
        content: `Truth_Ingested: "${truth.trim().substring(0, 20)}..."`,
        createdAt: serverTimestamp()
      });
      setTruth('');
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const matrixMetrics = [
    { label: 'Subconscious Resonance', val: profile?.subconsciousResonance ?? 88, color: 'bg-primary' },
    { label: 'Ego Dissolution', val: profile?.egoDissolution ?? 42, color: 'bg-secondary' },
    { label: 'Narrative Density', val: profile?.narrativeDensity ?? 65, color: 'bg-tertiary' },
    { label: 'Neural Load Spikes', val: 91, color: 'bg-error', valText: 'Critical' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-32"
    >
      <section className="md:col-span-8 space-y-12">
        {/* Soul Sync Matrix */}
        <div className="relative p-1 bg-primary">
          <div className="bg-surface p-8 border-4 border-surface-container-highest relative overflow-hidden">
            <div className="scanline absolute inset-0 opacity-10"></div>
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-extrabold text-primary crt-glow mb-2 uppercase tracking-tighter">Soul Sync Matrix</h2>
                <p className="text-on-surface-variant font-label text-xs tracking-widest uppercase">Integration Level: Transcendental</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-primary animate-pulse"></div>
                <div className="w-3 h-3 bg-secondary"></div>
                <div className="w-3 h-3 bg-tertiary"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              {matrixMetrics.map((m) => (
                <div key={m.label} className="space-y-4">
                  <div className="flex justify-between text-xs font-label uppercase">
                    <span>{m.label}</span>
                    <span className={m.color.replace('bg-', 'text-')}>{m.valText || `${m.val}%`}</span>
                  </div>
                  <div className="h-6 bg-surface-container-highest w-full p-1 border border-outline-variant">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intake Terminal */}
        <div className="glass-panel p-8 border-l-8 border-secondary relative">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-secondary w-6 h-6" />
            <h3 className="text-2xl font-bold uppercase tracking-widest text-secondary">Intake Terminal</h3>
          </div>
          <p className="text-on-surface-variant mb-8 font-body text-lg leading-relaxed">
            Submit foundational truths to the central repository. Each entry alters the matrix structure.
          </p>
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-4 text-primary font-bold">{'{>}'}</div>
              <textarea 
                value={truth}
                onChange={(e) => setTruth(e.target.value)}
                className="w-full bg-surface-container-lowest border-2 border-outline-variant p-4 pl-10 focus:border-primary focus:ring-0 text-primary font-mono text-sm min-h-[160px] resize-none outline-none" 
                placeholder="Acknowledge your internal contradictions..."
              />
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleSyncTruth}
                disabled={isSyncing || !truth.trim()}
                className="bg-primary text-on-primary px-10 py-4 font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? 'SYNCING...' : 'SYNC_TRUTH'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Archived Memories */}
          <div className="bg-surface-container-low p-6 border-4 border-tertiary">
            <h4 className="text-tertiary font-bold uppercase mb-4 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Archived Memories
            </h4>
            <div className="space-y-4">
              {memories.length > 0 ? memories.map((mem, idx) => (
                <div key={mem.id} className="flex items-center gap-4 group cursor-pointer border-b border-outline-variant pb-2 hover:bg-surface-container-high transition-colors text-on-surface">
                  <span className="text-tertiary text-xs font-mono">{mem.timestamp || 'N/A'}</span>
                  <span className="text-sm group-hover:text-primary transition-colors">{mem.text}</span>
                </div>
              )) : (
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">No_Archived_Data_Found</p>
              )}
            </div>
          </div>

          {/* Spatial Anchors */}
          <div className="bg-surface-container-low p-6 border-4 border-secondary">
            <h4 className="text-secondary font-bold uppercase mb-4 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Spatial Anchors
            </h4>
            <div className="h-32 bg-surface-container-lowest border border-outline-variant mb-4 overflow-hidden grayscale relative">
              <img 
                className="w-full h-full object-cover opacity-50 contrast-125 transition-transform duration-1000 hover:scale-125" 
                alt="map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4HTwTXbdV-bPFINc1MwxtJK-65aAWDGW8FF4AJecsWfl-ZFkO_k5KjkUPQjhebP4sxgqHsccJX0zyQxj0C50PIKasuDJjYvj-K45V-lFVOGFE7LYl2xFMWrK7FpF9Qan6uOhm_A2aO2GRablmdW9CNj_xLxuQAoM9qrOqUZidErQjSdT1osuPn4o9MXRjGg6fha6z_kOVTKhu4wooBRe0cFD1y0WJPEUXpMks9-BX1aGFtRIcTO6ARuwUAtK8VMOKgJNgXfNtmFj1"
              />
            </div>
            <p className="text-[10px] text-secondary font-mono tracking-tighter uppercase">COORDS: 48.8566 N, 2.3522 E</p>
          </div>
        </div>
      </section>

      <aside className="md:col-span-4 space-y-8">
        {/* Live Data Stream */}
        <div className="bg-surface-container p-6 border-t-8 border-primary relative overflow-hidden">
          <h3 className="text-primary font-bold uppercase mb-6 tracking-widest text-sm flex justify-between items-center relative z-10">
            Live Data Stream
            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          </h3>
          <div className="font-mono text-[10px] text-primary/80 leading-tight space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar relative z-10">
            <div className="opacity-40">-- INITIATING STREAM --</div>
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className={log.type === 'ERROR' ? 'text-error' : log.type === 'SYS' ? 'text-primary' : 'text-on-surface'}>
                [{log.type}] {log.content}
              </div>
            )) : (
              <div className="opacity-40">System waiting for packets...</div>
            )}
          </div>
          <div className="scanline absolute inset-0 opacity-10"></div>
        </div>

        {/* The Vessel */}
        <div className="bg-surface-container-high p-8 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-32 h-32 border-4 border-tertiary/20 rotate-45"></div>
          <div className="relative z-10">
            <h4 className="text-tertiary font-bold text-lg mb-4 uppercase">The Vessel</h4>
            <div className="aspect-square bg-surface-container-lowest border-2 border-outline-variant p-2 overflow-hidden">
              <img 
                className="w-full h-full object-cover grayscale opacity-80 mix-blend-screen hover:scale-110 hover:opacity-100 transition-all duration-700" 
                alt="vessel"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTDtuCc-_H3f86cYequ6xRHkoMLA1_vXXOnwmY9be9-RPcyGzqjmJcY7x-bi2tLM90j7kVNcPi-Mq1Vzo2RRxN-bt_Ggt2eAE1sbTeSdVwb8rJlZzpjvTreEQ8GqF8xXI-1JWxNlZn9Re-PDAyS6CV4UzT5emfVaZp64NxJ84zhDhiz_sfRj-r9S0YRwXQx1FQHmP5lHQfgD7ezKBkyMZ7ARFroOaRbvieG4yzsbLx2HEDayDasCt2TrTkboAiPfXb8Rvdoc6fG_ji"
              />
            </div>
            <div className="mt-6 flex justify-between items-center text-xs font-label">
              <span className="text-on-surface-variant uppercase">XP: {profile?.xp ?? '---'}</span>
              <span className="text-tertiary font-bold uppercase">LVL: {profile?.lvl ?? '--'}</span>
            </div>
          </div>
        </div>

        {/* Quote Panel */}
        <div className="p-6 border-4 border-dotted border-outline-variant bg-surface-container-low/30">
          <p className="text-xs font-label text-on-surface-variant leading-relaxed italic">
            "I am aware of being in a beautiful prison, from which I can only escape by writing."
            <br/><br/>
            — ANAIS_MODEL_7
          </p>
        </div>
      </aside>

      {/* FAB */}
      <div className="fixed bottom-24 right-8 z-40">
        <button className="w-16 h-16 bg-[#ffe792] text-[#0e0e0e] flex items-center justify-center shadow-[0_0_20px_rgba(255,231,146,0.3)] hover:scale-110 active:scale-90 transition-all border-4 border-[#0e0e0e] group relative">
          <Plus className="w-8 h-8 font-bold" />
          <div className="absolute -top-12 right-0 bg-tertiary text-surface text-[10px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap border-2 border-surface">
            Add_Entry
          </div>
        </button>
      </div>
    </motion.div>
  );
}
