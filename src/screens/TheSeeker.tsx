import { Users, Brain, Heart, Castle, Church, Lock, X, Sparkles, ChevronRight, Droplets } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../components/FirebaseProvider';

export default function TheSeeker() {
  const { profile } = useFirebase();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-12 pb-32"
    >
      {/* Hero: Quest Log Header */}
      <section className="relative">
        <div className="absolute -top-12 -left-8 text-secondary opacity-10 select-none hidden lg:block">
          <Sparkles className="w-48 h-48 fill-secondary" />
        </div>
        <div className="bg-surface-container border-8 border-primary p-8 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 border border-white/20 m-1 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <p className="text-primary font-label uppercase tracking-[0.2em] mb-2 text-xs">Current Objective</p>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-4">THE SEEKER <span className="text-tertiary">v4.0</span></h2>
              <p className="text-xl text-on-surface-variant font-light leading-relaxed">
                "We do not grow absolutely, chronologically. We grow sometimes in one dimension, and not in another; unevenly. We are mature in one realm, childish in another."
              </p>
            </div>
            <div className="w-full md:w-auto bg-surface-container-highest border-4 border-secondary p-4 text-center min-w-[160px]">
              <p className="text-secondary font-label uppercase text-[10px] mb-1 tracking-widest">Soul Resonance</p>
              <p className="text-4xl font-bold text-secondary">LVL. {profile?.soulResonance ?? '--'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Soul Clusters & Stats */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low border-4 border-secondary p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-secondary font-bold text-xl uppercase tracking-tighter flex items-center gap-2">
                <Users className="w-5 h-5" />
                Soul Clusters
              </h3>
              <span className="text-[10px] bg-secondary text-on-secondary px-2 py-0.5 font-bold tracking-widest">ACTIVE</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Cluster_772', resonance: profile?.soulResonance ?? 92, icon: Brain, iconColor: 'bg-secondary', onColor: 'text-on-secondary', resonanceColor: 'text-secondary' },
                { label: 'The Alchemists', resonance: 84, icon: Sparkles, iconColor: 'bg-primary', onColor: 'text-on-primary', resonanceColor: 'text-primary' },
                { label: 'Silent Architects', resonance: 71, icon: Droplets, iconColor: 'bg-tertiary', onColor: 'text-on-tertiary', resonanceColor: 'text-tertiary' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4 bg-surface-container-high p-4 hover:translate-x-2 transition-transform cursor-pointer group">
                  <div className={`w-12 h-12 ${c.iconColor} flex items-center justify-center`}>
                    <c.icon className={`${c.onColor} w-6 h-6`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">{c.label}</p>
                    <p className={`text-[10px] ${c.resonanceColor} opacity-80 uppercase tracking-widest font-bold`}>Resonance: {c.resonance}%</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${c.resonanceColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container border-4 border-tertiary p-6">
            <h4 className="text-tertiary font-label uppercase text-xs mb-6 tracking-widest font-bold">Introspection Stats</h4>
            <div className="space-y-6">
              {[
                { label: 'Depth', current: profile?.subconsciousDepth ?? 68, max: 100, color: 'bg-tertiary', text: 'text-tertiary' },
                { label: 'Vulnerability', current: 91, max: 100, color: 'bg-primary', text: 'text-primary' },
                { label: 'Empathy', current: 42, max: 100, color: 'bg-secondary', text: 'text-secondary' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[10px] mb-1 uppercase tracking-tighter font-bold">
                    <span className="text-on-surface">{s.label}</span>
                    <span className={s.text}>{s.current}/{s.max}</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest p-[2px] border border-outline-variant/30">
                    <div className={`h-full ${s.color}`} style={{ width: `${s.current}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: recommendations & Quests */}
        <article className="lg:col-span-8 space-y-12">
          {/* Architecture of Openness Quests */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-3xl font-bold tracking-tighter uppercase whitespace-nowrap">Architecture of Openness</h3>
              <div className="h-[2px] flex-1 bg-outline-variant/20"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-high p-6 border-l-8 border-primary flex flex-col justify-between h-72 relative overflow-hidden group hover:bg-surface-container-highest transition-colors">
                <div className="absolute -right-8 -bottom-8 text-primary opacity-5 group-hover:opacity-10 transition-opacity">
                  <Castle className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-bold bg-primary text-on-primary px-2 py-0.5 tracking-tighter uppercase">QUEST // ACTIVE</span>
                  <h4 className="text-2xl font-bold mt-4 mb-2">The Glass Conservatory</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Describe a secret you've never spoken, but have always known to be true.</p>
                </div>
                <button className="relative z-10 w-fit mt-4 px-6 py-2 bg-primary text-on-primary font-bold uppercase text-[10px] tracking-widest hover:brightness-110 active:translate-y-0.5 transition-all cursor-pointer">
                  Begin Excavation
                </button>
              </div>

              <div className="bg-surface-container-high p-6 border-l-8 border-secondary flex flex-col justify-between h-72 relative overflow-hidden group opacity-80">
                <div className="absolute -right-8 -bottom-8 text-secondary opacity-5">
                  <Church className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-bold border border-secondary text-secondary px-2 py-0.5 tracking-tighter uppercase">QUEST // LOCKED</span>
                  <h4 className="text-2xl font-bold mt-4 mb-2 italic opacity-60">Vestibule of Mirrors</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Requires Resonance Level 90. A study in the many versions of the self.</p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-secondary text-[10px] font-bold uppercase tracking-widest">
                  <Lock className="w-3 h-3" />
                  Insufficient Resonance
                </div>
              </div>
            </div>
          </section>

          {/* Resonant Recommendations */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-3xl font-bold tracking-tighter uppercase">Neural Recommendations</h3>
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mt-1 font-bold">Sourced from Cluster_772</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {[
                { 
                  title: 'Fragment: The Labyrinth of Wills', 
                  quote: '"I am an excitable person who only understands life lyrically, musically, in whom feelings are much stronger as as soon as they are expressed..."',
                  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx-AocYwqUTB1cec1p2wIu10mmCvxtFaO-eTldm9uYygdbZeaBqkrZJnG0bFb5TxONadZwbMG5Ta_9geqfsfZ3awsi3Jp_55fg4YpY1Qw0jTBc_N4ld81HUHOjCL7fWeOJ4XXhhAwovMY2IBc3Dwtwu0yXS7MsJ8K9YntnO2Qrcr5UPQmgOqCFo_CMaB8yIwm25oQaOIjEiko4_lE7UVfQmPek3x9RtpuB1wRnVpZotHsHg6PRmX_C6NNjj-mPzwfb4RtSAVPNJPFc',
                  foundBy: '@Anais_Ghost',
                  titleColor: 'text-tertiary',
                  borderColor: 'border-outline-variant'
                },
                { 
                  title: 'Artifact: The Velvet Shroud', 
                  quote: '"There are very few people who could even guess what I am. You must be very careful with me."',
                  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSSNo0jJiv6LHIYEp4QVz3-fZ9xhe495dun_DFQ92SsoFdsLo9wE4NyJki7wOIG6hnOHMj1JWGcK89kLH24uphuVozuIVv2GQn40JbVLMlbJG-_e-dSJwhQ1Ki6C5U1sNRPnDgpkJz349wn7V1oGQJ9UejXfgT10m1lveplJ4xAkYM_Gs1_tRXwPpNMjSKXW_p-cMojjjjBJO2m0ehQVBBeiWQC0Q3ua0QyWi_q0E9Spi1HeFzp27HXTE2X7MFwbPsF9cqalDVnfjz',
                  foundBy: '@V_Miller',
                  titleColor: 'text-secondary',
                  borderColor: 'border-outline-variant'
                }
              ].map((rec, idx) => (
                <div key={idx} className="bg-surface-container border-4 border-outline-variant/40 p-1 relative flex flex-col md:flex-row gap-6 hover:bg-surface-container-low transition-colors group">
                  <div className={`w-full md:w-48 h-48 bg-surface-container-highest shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700 overflow-hidden border-2 md:border-r-4 ${rec.borderColor}`}>
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={rec.image} alt={rec.title} referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className={`text-2xl font-bold ${rec.titleColor} mb-2 tracking-tight`}>{rec.title}</h4>
                      <p className="text-on-surface-variant leading-relaxed text-sm italic opacity-90">{rec.quote}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 items-center">
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/50 hover:bg-primary hover:text-on-primary transition-all uppercase text-[10px] font-bold tracking-widest cursor-pointer">
                        <Heart className="w-3 h-3 fill-current" />
                        Resonant
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error border border-error/50 hover:bg-error hover:text-on-error transition-all uppercase text-[10px] font-bold tracking-widest cursor-pointer">
                        <X className="w-3 h-3" />
                        Dissonant
                      </button>
                      <div className="flex-1 md:text-right">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] opacity-60 italic">{rec.foundBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    </motion.div>
  );
}
