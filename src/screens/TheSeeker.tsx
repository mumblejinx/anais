import { Users, Brain, Heart, MapPin, Activity, ShieldAlert, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from '../lib/firebase';
import { toast } from 'sonner';

export default function TheSeeker() {
  const { user, profile, rewardXP } = useFirebase();
  const [placeName, setPlaceName] = useState('');
  const [placeImpact, setPlaceImpact] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityResonance, setActivityResonance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTest, setActiveTest] = useState<'none' | 'resonance'>('none');
  const [testStage, setTestStage] = useState(0);

  const [anchors, setAnchors] = useState<any[]>([]);
  const [expeditions, setExpeditions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsAnchors = onSnapshot(query(collection(db, 'users', user.uid, 'spatial_anchors'), orderBy('createdAt', 'desc'), limit(10)), (snap) => {
      setAnchors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsExpeditions = onSnapshot(query(collection(db, 'users', user.uid, 'expedition_logs'), orderBy('createdAt', 'desc'), limit(10)), (snap) => {
      setExpeditions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsAnchors(); unsExpeditions(); };
  }, [user]);

  const handleAddAnchor = async () => {
    if (!user || !placeName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'spatial_anchors'), {
        name: placeName.trim(),
        impact: placeImpact.trim(),
        createdAt: serverTimestamp()
      });
      await rewardXP(100, 50);
      setPlaceName(''); setPlaceImpact('');
      toast.success("ANCHOR_LOCKED");
    } catch (err) {
      toast.error("MAPPING_FAILED");
    } finally { setIsSubmitting(false); }
  };

  const handleAddExpedition = async () => {
    if (!user || !activityName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'expedition_logs'), {
        activity: activityName.trim(),
        resonance: activityResonance.trim(),
        createdAt: serverTimestamp()
      });
      await rewardXP(120, 60);
      setActivityName(''); setActivityResonance('');
      toast.success("EXPEDITION_SYNCED");
    } catch (err) {
      toast.error("SYNC_FAILED");
    } finally { setIsSubmitting(false); }
  };

  const runResonanceTest = async () => {
    if (testStage < 2) {
      setTestStage(prev => prev + 1);
    } else {
      await rewardXP(200, 100);
      toast.success("RESONANCE_CALIBRATED: +200 XP");
      setActiveTest('none');
      setTestStage(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-12 pb-32"
    >
      <header className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
         <div className="md:col-span-2 space-y-4">
            <h2 className="text-7xl font-bold uppercase tracking-tighter text-on-surface">The Seeker</h2>
            <p className="text-sm font-mono tracking-widest text-primary uppercase">Trajectory_Analysis // Level_{profile?.soulResonance || 0}</p>
         </div>
         <div className="glass-panel p-6 border-l-8 border-secondary flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-bold uppercase opacity-40 mb-2">Soul_Resonance</span>
            {activeTest === 'resonance' ? (
              <div className="space-y-4">
                 <p className="text-xs italic">Stage {testStage + 1}: {testStage === 0 ? "Are you acting or reacting?" : testStage === 1 ? "Is the path clear?" : "Are you one with the journey?"}</p>
                 <button 
                  onClick={runResonanceTest}
                  className="px-4 py-2 bg-secondary text-on-secondary text-[10px] font-bold uppercase shadow-lg active:scale-95 transition-all"
                 >
                   {testStage === 2 ? "Finalize" : "Proceed"}
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTest('resonance')}
                className="text-4xl font-bold text-secondary hover:scale-110 transition-transform active:scale-95 group"
              >
                {profile?.soulResonance || '--'}
                <span className="block text-[10px] mt-1 underline opacity-60 group-hover:opacity-100">Run_Scan</span>
              </button>
            )}
         </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-8">
           <div className="glass-panel p-8 border-t-8 border-primary shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Spatial_Anchors
              </h3>
              <div className="space-y-4">
                <input 
                  value={placeName} 
                  onChange={e => setPlaceName(e.target.value)} 
                  placeholder="Identify_Location" 
                  className="w-full bg-surface-container-low p-4 text-xs font-mono outline-none border border-outline-variant focus:border-primary transition-colors"
                />
                <textarea 
                  value={placeImpact} 
                  onChange={e => setPlaceImpact(e.target.value)} 
                  placeholder="Visceral_Effect..." 
                  className="w-full bg-surface-container-low p-4 text-xs font-mono outline-none border border-outline-variant focus:border-primary h-32 transition-colors"
                />
                <button 
                  onClick={handleAddAnchor}
                  disabled={isSubmitting || !placeName.trim()}
                  className="w-full py-4 bg-primary text-on-primary font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-30"
                >
                  Confirm_Link
                </button>
              </div>
           </div>

           <div className="glass-panel p-8 border-t-8 border-secondary shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Expedition_Logs
              </h3>
              <div className="space-y-4">
                <input 
                  value={activityName} 
                  onChange={e => setActivityName(e.target.value)} 
                  placeholder="Identify_Action" 
                  className="w-full bg-surface-container-low p-4 text-xs font-mono outline-none border border-outline-variant focus:border-secondary transition-colors"
                />
                <textarea 
                  value={activityResonance} 
                  onChange={e => setActivityResonance(e.target.value)} 
                  placeholder="Neural_Load_Shift..." 
                  className="w-full bg-surface-container-low p-4 text-xs font-mono outline-none border border-outline-variant focus:border-secondary h-32 transition-colors"
                />
                <button 
                  onClick={handleAddExpedition}
                  disabled={isSubmitting || !activityName.trim()}
                  className="w-full py-4 bg-secondary text-on-secondary font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-30"
                >
                  Log_Resonance
                </button>
              </div>
           </div>
        </aside>

        <main className="lg:col-span-8 space-y-12">
           <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                <h4 className="text-2xl font-bold uppercase tracking-tighter text-on-surface">Neural_Mapping</h4>
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{anchors.length} Anchors</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {anchors.map(anchor => (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={anchor.id} 
                    className="p-6 bg-surface-container-highest border-l-4 border-primary hover:bg-surface-container-low transition-colors"
                   >
                      <span className="text-[10px] font-bold text-primary uppercase block mb-1">Anchor_{anchor.id.slice(0,4)}</span>
                      <h5 className="font-bold mb-2 uppercase">{anchor.name}</h5>
                      <p className="text-xs opacity-60 italic leading-relaxed">"{anchor.impact}"</p>
                   </motion.div>
                 ))}
                 {anchors.length === 0 && (
                   <div className="col-span-2 py-10 opacity-30 text-xs italic uppercase tracking-widest text-center">Awaiting_Spatial_Coordinates...</div>
                 )}
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                <h4 className="text-2xl font-bold uppercase tracking-tighter text-on-surface">Expedition_History</h4>
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{expeditions.length} Logs</span>
              </div>
              <div className="space-y-4">
                 {expeditions.map(exp => (
                   <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={exp.id} 
                    className="p-6 bg-surface-container-low border border-outline-variant flex justify-between items-center group"
                   >
                      <div>
                        <h5 className="font-bold text-secondary uppercase text-sm mb-1">{exp.activity}</h5>
                        <p className="text-[10px] opacity-40">Load: {exp.resonance}</p>
                      </div>
                      <div className="w-12 h-1 bg-secondary/20 group-hover:w-24 transition-all duration-500"></div>
                   </motion.div>
                 ))}
                 {expeditions.length === 0 && (
                   <div className="py-10 opacity-30 text-xs italic uppercase tracking-widest text-center">Journey_Buffer_Empty...</div>
                 )}
              </div>
           </div>

           <div className="glass-panel p-10 border-2 border-dashed border-tertiary/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Brain className="w-32 h-32 text-tertiary" />
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                 <div className="p-4 bg-tertiary/20 text-tertiary rounded-full">
                    <Sparkles className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                    <h5 className="text-xl font-bold uppercase tracking-widest text-tertiary">Analytical_Sync</h5>
                    <p className="text-xs opacity-60 leading-relaxed max-w-lg italic">
                      "Every movement through the physical world is a mirror of an internal shift. By mapping these waypoints, Anaïs calculates the most resonant path forward."
                    </p>
                 </div>
              </div>
           </div>
        </main>
      </section>
    </motion.div>
  );
}
