import { ChartLine, TriangleAlert, BookOpen, Key, Pen, Lock, Brain, Send, Loader2, Image as ImageIcon, X, Film, Music, Book, Bookmark, Pen as PenTool, Globe, MapPin, Activity, Flower, ShieldAlert, Terminal as TerminalIcon, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit, uploadFile, getDocs, deleteDoc, updateDoc, doc } from '../lib/firebase';
import { getOracleResponse, generateRecommendations } from '../lib/gemini';
import { AnaisAvatar } from '../components/AnaisAvatar';
import { toast } from 'sonner';
import { fileToBase64 } from '../lib/utils';

export default function TheOracle() {
  const { user, profile, rewardXP } = useFirebase();
  const [messages, setMessages] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [anchors, setAnchors] = useState<any[]>([]);
  const [expeditions, setExpeditions] = useState<any[]>([]);
  const [bridges, setBridges] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'dialogue' | 'archive' | 'discovery'>('dialogue');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [artifactName, setArtifactName] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [ratingOpenId, setRatingOpenId] = useState<string | null>(null);
  const [pendingRating, setPendingRating] = useState(0);
  const [pendingRatingText, setPendingRatingText] = useState('');

  const [counts, setCounts] = useState({
    oracle: 0,
    inner: 0,
    seeker: 0,
    insights: 0
  });

  useEffect(() => {
    if (!user) return;
    
    // Neural Dialogue Logic (System Messages / History)
    const q = query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Artifacts Archive Logic
    const unsubscribeArtifacts = onSnapshot(collection(db, 'users', user.uid, 'artifacts'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArtifacts(data);
      setCounts(prev => ({ ...prev, oracle: snap.size }));
    });

    const unsubscribeBridges = onSnapshot(collection(db, 'users', user.uid, 'neural_bridges'), (snap) => {
      setBridges(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCounts(prev => ({ ...prev, inner: snap.size }));
    });

    const unsubscribeSeeker = onSnapshot(collection(db, 'users', user.uid, 'spatial_anchors'), (snap) => {
      setAnchors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCounts(prev => ({ ...prev, seeker: snap.size }));
    });

    const unsubscribeExpeditions = onSnapshot(collection(db, 'users', user.uid, 'expedition_logs'), (snap) => {
      setExpeditions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeMemories = onSnapshot(collection(db, 'users', user.uid, 'memories'), (snap) => {
      setMemories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeInsights = onSnapshot(collection(db, 'users', user.uid, 'recommendations'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecommendations(data);
      setCounts(prev => ({ ...prev, insights: snap.size }));
    });

    return () => {
      unsubscribeMessages();
      unsubscribeArtifacts();
      unsubscribeBridges();
      unsubscribeSeeker();
      unsubscribeExpeditions();
      unsubscribeMemories();
      unsubscribeInsights();
    };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (forcedPrompt?: string) => {
    const text = forcedPrompt || input;
    if (!user || !text.trim() || isLoading) return;

    setIsLoading(true);
    if (!forcedPrompt) setInput('');

    try {
      await addDoc(collection(db, 'users', user.uid, 'messages'), {
        role: 'user',
        content: text,
        createdAt: serverTimestamp()
      });

      const response = await getOracleResponse(text, profile, { artifacts, anchors, expeditions, bridges, memories });
      
      await addDoc(collection(db, 'users', user.uid, 'messages'), {
        role: 'oracle',
        content: response,
        createdAt: serverTimestamp()
      });

      await rewardXP(50, 20);
    } catch (error) {
      console.error("Neural handshake failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    const loadingToast = toast.loading("Clearing chat...");
    try {
       const q = query(collection(db, 'users', user.uid, 'messages'));
       const snap = await getDocs(q);
       const batch = snap.docs.map(d => deleteDoc(d.ref));
       await Promise.all(batch);
       toast.success("Chat history cleared.", { id: loadingToast });
    } catch (e) {
       toast.error("Failed to clear chat.", { id: loadingToast });
    }
  };

  const handleCalibrateFilter = async () => {
     if (!user) return;
     toast.success("Context note logged.");
     await addDoc(collection(db, 'users', user.uid, 'logs'), {
       type: 'SYS',
       content: "Calibrate_Filter: Logical detachment increased.",
       createdAt: serverTimestamp()
     });
  };

  const handleArchiveArtifact = async () => {
    if (!user || !artifactName.trim() || !selectedCategory) return;
    
    const loadingToast = toast.loading("Saving...");
    try {
      await addDoc(collection(db, 'users', user.uid, 'artifacts'), {
        name: artifactName,
        type: selectedCategory.toLowerCase(),
        createdAt: serverTimestamp()
      });
      setArtifactName('');
      setSelectedCategory(null);
      toast.success(`${selectedCategory} saved to favorites.`, { id: loadingToast });
      await rewardXP(30, 10);
    } catch (e) {
      toast.error("Failed to save.", { id: loadingToast });
    }
  };

  const handleDiscover = async () => {
    if (!user || isDiscovering) return;
    setIsDiscovering(true);
    const loadingToast = toast.loading("Getting recommendations...");
    try {
      const results = await generateRecommendations(profile, {
        anchors, expeditions, memories, artifacts, bridges
      });

      // Delete only manual recs — preserve monthly picks
      const snap = await getDocs(query(collection(db, 'users', user.uid, 'recommendations')));
      const toDelete = snap.docs.filter(d => d.data().source !== 'monthly');
      await Promise.all(toDelete.map(d => deleteDoc(d.ref)));

      for (const res of results) {
        await addDoc(collection(db, 'users', user.uid, 'recommendations'), {
          ...res,
          source: 'manual',
          rated: false,
          rating: null,
          ratingText: null,
          createdAt: serverTimestamp()
        });
      }
      setActiveTab('discovery');
      toast.success("Recommendations updated.", { id: loadingToast });
    } catch {
      toast.error("Failed to get recommendations. Check your API key.", { id: loadingToast });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleRate = async (recId: string, rating: number, text: string) => {
    if (!user || !rating) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'recommendations', recId), {
        rated: true, rating, ratingText: text,
      });
      setRatingOpenId(null);
      setPendingRating(0);
      setPendingRatingText('');
      toast.success('Rating saved.');
    } catch {
      toast.error('Failed to save rating.');
    }
  };

  const artifactCategories = [
    { label: 'Movies', icon: Film },
    { label: 'Music', icon: Music },
    { label: 'Books', icon: Book },
    { label: 'Comics', icon: Bookmark },
    { label: 'Artists', icon: PenTool },
    { label: 'Websites', icon: Globe },
    { label: 'Locations', icon: MapPin },
    { label: 'Activities', icon: Activity },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-32 h-[80vh]"
    >
      {/* Left side: Neural Interaction */}
      <section className="lg:col-span-8 flex flex-col gap-8 h-full">
        <div className="flex bg-surface-container-low border-b-4 border-primary shrink-0">
          <button 
            onClick={() => setActiveTab('dialogue')}
            className={`flex-1 py-4 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${activeTab === 'dialogue' ? 'bg-primary text-on-primary' : 'hover:bg-primary/10'}`}
          >
            <TerminalIcon className="w-4 h-4" /> Chat
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`flex-1 py-4 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${activeTab === 'archive' ? 'bg-primary text-on-primary' : 'hover:bg-primary/10'}`}
          >
            <Database className="w-4 h-4" /> Favorites
          </button>
          <button 
            onClick={() => setActiveTab('discovery')}
            className={`flex-1 py-4 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${activeTab === 'discovery' ? 'bg-primary text-on-primary' : 'hover:bg-primary/10'}`}
          >
            <Globe className="w-4 h-4" /> Discovery
          </button>
        </div>

        <div className="flex-grow glass-panel border-4 border-surface-container-highest overflow-hidden flex flex-col relative">
          <div className="scanline absolute inset-0 opacity-5 pointer-events-none"></div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'dialogue' ? (
              <motion.div 
                key="dialogue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col min-h-0"
              >
                <div 
                  ref={scrollRef}
                  className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10"
                >
                  <div className="p-4 bg-primary/5 border border-primary/20 text-xs font-mono text-primary animate-pulse">
                    ANAIS is ready. Ask anything — it has context from your journal, favorites, places, and activities.
                  </div>
                  
                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={msg.id || idx}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-6 ${msg.role === 'user' ? 'bg-secondary text-on-secondary shadow-[0_0_15px_rgba(var(--secondary),0.2)]' : 'bg-surface-container-high border-l-4 border-primary'} relative`}>
                        <div className="text-[10px] uppercase font-bold opacity-40 mb-2 tracking-widest">
                          {msg.role === 'user' ? 'SEEKER' : 'ANAÏS'}
                        </div>
                        <p className="text-sm font-body leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-surface-container-high p-6 border-l-4 border-primary">
                        <div className="flex gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-surface-container-low border-t-4 border-surface-container-highest flex gap-4 shrink-0">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-grow bg-surface-container-lowest border border-outline-variant p-4 font-mono text-sm focus:border-primary outline-none"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="bg-primary text-on-primary p-4 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ) : activeTab === 'archive' ? (
              <motion.div 
                key="archive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow p-8 overflow-y-auto custom-scrollbar"
              >
                <div className="mb-10 bg-surface-container-low p-6 border-b-4 border-primary">
                   <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                     <Pen className="w-4 h-4 text-primary" /> Add a Favorite
                   </h3>
                   <div className="flex flex-col md:flex-row gap-4">
                      <select 
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant p-4 font-mono text-xs outline-none focus:border-primary"
                      >
                         <option value="" disabled>Select a category</option>
                         {artifactCategories.map(c => (
                           <option key={c.label} value={c.label}>{c.label.toUpperCase()}</option>
                         ))}
                      </select>
                      <input 
                        type="text"
                        value={artifactName}
                        onChange={(e) => setArtifactName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleArchiveArtifact()}
                        placeholder="Artifact Title / Subject..."
                        className="flex-grow bg-surface-container-lowest border border-outline-variant p-4 font-mono text-xs outline-none focus:border-primary"
                      />
                      <button 
                         onClick={handleArchiveArtifact}
                         className="bg-primary text-on-primary px-8 py-4 font-bold uppercase tracking-widest text-[10px]"
                      >
                        Save
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {artifactCategories.map((c) => (
                    <div 
                      key={c.label} 
                      onClick={() => setSelectedCategory(c.label)}
                      className={`p-4 bg-surface-container-low border border-outline-variant flex flex-col items-center gap-2 hover:bg-primary/5 transition-colors group cursor-pointer ${selectedCategory === c.label ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <c.icon className={`w-6 h-6 group-hover:text-primary transition-colors ${selectedCategory === c.label ? 'text-primary' : 'text-on-surface-variant'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest group-hover:text-primary ${selectedCategory === c.label ? 'text-primary' : 'text-on-surface-variant'}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Saved Favorites</h4>
                  {artifacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {artifacts.map((a) => (
                        <div key={a.id} className="p-4 bg-surface-container-high border-l-4 border-primary">
                          <p className="font-bold text-sm truncate">{a.name}</p>
                          <p className="text-[10px] uppercase opacity-60 tracking-widest">{a.type}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 border-2 border-dashed border-outline-variant text-center opacity-30">
                      <p className="text-[10px] uppercase tracking-[0.3em]">Nothing saved yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="discovery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow p-8 overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tighter">Discover</h3>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">Recommendations based on your data. Monthly picks arrive by email.</p>
                  </div>
                  <button
                    onClick={handleDiscover}
                    disabled={isDiscovering}
                    className="px-6 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-95 transition-all"
                  >
                    {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    {isDiscovering ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.length > 0 ? recommendations.map((rec: any, idx: number) => (
                    <motion.div
                      key={rec.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className="glass-panel p-6 border-t-4 border-secondary flex flex-col gap-4 relative overflow-hidden group"
                    >
                      {/* Background icon */}
                      <div className="absolute -top-2 -right-2 text-secondary/10 group-hover:scale-110 transition-transform">
                        {rec.category === 'movie' && <Film className="w-20 h-20" />}
                        {rec.category === 'book' && <Book className="w-20 h-20" />}
                        {rec.category === 'music' && <Music className="w-20 h-20" />}
                        {(rec.category === 'comic' || rec.category === 'website') && <Globe className="w-20 h-20" />}
                        {(rec.category === 'place' || rec.category === 'event') && <MapPin className="w-20 h-20" />}
                      </div>

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold uppercase px-2 py-1 bg-secondary text-on-secondary">{rec.category}</span>
                            {rec.source === 'monthly' && (
                              <span className="text-[8px] font-bold uppercase px-2 py-1 bg-primary/20 text-primary">Monthly Pick</span>
                            )}
                          </div>
                          {rec.resonanceScore && (
                            <span className="text-[10px] font-mono text-secondary opacity-60">{rec.resonanceScore}% match</span>
                          )}
                        </div>
                        <h4 className="text-base font-bold uppercase mb-1 leading-tight">{rec.title}</h4>
                        <p className="text-xs opacity-60 leading-relaxed italic mb-2">"{rec.description}"</p>
                        {rec.url && (
                          <a href={rec.url} target="_blank" rel="noreferrer"
                            className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-1">
                            View <Send className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Rating section */}
                      <div className="relative z-10 pt-3 border-t border-outline-variant">
                        {rec.rated ? (
                          <div className="space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <span key={n} className={`text-base ${n <= rec.rating ? 'text-primary' : 'text-outline-variant'}`}>★</span>
                              ))}
                            </div>
                            {rec.ratingText && (
                              <p className="text-[10px] italic text-on-surface-variant opacity-70">"{rec.ratingText}"</p>
                            )}
                          </div>
                        ) : ratingOpenId === rec.id ? (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => setPendingRating(n)}
                                  className={`text-xl transition-colors ${n <= pendingRating ? 'text-primary' : 'text-outline-variant hover:text-primary/60'}`}>
                                  ★
                                </button>
                              ))}
                            </div>
                            <input
                              value={pendingRatingText}
                              onChange={e => setPendingRatingText(e.target.value)}
                              placeholder="Tell ANAIS more (optional)"
                              className="w-full bg-surface-container-lowest border border-outline-variant p-2 text-xs focus:border-secondary outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRate(rec.id, pendingRating, pendingRatingText)}
                                disabled={!pendingRating}
                                className="flex-1 py-2 bg-secondary text-on-secondary font-bold uppercase text-[10px] tracking-widest disabled:opacity-40 hover:brightness-110"
                              >
                                Save Rating
                              </button>
                              <button
                                onClick={() => setRatingOpenId(null)}
                                className="px-3 py-2 border border-outline-variant hover:bg-surface-container-high transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRatingOpenId(rec.id); setPendingRating(0); setPendingRatingText(''); }}
                            className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity"
                          >
                            Rate this →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-20 border-2 border-dashed border-outline-variant flex flex-col items-center justify-center opacity-40">
                      <Brain className="w-12 h-12 mb-4" />
                      <p className="text-[10px] uppercase font-bold tracking-widest mb-6 text-center">No recommendations yet.<br />Add some favorites first, then hit Refresh.</p>
                      <button onClick={handleDiscover} className="px-8 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-[10px]">
                        Get Recommendations
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Right side: Matrix Controls */}
      <aside className="lg:col-span-4 space-y-8 h-full overflow-y-auto custom-scrollbar pr-2">
        <div className="bg-surface-container-high p-8 border-t-8 border-secondary relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 opacity-10 rotate-12">
            <AnaisAvatar variant="oracle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTDtuCc-_H3f86cYequ6xRHkoMLA1_vXXOnwmY9be9-RPcyGzqjmJcY7x-bi2tLM90j7kVNcPi-Mq1Vzo2RRxN-bt_Ggt2eAE1sbTeSdVwb8rJlZzpjvTreEQ8GqF8xXI-1JWxNlZn9Re-PDAyS6CV4UzT5emfVaZp64NxJ84zhDhiz_sfRj-r9S0YRwXQx1FQHmP5lHQfgD7ezKBkyMZ7ARFroOaRbvieG4yzsbLx2HEDayDasCt2TrTkboAiPfXb8Rvdoc6fG_ji" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 shrink-0 border-2 border-secondary overflow-hidden">
                <AnaisAvatar variant="oracle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTDtuCc-_H3f86cYequ6xRHkoMLA1_vXXOnwmY9be9-RPcyGzqjmJcY7x-bi2tLM90j7kVNcPi-Mq1Vzo2RRxN-bt_Ggt2eAE1sbTeSdVwb8rJlZzpjvTreEQ8GqF8xXI-1JWxNlZn9Re-PDAyS6CV4UzT5emfVaZp64NxJ84zhDhiz_sfRj-r9S0YRwXQx1FQHmP5lHQfgD7ezKBkyMZ7ARFroOaRbvieG4yzsbLx2HEDayDasCt2TrTkboAiPfXb8Rvdoc6fG_ji" />
              </div>
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tighter">The Oracle</h3>
                <p className="text-[10px] font-label text-secondary font-bold uppercase tracking-widest">Your personal AI assistant</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-container-low p-6 border-b-2 border-secondary">
                <h4 className="text-[10px] font-bold uppercase text-on-surface-variant mb-4 tracking-widest">Your Data</h4>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                  <div className="flex justify-between border-b border-outline-variant pb-1">
                    <span className="opacity-60 uppercase">Favorites:</span>
                    <span className="font-bold">{counts.oracle}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-1">
                    <span className="opacity-60 uppercase">Links:</span>
                    <span className="font-bold">{counts.inner}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-1">
                    <span className="opacity-60 uppercase">Places:</span>
                    <span className="font-bold">{counts.seeker}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-1">
                    <span className="opacity-60 uppercase text-primary font-bold">Recs:</span>
                    <span className="font-bold text-primary">{counts.insights}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest mb-2 opacity-60">Actions</div>
                <button 
                  onClick={clearHistory}
                  className="w-full py-4 px-6 bg-error/10 border-2 border-error text-error font-bold text-xs uppercase tracking-widest hover:bg-error/20 transition-all active:scale-95 flex items-center justify-between"
                >
                  Clear Chat
                  <ShieldAlert className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCalibrateFilter}
                  className="w-full py-4 px-6 bg-surface-container-highest border-2 border-secondary text-secondary font-bold text-xs uppercase tracking-widest hover:bg-secondary/10 transition-all active:scale-95 flex items-center justify-between"
                >
                  Reset Context
                  <Activity className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-4 border-dotted border-outline-variant bg-surface-container-low/30">
          <p className="text-xs font-label text-on-surface-variant leading-relaxed italic">
            "We write to taste life twice, in the moment and in retrospection."
            <br/><br/>
            — ANAIS_MODEL_7
          </p>
        </div>
      </aside>
    </motion.div>
  );
}
