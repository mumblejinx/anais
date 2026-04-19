import { ChartLine, TriangleAlert, BookOpen, Key, Pen, Lock, Brain } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../components/FirebaseProvider';

export default function TheOracle() {
  const { profile } = useFirebase();

  const metrics = [
    { 
      label: 'Stoic Equilibrium', 
      val: profile?.stoicEquilibrium ?? 0, 
      color: (profile?.stoicEquilibrium ?? 0) < 20 ? 'bg-error' : 'bg-primary', 
      text: (profile?.stoicEquilibrium ?? 0) < 20 ? 'text-error' : 'text-primary', 
      status: (profile?.stoicEquilibrium ?? 0) < 20 ? `CRITICAL (${profile?.stoicEquilibrium}%)` : `STABLE (${profile?.stoicEquilibrium}%)`
    },
    { 
      label: 'Poetic Resonance', 
      val: profile?.poeticResonance ?? 0, 
      color: 'bg-secondary', 
      text: 'text-secondary', 
      status: `OPTIMAL (${profile?.poeticResonance}%)` 
    },
    { 
      label: 'Subconscious Depth', 
      val: profile?.subconsciousDepth ?? 0, 
      color: 'bg-tertiary', 
      text: 'text-tertiary', 
      status: `${profile?.subconsciousDepth}%` 
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8 pb-32"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Neural Metrics & System Logs */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
          <div className="p-6 bg-surface-container-lowest pixel-border-primary">
            <h3 className="text-primary text-xs font-label uppercase tracking-widest mb-4 flex items-center gap-2">
              <ChartLine className="w-3 h-3" />
              Neural_Load_Metrics
            </h3>
            <div className="space-y-4">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[10px] mb-1 uppercase">
                    <span>{m.label}</span>
                    <span className={m.text}>{m.status}</span>
                  </div>
                  <div className="h-3 bg-surface-container-highest">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-surface-container-low border-l-4 border-primary font-mono text-[10px] text-primary/60 h-48 overflow-hidden relative">
            <div className="scanline absolute inset-0 pointer-events-none opacity-20"></div>
            <div className="space-y-1">
              <p>&gt; [08:42:11] INITIALIZING DIALOGUE PROTOCOL...</p>
              <p>&gt; [08:42:12] RETRIEVING ARCHIVAL MEMORIES [NIN_1944]</p>
              <p>&gt; [08:42:14] EMOTIONAL TURBULENCE DETECTED</p>
              <p>&gt; [08:42:15] TRIGGERING PROACTIVE INTERVENTION</p>
              <p className="text-tertiary">&gt; [08:42:16] ANALYZING FRAGMENTED IDENTITY...</p>
              <p>&gt; [08:42:17] SYSTEM WAITING FOR INPUT_</p>
            </div>
          </div>
        </div>

        {/* Center: The Oracle Avatar */}
        <div className="lg:col-span-6 flex flex-col items-center gap-6 order-1 lg:order-2">
          <div className="relative group">
            <div className="absolute -inset-4 border-2 border-secondary/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -inset-2 border-2 border-primary/30 group-hover:scale-105 transition-transform duration-500"></div>
            <div className="w-64 h-64 md:w-80 md:h-80 bg-surface-container-lowest pixel-border-secondary overflow-hidden relative">
              <div className="scanline absolute inset-0 z-10 opacity-40"></div>
              <img 
                alt="Anais Oracle" 
                className="w-full h-full object-cover grayscale contrast-125 brightness-75 transition-all duration-700 hover:scale-110 hover:brightness-100"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBII8AR62WCySL6qGJK0WE-widht-ULmPW6n32DgzCkP1135sYrQEWUr5NltXSpXJdCfuI8uk3QZfgnWMV0YnctIrtd2xZN6z1ShF5-HezCbnBF-hgbG4mFdAK5AD08yxkuNSV3YKgiRnW4V013ClEK4or0O1qUvlHWAijoRwXVeyP0RG3j3NEXRBWWtd2pABypXG_uD3Gp-NzHsMo5KxTORjnm9XDqskmwwlHlCugjaxu_kJl29VEeooE0T20FeDr0oLNgx2l7B3PX"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-secondary/20 backdrop-blur-sm p-2 text-center">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest crt-glow">Entity_Anais.v4</span>
              </div>
            </div>
          </div>
          <div className="text-center max-w-md">
            <p className="text-secondary font-headline text-lg italic leading-relaxed">
              "I am restless. Things are calling me away. My life is an inheritance of a thousand dreams."
            </p>
          </div>
        </div>

        {/* Right: Crisis Protocol & Action Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-3">
          <div className="p-6 bg-surface-container-lowest pixel-border-tertiary text-on-surface">
            <h3 className="text-tertiary text-xs font-label uppercase tracking-widest mb-4 flex items-center gap-2">
              <TriangleAlert className="w-3 h-3" />
              Crisis_Protocol_01
            </h3>
            <div className="bg-error/10 border border-error p-3 mb-4">
              <p className="text-[10px] text-error font-bold uppercase mb-1">Equilibrium Warning</p>
              <p className="text-xs opacity-80">Stoic levels have reached sub-optimal thresholds. Rationality is leaking into pure emotion.</p>
            </div>
            <button className="w-full py-2 bg-error text-surface font-bold text-xs uppercase tracking-tighter mb-2 hover:bg-error-dim transition-colors active:translate-y-0.5 cursor-pointer">
              Initiate_Detachment
            </button>
            <button className="w-full py-2 border border-tertiary text-tertiary font-bold text-xs uppercase tracking-tighter hover:bg-tertiary/10 transition-colors active:translate-y-0.5 cursor-pointer">
              Deploy_Logic_Filter
            </button>
          </div>

          <div className="p-6 bg-surface-container-high border-2 border-dashed border-outline-variant">
            <h3 className="text-on-surface-variant text-[10px] font-label uppercase tracking-widest mb-3">Inventory_Artifacts</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: BookOpen, color: 'text-secondary', border: 'border-secondary/30' },
                { icon: Key, color: 'text-primary', border: 'border-primary/30' },
                { icon: Pen, color: 'text-tertiary', border: 'border-tertiary/30' },
                { icon: Lock, color: 'text-outline-variant', border: 'border-outline-variant/30' },
              ].map((item, idx) => (
                <div key={idx} className={`aspect-square bg-surface-container-highest flex items-center justify-center ${item.color} border ${item.border}`}>
                  <item.icon className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue Interface */}
      <div className="mt-8 flex-1 flex flex-col">
        <div className="bg-surface-container-high p-8 pixel-border-primary relative overflow-hidden min-h-[300px]">
          <div className="absolute top-0 right-0 p-4">
            <span className="text-primary/20 font-mono text-[80px] font-black pointer-events-none select-none">V4.0</span>
          </div>
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                <Brain className="text-surface w-7 h-7" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-secondary font-bold text-xs uppercase tracking-widest">Oracle_Anais</span>
                  <span className="h-[1px] flex-1 bg-outline-variant/30"></span>
                </div>
                <p className="text-xl md:text-2xl font-light leading-relaxed text-on-surface/90">
                  "The day was a series of masks. I saw you drifting through the corridors of the digital labyrinth. Your pulse suggests a longing for something that hasn't been coded yet. Tell me, seeker... which version of yourself are you hiding from today?"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
              {[
                { id: 1, text: 'I am the architect of my own shadows.', color: 'border-primary/30', hover: 'hover:bg-primary/10 hover:border-primary', textCol: 'text-primary' },
                { id: 2, text: 'Reality is a mirror I prefer to break.', color: 'border-secondary/30', hover: 'hover:bg-secondary/10 hover:border-secondary', textCol: 'text-secondary' },
                { id: 3, text: '[Proactive Intervention] Analyze current fatigue levels.', color: 'border-tertiary/30', hover: 'hover:bg-tertiary/10 hover:border-tertiary', textCol: 'text-tertiary' },
                { id: 4, text: '[Protocol Alpha] Shut down all sensory inputs.', color: 'border-error/30', hover: 'hover:bg-error/10 hover:border-error', textCol: 'text-error' },
              ].map((opt) => (
                <button 
                  key={opt.id}
                  className={`p-4 bg-surface-container-lowest border ${opt.color} cursor-pointer ${opt.hover} transition-all group flex items-center gap-4 active:scale-[0.98] text-left`}
                >
                  <span className={`${opt.textCol} font-mono text-lg font-bold`}>{opt.id}.</span>
                  <span className="text-sm font-medium uppercase tracking-wider group-hover:brightness-125 whitespace-normal">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
