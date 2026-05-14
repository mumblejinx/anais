import React from 'react';
import { MessageSquare, BookOpen, MapPin, Target, Wind, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function TheCompass({ setTab }: { setTab: (tab: string) => void }) {
  const sections = [
    {
      tab: 'oracle',
      icon: MessageSquare,
      title: 'Chat',
      color: 'text-primary',
      borderColor: 'border-primary',
      description: 'Talk to ANAIS. She knows your favorites, journal entries, places, activities, and links — and uses them to give you specific, relevant responses instead of generic ones. Ask her anything.',
    },
    {
      tab: 'inner',
      icon: BookOpen,
      title: 'Journal',
      color: 'text-secondary',
      borderColor: 'border-secondary',
      description: 'Write diary entries. After you save, ANAIS asks you a few questions before offering any reflection — so she understands the situation before commenting on it. You can push back if she misreads you. Past entries and their reflection threads are saved here too.',
    },
    {
      tab: 'seeker',
      icon: MapPin,
      title: 'Places',
      color: 'text-tertiary',
      borderColor: 'border-tertiary',
      description: 'Save places that matter to you and log activities you do. ANAIS pulls from these when you chat, so she can reference your actual life rather than making assumptions.',
    },
    {
      tab: 'sanctuary',
      icon: Target,
      title: 'Goals',
      color: 'text-primary',
      borderColor: 'border-primary',
      description: 'Set goals with a target date and track them on a calendar. Click any day to see or add goals for that date. Check them off as you go.',
    },
    {
      tab: 'integrate',
      icon: Wind,
      title: 'Breathe',
      color: 'text-on-surface-variant',
      borderColor: 'border-outline-variant',
      description: 'A summary of everything you\'ve added to ANAIS, plus wellness tools — a breathing exercise, a 5-4-3-2-1 grounding sequence, stoic quotes, and a link to Crisis Text Line.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 pb-32"
    >
      <header className="bg-surface-container-high p-8 border-l-8 border-primary">
        <div className="flex items-center gap-3 mb-3">
          <Compass className="text-primary w-7 h-7" />
          <h2 className="text-3xl font-bold tracking-tighter uppercase text-on-surface">Guide</h2>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
          What each part of ANAIS does, in plain language.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((s, idx) => (
          <motion.div
            key={s.tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className={`p-6 bg-surface-container border-t-4 ${s.borderColor} flex flex-col gap-4 cursor-pointer hover:bg-surface-container-low transition-colors`}
            onClick={() => setTab(s.tab)}
          >
            <div className="flex items-center gap-3">
              <s.icon className={`${s.color} w-5 h-5`} />
              <h3 className={`font-bold uppercase tracking-widest text-sm ${s.color}`}>{s.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-on-surface/80 flex-grow">{s.description}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${s.color} opacity-60`}>Go to {s.title} →</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
