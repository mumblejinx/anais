import { ShieldAlert, ChartLine, Users, Terminal as TerminalIcon, ShieldX, Phone, Bolt, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function TheSanctuary() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex flex-col gap-12 pb-32"
    >
      {/* CRT Scanline Effect layer (local to screen) */}
      <div className="fixed inset-0 scanline z-10 pointer-events-none opacity-10"></div>

      {/* Hero Section: Sanctuary Entry */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="pixel-border-tertiary p-10 glass-panel inline-block relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-tertiary/5"></div>
          <ShieldAlert className="w-16 h-16 text-tertiary mb-6 mx-auto fill-tertiary/20" />
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-2">The Sanctuary</h2>
          <p className="text-primary font-label tracking-widest text-sm opacity-80 uppercase font-bold">STATION_004 // SAFE_ZONE_ESTABLISHED</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        {/* Left Column: Stoic Equilibrium & IFS Work */}
        <div className="lg:col-span-4 space-y-8">
          <div className="pixel-border-primary p-6 glass-panel">
            <h3 className="font-bold text-lg text-primary uppercase mb-8 flex items-center gap-2 tracking-widest">
              <ChartLine className="w-5 h-5" />
              Stoic Equilibrium
            </h3>
            <div className="space-y-8">
              {[
                { label: 'Pulse Variance', val: 62, color: 'bg-primary' },
                { label: 'Neural Calm', val: 89, color: 'bg-primary' },
                { label: 'Stoic Threshold', val: 100, color: 'bg-tertiary', status: 'STABLE' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between mb-2 text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">
                    <span>{m.label}</span>
                    <span className={m.color.replace('bg-', 'text-')}>{m.status || `${m.val}%`}</span>
                  </div>
                  <div className="h-4 bg-surface-container-highest w-full border-2 border-primary/20 p-0.5">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-5 bg-primary/10 border border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-20">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs italic text-primary leading-relaxed relative z-10">
                "You have power over your mind - not outside events. Realize this, and you will find strength."
              </p>
            </div>
          </div>

          <div className="pixel-border-secondary p-6 glass-panel">
            <h3 className="font-bold text-lg text-secondary uppercase mb-6 flex items-center gap-2 tracking-widest">
              <Users className="w-5 h-5" />
              IFS Work
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'The Protector', status: '(Active)', active: true, icon: 'ShieldCheck' },
                { label: 'The Exile', status: '(Dormant)', active: false, icon: 'Baby' },
                { label: 'The Firefighter', status: '(Ready)', active: false, icon: 'Flame' },
              ].map((item) => (
                <li 
                  key={item.label}
                  className={`flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high cursor-pointer transition-all border-l-4 ${item.active ? 'border-secondary' : 'border-outline-variant/30 opacity-60'}`}
                >
                  <span className="text-sm font-medium">{item.label} <span className="text-[10px] opacity-60 ml-1">{item.status}</span></span>
                  <div className={item.active ? 'text-secondary' : 'text-on-surface-variant'}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </li>
              ))}
            </ul>
            <button className="w-full mt-6 py-4 border-2 border-secondary text-secondary font-bold uppercase tracking-widest hover:bg-secondary hover:text-surface transition-all active:scale-95 cursor-pointer text-xs">
              Begin Session
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Terminal */}
        <div className="lg:col-span-8 space-y-8">
          <div className="pixel-border-tertiary glass-panel flex flex-col min-h-[520px]">
            <div className="bg-tertiary text-surface px-6 py-3 flex justify-between items-center">
              <span className="font-bold text-xs tracking-[0.2em] uppercase">Offline Introspection Terminal</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-surface"></div>
                <div className="w-3 h-3 bg-surface"></div>
              </div>
            </div>
            <div className="flex-grow p-8 font-mono text-sm space-y-6 overflow-y-auto">
              <div className="text-tertiary font-bold tracking-widest">/ ACCESSING_PROTECTIVE_LAYER...</div>
              <div className="text-on-surface">System identifies current emotional state as: <span className="text-primary font-bold">[RECEPTIVE]</span></div>
              
              <div className="bg-surface-container-highest p-8 border-l-4 border-tertiary my-8 relative group">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <TerminalIcon className="w-24 h-24" />
                </div>
                <p className="text-xl text-on-surface mb-6 leading-relaxed italic">
                  "I am restless. Things are calling me away. My life is an effort to hold when I should let go. My life is a series of escapes."
                </p>
                <cite className="text-tertiary opacity-80 font-bold not-italic tracking-widest text-[11px]">— ANAÏS NIN, DIARIES</cite>
              </div>

              <div className="flex items-start gap-4 pt-4">
                <span className="text-primary font-black text-xl animate-pulse">&gt;</span>
                <div className="flex-grow">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-primary placeholder-primary/20 text-lg outline-none" 
                    placeholder="Awaiting manual entry..." 
                    type="text"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t-2 border-tertiary/10 grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-container-low/50">
              {['Unblend Part', 'Check Compassion', 'View History', 'Export Logs'].map((label) => (
                <button 
                  key={label}
                  className="py-3 bg-surface-container-low border border-tertiary/20 hover:bg-tertiary hover:text-surface transition-all uppercase text-[10px] font-bold tracking-widest cursor-pointer active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Crisis Protocol Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="bg-error/10 border-2 border-error p-8 flex flex-col items-center text-center cursor-pointer hover:bg-error/20 transition-all active:scale-95 group">
              <ShieldX className="text-error w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-error uppercase text-xs tracking-widest mb-1">Total Reset</h4>
              <p className="text-[10px] text-error/70 uppercase font-medium">Execute immediate grounding sequence</p>
            </button>
            <button className="bg-error/5 border-2 border-error/40 p-8 flex flex-col items-center text-center cursor-pointer hover:bg-error/15 transition-all active:scale-95 group">
              <Phone className="text-error w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-error uppercase text-xs tracking-widest mb-1">External Link</h4>
              <p className="text-[10px] text-error/70 uppercase font-medium">Connect to support node</p>
            </button>
            <button className="bg-error/5 border-2 border-error/40 p-8 flex flex-col items-center text-center cursor-pointer hover:bg-error/15 transition-all active:scale-95 group">
              <Bolt className="text-error w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-error uppercase text-xs tracking-widest mb-1">Flash Calm</h4>
              <p className="text-[10px] text-error/70 uppercase font-medium">High-intensity focus drill</p>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Artifacts */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-20">
        <div className="relative group overflow-hidden">
          <div className="absolute -inset-1 bg-primary/20 blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
          <img 
            className="relative w-full h-80 object-cover pixel-border-primary grayscale hover:grayscale-0 transition-all duration-700 brightness-75 group-hover:brightness-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDslWj77HLEti7WrRmsv1B5C35cr-GnnqfGwgESAmufzxqHMtorLLHDT_fVq_JcyLstzzbEbvNGOkoArF7_Gx2WKpmkjPhPj6LH64S7vVIEBj7YjlAg5kz3_jAQVME76ZlL2d4LroWeeHaDEOSO3GfEwB5bnhJOnumRtAh__HsUgDWVi594sFLTq8qvVUKC-tvqcZcej71GwO9a5cZlRjEtw59keMZU6_wM34_P_u6M3H0UCw_nv1kMpLMsQGuJz3oLzsBPS1Fp4OAg"
            alt="fragment"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-6 left-6 bg-surface p-1 border-2 border-primary">
            <div className="bg-primary/10 px-4 py-2 border border-primary/30">
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Memory_Fragment_09.log</span>
            </div>
          </div>
        </div>
        
        <div className="relative group overflow-hidden">
          <div className="absolute -inset-1 bg-secondary/20 blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
          <img 
            className="relative w-full h-80 object-cover pixel-border-secondary grayscale hover:grayscale-0 transition-all duration-700 brightness-75 group-hover:brightness-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtp6x8-DMGRKor5z9OxBjQuned-Do-PVEK5gv9Jr8xxZuhm9Vm7vBA3p23I5srhB7cmivDcRQNCl2wb6dA8gM8hfiGG0Vac6alupWg0GF-9ThYODPWZX-2uJfphcDurUR23GBJdhlBsHKM_PZwrXSY2bTW5F60qe1qNw8QfG2Rt29Vzr5h52A0NWF7eFCnqmUwWBDYdvm82RpEAFPyPIsbwLkKgfDP1o13PRJ9gEF_xqM81Md3xSgl5VdxttS-hcGodceTY-yxk1aC"
            alt="landscape"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-6 left-6 bg-surface p-1 border-2 border-secondary">
            <div className="bg-secondary/10 px-4 py-2 border border-secondary/30">
              <span className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em]">Internal_Landscape_v4.px</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
