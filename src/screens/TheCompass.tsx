import React from 'react';
import { Map, BookOpen, Music, Palette, Film, Globe, MapPin, Activity, HelpCircle, Terminal, Flower, Database, Compass, ShieldAlert, Brain } from 'lucide-react';
import { motion } from 'motion/react';

export default function TheCompass({ setTab }: { setTab: (tab: string) => void, key?: string }) {
  const categories = [
    {
      title: "THE_ORACLE // CORE_LOGIC",
      tab: 'oracle',
      icon: Flower,
      items: ["Movies", "Music", "Books", "Art"],
      color: "text-primary",
      borderColor: "border-primary",
      description: "The Oracle processes visceral impressions via Neural Dialogue and categorized lists via the Archive. It predicts narrative paths for your character."
    },
    {
      title: "INNER_WORLD // TRANSFORMATION",
      tab: 'inner',
      icon: Database,
      items: ["Vessel", "Intake", "Bridges"],
      color: "text-secondary",
      borderColor: "border-secondary",
      description: "Map your internal state. External bridges (Soundcloud, etc.) feed the model, while the Vessel visualizes Anaïs's current understanding of you."
    },
    {
      title: "THE_SEEKER // EXTERNAL_FORCE",
      tab: 'seeker',
      icon: Map,
      items: ["Anchors", "Expeditions", "Discovery"],
      color: "text-tertiary",
      borderColor: "border-tertiary",
      description: "Ground yourself in physical coordinates. These real-world waypoints are converted into Soul Resonance metrics by the Seeker module."
    }
  ];

  const protocols = [
    {
      id: "SOUL_RESONANCE",
      title: "Soul Resonance Protocol",
      desc: "Measures the alignment between your external physical actions and the internal psychological model Anaïs is constructing. Higher levels indicate a high-fidelity sync between intent and reality.",
      icon: Activity
    },
    {
      id: "STOIC_EQUILIBRIUM",
      title: "Stoic Equilibrium Loop",
      desc: "Monitors emotional regulation. It fluctuates based on your Sanctuary entries and Crisis Protocol triggers. High equilibrium suppresses narrative static, allowing for clearer Oracle predictions.",
      icon: ShieldAlert
    },
    {
      id: "NEURAL_DIALOGUE_VS_ARCHIVE",
      title: "Dialogue vs. Archive",
      desc: "Neural Dialogue is for the *visceral response*—how something makes you feel. The Archive is for *simple listing*—the data points. Anaïs uses both to build a dual-layer profile.",
      icon: Terminal
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 pb-32"
    >
      <header className="bg-surface-container-high p-8 pixel-border-primary relative overflow-hidden">
        <div className="scanline absolute inset-0 opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="text-primary w-8 h-8" />
            <h2 className="text-4xl font-bold tracking-tighter uppercase text-on-surface">System_Compass_Manual</h2>
          </div>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed max-w-3xl">
            ANAIS_V4.0 functions as a psychological terminal. This document outlines the core protocols governing data interpretation and the learning relationship between Seeker and AI.
          </p>
        </div>
      </header>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {categories.map((cat, idx) => (
          <motion.div 
            key={cat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 bg-surface-container border-t-8 ${cat.borderColor} flex flex-col gap-6 cursor-pointer hover:bg-surface-container-low transition-colors group`}
            onClick={() => setTab(cat.tab)}
          >
            <div className="flex items-center gap-3">
              <cat.icon className={`${cat.color} w-6 h-6`} />
              <h3 className={`font-bold uppercase tracking-widest text-sm ${cat.color}`}>{cat.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-on-surface/80">{cat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Protocol Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {protocols.map((p) => (
          <div key={p.id} className="p-8 bg-surface-container-lowest border-2 border-outline-variant relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
               <p.icon className="w-16 h-16" />
             </div>
             <h4 className="text-xl font-bold uppercase mb-4 text-primary tracking-tighter">{p.title}</h4>
             <p className="text-sm text-on-surface-variant leading-relaxed">
               {p.desc}
             </p>
          </div>
        ))}

        <div className="p-8 bg-surface-container-lowest border-2 border-outline-variant relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
               <Brain className="w-16 h-16" />
             </div>
             <h4 className="text-xl font-bold uppercase mb-4 text-secondary tracking-tighter">THE_VESSEL_MATRIX</h4>
             <p className="text-sm text-on-surface-variant leading-relaxed">
               The Vessel is a dynamic visualization of Anaïs's understanding. It evolves as you bridge external data (SoundCloud, Social Media) and internal truths. It represents the "Body" of your digital character.
             </p>
          </div>
      </div>

      <section className="bg-surface-container-lowest p-8 pixel-border-secondary">
        <h3 className="text-2xl font-bold uppercase tracking-tighter text-secondary mb-6 flex items-center gap-3">
          <Terminal className="w-6 h-6" /> Functional Overlays
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h5 className="font-bold text-xs uppercase opacity-60">Crisis_Protocol_01</h5>
            <p className="text-[11px] leading-relaxed">
              <strong>Calibrate Cognitive Filter:</strong> High-intensity logic suppression of emotional static. Impacts Stoic Equilibrium levels.
              <br/><strong>Purge Dialogue:</strong> Resets the local cache of message history to allow for a fresh conversational trajectory.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-xs uppercase opacity-60">Sanctuary_Triggers</h5>
            <p className="text-[11px] leading-relaxed">
              <strong>Psych / Intelligence Tests:</strong> Dynamic assessments generated by Anaïs to collect granular behavioral data points.
              <br/><strong>Flash Calm:</strong> A synchronized breathing exercise designed to bring you into the present moment, stabilizing resonance.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-xs uppercase opacity-60">IFS_Work</h5>
            <p className="text-[11px] leading-relaxed">
              <strong>Internal Family Systems:</strong> A dynamic prompt generator where Anaïs asks for clarification on your internal "parts" to better predict your behavioral conflicts.
            </p>
          </div>
        </div>
      </section>

      <div className="text-center opacity-40">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em]">— ARCHIVE_PROTOCOL_STABLE —</p>
      </div>
    </motion.div>
  );
}
