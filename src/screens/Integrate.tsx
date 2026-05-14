import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, MapPin, Activity, Star, Link2, Wind, ShieldAlert, Zap, Users } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, onSnapshot } from '../lib/firebase';
import { toast } from 'sonner';

interface CountState {
  memories: number;
  anchors: number;
  expeditions: number;
  artifacts: number;
  bridges: number;
}

const ifsParts = [
  { id: 'protector', name: 'The Protector', goal: 'Keeps you safe by managing how you present yourself to the world.', role: 'Caretaker' },
  { id: 'exile', name: 'The Exile', goal: "Holds the emotional pain that hasn't been processed yet.", role: 'Vulnerable' },
  { id: 'firefighter', name: 'The Firefighter', goal: 'Jumps in to suppress overwhelm when it spikes suddenly.', role: 'Crisis Response' },
];

export default function Integrate() {
  const { user } = useFirebase();
  const [counts, setCounts] = useState<CountState>({
    memories: 0, anchors: 0, expeditions: 0, artifacts: 0, bridges: 0,
  });
  const [activeExercise, setActiveExercise] = useState<'none' | 'breathing' | 'grounding'>('none');
  const [selectedPart, setSelectedPart] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onSnapshot(collection(db, 'users', user.uid, 'memories'), s =>
        setCounts(prev => ({ ...prev, memories: s.size }))),
      onSnapshot(collection(db, 'users', user.uid, 'spatial_anchors'), s =>
        setCounts(prev => ({ ...prev, anchors: s.size }))),
      onSnapshot(collection(db, 'users', user.uid, 'expedition_logs'), s =>
        setCounts(prev => ({ ...prev, expeditions: s.size }))),
      onSnapshot(collection(db, 'users', user.uid, 'artifacts'), s =>
        setCounts(prev => ({ ...prev, artifacts: s.size }))),
      onSnapshot(collection(db, 'users', user.uid, 'neural_bridges'), s =>
        setCounts(prev => ({ ...prev, bridges: s.size }))),
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  const stats = [
    { label: 'Journal entries', value: counts.memories, icon: BookOpen, color: 'text-secondary', border: 'border-secondary' },
    { label: 'Places', value: counts.anchors, icon: MapPin, color: 'text-tertiary', border: 'border-tertiary' },
    { label: 'Activities', value: counts.expeditions, icon: Activity, color: 'text-primary', border: 'border-primary' },
    { label: 'Favorites', value: counts.artifacts, icon: Star, color: 'text-primary', border: 'border-primary' },
    { label: 'Links', value: counts.bridges, icon: Link2, color: 'text-on-surface-variant', border: 'border-outline-variant' },
  ];

  const stoicQuotes = [
    "Waste no more time arguing what a good man should be. Be one.",
    "If it is not right, do not do it; if it is not true, do not say it.",
    "The best revenge is to be unlike him who performed the injury.",
    "You have power over your mind — not outside events. Realize this, and you will find strength.",
    "It never troubles the wolf how many the sheep may be.",
    "He who fears death will never do anything worthy of a living man.",
    "Confine yourself to the present.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-12 pb-32"
    >
      {/* ── Stats ── */}
      <section className="space-y-6">
        <header className="space-y-1">
          <div className="flex items-center gap-3">
            <Wind className="text-primary w-7 h-7" />
            <h2 className="text-4xl font-bold uppercase tracking-tighter text-on-surface">Breathe</h2>
          </div>
          <p className="text-sm text-on-surface-variant">Everything you've added to ANAIS, and tools to reset when you need to.</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map(({ label, value, icon: Icon, color, border }) => (
            <div key={label} className={`glass-panel p-6 border-l-4 ${border} flex flex-col gap-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
              <p className="text-3xl font-bold font-mono">{value}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Wellness tools ── */}
      <section className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Wellness Tools</h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Breathing + IFS */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Breathing */}
            <div className="glass-panel p-6 border-t-4 border-primary">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <Wind className="w-4 h-4" /> Breathing
              </h4>
              {activeExercise === 'breathing' ? (
                <div className="flex flex-col items-center py-4 gap-6">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-28 h-28 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-primary">BREATHE</span>
                  </motion.div>
                  <button
                    onClick={() => setActiveExercise('none')}
                    className="text-[10px] font-bold uppercase underline opacity-60 hover:opacity-100"
                  >
                    Stop
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs opacity-50 italic">Follow the pulse to inhale and exhale.</p>
                  <button
                    onClick={() => setActiveExercise('breathing')}
                    className="w-full py-3 bg-primary text-on-primary font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all"
                  >
                    Start
                  </button>
                </div>
              )}
            </div>

            {/* IFS */}
            <div className="glass-panel p-6 border-t-4 border-secondary">
              <h4 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Internal Parts
              </h4>
              <p className="text-[10px] opacity-40 mb-3 leading-relaxed">
                From Internal Family Systems therapy. Tap a part to learn what it does.
              </p>
              <div className="space-y-2">
                {ifsParts.map(part => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(selectedPart?.id === part.id ? null : part)}
                    className={`w-full p-3 border text-left transition-all ${
                      selectedPart?.id === part.id
                        ? 'bg-secondary text-on-secondary border-secondary'
                        : 'bg-surface-container-low border-outline-variant hover:border-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest">{part.name}</span>
                      <span className="text-[10px] opacity-40">{part.role}</span>
                    </div>
                    {selectedPart?.id === part.id && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] leading-relaxed mt-2 italic"
                      >
                        {part.goal}
                      </motion.p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: Grounding + buttons */}
          <main className="lg:col-span-8 space-y-6">
            {activeExercise === 'grounding' ? (
              <div className="glass-panel p-10 space-y-8 border-t-4 border-error">
                <h4 className="text-2xl font-bold text-error uppercase tracking-tighter">Grounding — 5-4-3-2-1</h4>
                <div className="space-y-4 text-sm font-mono opacity-80">
                  <p>&gt; Name 5 things you can see...</p>
                  <p>&gt; Name 4 things you can touch...</p>
                  <p>&gt; Name 3 things you can hear...</p>
                  <p>&gt; Name 2 things you can smell...</p>
                  <p>&gt; Name 1 thing you can taste...</p>
                </div>
                <button
                  onClick={() => setActiveExercise('none')}
                  className="px-8 py-3 bg-error text-white font-bold uppercase text-[10px] tracking-widest"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="glass-panel p-10 flex items-center justify-center min-h-[200px]">
                <p className="text-xl font-body italic text-on-surface-variant opacity-50 text-center max-w-md leading-relaxed">
                  "I am restless. Things are calling me away. My body is a cage, but my mind is a sanctuary of infinite doors."
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveExercise('grounding')}
                className="p-6 border-2 border-error/40 bg-error/5 flex flex-col items-center gap-3 hover:bg-error/10 transition-all group"
              >
                <ShieldAlert className="w-7 h-7 text-error group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h5 className="text-xs font-bold uppercase text-error">Grounding</h5>
                  <p className="text-[10px] opacity-40 text-error/60">5-4-3-2-1</p>
                </div>
              </button>

              <a
                href="https://www.crisistextline.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 border-2 border-secondary/40 bg-secondary/5 flex flex-col items-center gap-3 hover:bg-secondary/10 transition-all group no-underline"
              >
                <Wind className="w-7 h-7 text-secondary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h5 className="text-xs font-bold uppercase text-secondary">Support</h5>
                  <p className="text-[10px] opacity-40 text-secondary/60">Crisis Text Line</p>
                </div>
              </a>

              <button
                onClick={() => {
                  toast.info(`"${stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)]}"`);
                }}
                className="p-6 border-2 border-primary/40 bg-primary/5 flex flex-col items-center gap-3 hover:bg-primary/10 transition-all group"
              >
                <Zap className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h5 className="text-xs font-bold uppercase text-primary">Stoic Quote</h5>
                  <p className="text-[10px] opacity-40 text-primary/60">Random reflection</p>
                </div>
              </button>
            </div>
          </main>
        </div>
      </section>
    </motion.div>
  );
}
