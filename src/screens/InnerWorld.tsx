import React, { useState, useEffect, useRef } from 'react';
import { TerminalIcon, LinkIcon, Brain, Send, Loader2, ChevronDown, ChevronUp, MessageSquare, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit, uploadFile, updateDoc, doc } from '../lib/firebase';
import { getDiaryReflection } from '../lib/gemini';
import { toast } from 'sonner';

type ConvMessage = { role: 'user' | 'ai'; content: string };

interface ReflectionPanelProps {
  entryText: string;
  conversation: ConvMessage[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSend: () => void;
  onDone: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

function ReflectionPanel({ entryText, conversation, input, setInput, loading, onSend, onDone, scrollRef }: ReflectionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel border-l-8 border-secondary flex flex-col"
      style={{ minHeight: '480px' }}
    >
      <div className="p-6 border-b border-outline-variant bg-surface-container-low/50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">Your Entry</p>
        <p className="text-sm text-on-surface-variant italic leading-relaxed line-clamp-3">{entryText}</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar" style={{ maxHeight: '380px' }}>
        {conversation.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container-high border-l-4 border-secondary text-on-surface'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                {msg.role === 'user' ? 'You' : 'ANAIS'}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-high border-l-4 border-secondary p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-secondary" />
              <span className="text-xs text-on-surface-variant">ANAIS is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-outline-variant bg-surface-container-low flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="Type your response..."
          disabled={loading}
          className="flex-1 bg-surface-container-lowest border border-outline-variant p-3 text-sm font-mono focus:border-secondary outline-none disabled:opacity-40"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="bg-secondary text-on-secondary p-3 hover:brightness-110 disabled:opacity-40 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={onDone}
          className="w-full py-3 border border-outline-variant text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors"
        >
          {conversation.length > 1 ? "I'm done for now" : 'Skip reflection'}
        </button>
      </div>
    </motion.div>
  );
}

export default function InnerWorld() {
  const { user, rewardXP } = useFirebase();

  // Write entry
  const [truth, setTruth] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reflection
  const [reflectionEntryId, setReflectionEntryId] = useState<string | null>(null);
  const [reflectionEntryText, setReflectionEntryText] = useState('');
  const [reflectionConversation, setReflectionConversation] = useState<ConvMessage[]>([]);
  const [reflectionInput, setReflectionInput] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const reflectionScrollRef = useRef<HTMLDivElement>(null);

  // My Links
  const [bridgePlatform, setBridgePlatform] = useState('');
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [isBridging, setIsBridging] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'write' | 'entries' | 'links'>('write');

  // Data
  const [memories, setMemories] = useState<any[]>([]);
  const [bridges, setBridges] = useState<any[]>([]);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const [counts, setCounts] = useState({ memories: 0, bridges: 0 });

  useEffect(() => {
    if (!user) return;

    const unsubMemories = onSnapshot(
      query(collection(db, 'users', user.uid, 'memories'), orderBy('createdAt', 'desc'), limit(30)),
      snap => {
        setMemories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCounts(prev => ({ ...prev, memories: snap.size }));
      }
    );
    const unsubBridges = onSnapshot(
      query(collection(db, 'users', user.uid, 'neural_bridges'), orderBy('createdAt', 'desc')),
      snap => {
        setBridges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCounts(prev => ({ ...prev, bridges: snap.size }));
      }
    );
    return () => { unsubMemories(); unsubBridges(); };
  }, [user]);

  useEffect(() => {
    reflectionScrollRef.current?.scrollTo({ top: reflectionScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [reflectionConversation, reflectionLoading]);

  // ─── Save entry and start reflection ───────────────────────────────────────

  const handleSaveEntry = async () => {
    if (!user || (!truth.trim() && !selectedImage) || isSyncing) return;
    setIsSyncing(true);
    const loadingToast = toast.loading('Saving entry...');

    let docId: string | null = null;
    const savedText = truth.trim();

    // Step 1: save to Firestore
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadFile(`users/${user.uid}/memories/${Date.now()}`, selectedImage);
      }

      const docRef = await addDoc(collection(db, 'users', user.uid, 'memories'), {
        text: savedText,
        imageUrl,
        createdAt: serverTimestamp(),
        reflection: { conversation: [], complete: false }
      });

      docId = docRef.id;
      await rewardXP(150, 60);
      setTruth('');
      setSelectedImage(null);
      setImagePreview(null);
      toast.success('Entry saved.', { id: loadingToast });
    } catch (e) {
      console.error('Save failed:', e);
      toast.error('Failed to save entry.', { id: loadingToast });
      setIsSyncing(false);
      return;
    } finally {
      setIsSyncing(false);
    }

    // Step 2: start reflection (entry is already saved — this failing won't lose data)
    setReflectionEntryId(docId);
    setReflectionEntryText(savedText);
    setReflectionConversation([]);
    setIsReflecting(true);
    setReflectionLoading(true);

    try {
      const aiResponse = await getDiaryReflection(savedText, [], 'questions');
      const firstMessage: ConvMessage = { role: 'ai', content: aiResponse };
      setReflectionConversation([firstMessage]);

      if (docId) {
        await updateDoc(doc(db, 'users', user.uid, 'memories', docId), {
          'reflection.conversation': [firstMessage]
        });
      }
    } catch (e) {
      console.error('Reflection start failed:', e);
      toast.error('Entry saved, but ANAIS could not start the reflection. Check your API key.');
    } finally {
      setReflectionLoading(false);
    }
  };

  // ─── Send a reply in the reflection conversation ────────────────────────────

  const handleReflectionSend = async () => {
    if (!reflectionInput.trim() || !reflectionEntryId || reflectionLoading) return;

    const userMsg: ConvMessage = { role: 'user', content: reflectionInput.trim() };
    const updatedConv = [...reflectionConversation, userMsg];
    setReflectionConversation(updatedConv);
    setReflectionInput('');
    setReflectionLoading(true);

    try {
      // First user reply → ask for reflection. All subsequent → followup.
      const stage = reflectionConversation.filter(m => m.role === 'user').length === 0
        ? 'reflect'
        : 'followup';

      const aiResponse = await getDiaryReflection(reflectionEntryText, updatedConv, stage);
      const aiMsg: ConvMessage = { role: 'ai', content: aiResponse };
      const finalConv = [...updatedConv, aiMsg];
      setReflectionConversation(finalConv);

      await updateDoc(doc(db, 'users', user.uid, 'memories', reflectionEntryId), {
        'reflection.conversation': finalConv
      });
    } catch (e) {
      console.error(e);
      toast.error('Something went wrong. Try again.');
    } finally {
      setReflectionLoading(false);
    }
  };

  // ─── Close reflection panel ─────────────────────────────────────────────────

  const handleDoneReflection = async () => {
    if (reflectionEntryId) {
      await updateDoc(doc(db, 'users', user.uid, 'memories', reflectionEntryId), {
        'reflection.complete': true
      });
    }
    setIsReflecting(false);
    setReflectionEntryId(null);
    setReflectionEntryText('');
    setReflectionConversation([]);
  };

  // ─── Open reflection for a past entry ──────────────────────────────────────

  const handleContinueReflection = async (memory: any) => {
    setReflectionEntryId(memory.id);
    setReflectionEntryText(memory.text);
    const existing: ConvMessage[] = memory.reflection?.conversation || [];
    setReflectionConversation(existing);
    setIsReflecting(true);

    // If there's no conversation yet, kick off questions
    if (existing.length === 0) {
      setReflectionLoading(true);
      try {
        const aiResponse = await getDiaryReflection(memory.text, [], 'questions');
        const firstMsg: ConvMessage = { role: 'ai', content: aiResponse };
        setReflectionConversation([firstMsg]);
        await updateDoc(doc(db, 'users', user.uid, 'memories', memory.id), {
          'reflection.conversation': [firstMsg]
        });
      } catch (e) {
        console.error(e);
      } finally {
        setReflectionLoading(false);
      }
    }
  };

  // ─── My Links ───────────────────────────────────────────────────────────────

  const handleAddBridge = async () => {
    if (!user || !bridgePlatform.trim() || !bridgeUrl.trim() || isBridging) return;
    setIsBridging(true);
    const loadingToast = toast.loading('Saving link...');
    try {
      await addDoc(collection(db, 'users', user.uid, 'neural_bridges'), {
        platform: bridgePlatform.trim(),
        url: bridgeUrl.trim(),
        createdAt: serverTimestamp()
      });
      await rewardXP(100, 40);
      setBridgePlatform('');
      setBridgeUrl('');
      toast.success('Link saved.', { id: loadingToast });
    } catch {
      toast.error('Failed to save link.', { id: loadingToast });
    } finally {
      setIsBridging(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-32"
    >
      <section className="md:col-span-8 space-y-6">
        {/* Tabs */}
        <div className="flex bg-surface-container-low border-b-4 border-secondary">
          {[
            { id: 'write', icon: TerminalIcon, label: 'Write Entry' },
            { id: 'entries', icon: BookOpen, label: `Past Entries (${counts.memories})` },
            { id: 'links', icon: LinkIcon, label: 'My Links' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id as any); if (isReflecting && id !== 'write') { /* let them navigate away */ } }}
              className={`flex-1 py-4 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                activeTab === id ? 'bg-secondary text-on-secondary' : 'hover:bg-secondary/10'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Write Entry / Reflection ── */}
          {activeTab === 'write' && (
            <motion.div key="write" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {isReflecting ? (
                <ReflectionPanel
                  entryText={reflectionEntryText}
                  conversation={reflectionConversation}
                  input={reflectionInput}
                  setInput={setReflectionInput}
                  loading={reflectionLoading}
                  onSend={handleReflectionSend}
                  onDone={handleDoneReflection}
                  scrollRef={reflectionScrollRef}
                />
              ) : (
                <div className="glass-panel p-8 border-l-8 border-secondary space-y-6">
                  <h3 className="text-2xl font-bold uppercase tracking-widest text-secondary flex items-center gap-3">
                    <Brain className="w-6 h-6" /> Journal Entry
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Write about your day, your thoughts, or anything on your mind. After you save, ANAIS will ask you a few questions before offering any reflection.
                  </p>
                  <textarea
                    value={truth}
                    onChange={e => setTruth(e.target.value)}
                    className="w-full bg-surface-container-lowest border-2 border-outline-variant p-4 font-mono text-sm min-h-[200px] focus:border-secondary outline-none resize-none"
                    placeholder="What's on your mind today?"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="max-h-40 border border-outline-variant" />
                  )}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-surface-container-highest border border-secondary text-secondary text-[10px] font-bold uppercase hover:bg-secondary/10"
                    >
                      Attach Image
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); }
                        }}
                      />
                    </button>
                    <button
                      onClick={handleSaveEntry}
                      disabled={isSyncing || (!truth.trim() && !selectedImage)}
                      className="bg-secondary text-on-secondary px-10 py-4 font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Entry
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Past Entries ── */}
          {activeTab === 'entries' && (
            <motion.div key="entries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {memories.length === 0 ? (
                <div className="glass-panel p-12 text-center border-l-8 border-secondary">
                  <BookOpen className="w-10 h-10 text-secondary mx-auto mb-4 opacity-40" />
                  <p className="text-sm text-on-surface-variant">No entries yet. Write your first one.</p>
                </div>
              ) : memories.map(memory => {
                const conv: ConvMessage[] = memory.reflection?.conversation || [];
                const hasReflection = conv.length > 0;
                const isExpanded = expandedEntryId === memory.id;

                return (
                  <div key={memory.id} className="glass-panel border-l-4 border-secondary overflow-hidden">
                    {/* Entry header */}
                    <div className="p-5 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
                          {formatDate(memory.createdAt)}
                          {hasReflection && (
                            <span className="ml-3 text-on-surface-variant opacity-60">
                              · {conv.length} reflection {conv.length === 1 ? 'message' : 'messages'}
                            </span>
                          )}
                        </p>
                        <p className="text-sm leading-relaxed text-on-surface line-clamp-2">{memory.text}</p>
                      </div>
                      <button
                        onClick={() => setExpandedEntryId(isExpanded ? null : memory.id)}
                        className="shrink-0 p-2 hover:bg-secondary/10 text-secondary transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded: full entry + reflection */}
                    {isExpanded && (
                      <div className="border-t border-outline-variant">
                        {/* Full entry text */}
                        <div className="p-5 bg-surface-container-low/40">
                          <p className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">{memory.text}</p>
                        </div>

                        {/* Existing reflection thread */}
                        {hasReflection && (
                          <div className="p-5 space-y-4 border-t border-outline-variant">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Reflection</p>
                            {conv.map((msg: ConvMessage, i: number) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 text-sm ${
                                  msg.role === 'user'
                                    ? 'bg-secondary/20 text-on-surface border-r-4 border-secondary'
                                    : 'bg-surface-container-high border-l-4 border-secondary'
                                }`}>
                                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                                    {msg.role === 'user' ? 'You' : 'ANAIS'}
                                  </p>
                                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Continue / start reflection button */}
                        {!memory.reflection?.complete && (
                          <div className="p-5 border-t border-outline-variant">
                            <button
                              onClick={() => {
                                handleContinueReflection(memory);
                                setActiveTab('write');
                              }}
                              className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary font-bold uppercase tracking-widest text-[10px] hover:brightness-110"
                            >
                              <MessageSquare className="w-4 h-4" />
                              {hasReflection ? 'Continue Reflection' : 'Start Reflection'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ── My Links ── */}
          {activeTab === 'links' && (
            <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel p-8 border-l-8 border-tertiary space-y-6">
              <h3 className="text-2xl font-bold uppercase tracking-widest text-tertiary flex items-center gap-3">
                <LinkIcon className="w-6 h-6" /> My Links
              </h3>
              <p className="text-sm text-on-surface-variant">
                Add your online profiles (SoundCloud, Instagram, portfolio, etc.). ANAIS references these when you chat.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  value={bridgePlatform}
                  onChange={e => setBridgePlatform(e.target.value)}
                  placeholder="Platform name"
                  className="bg-surface-container-lowest border border-outline-variant p-3 text-sm focus:border-tertiary outline-none"
                />
                <input
                  value={bridgeUrl}
                  onChange={e => setBridgeUrl(e.target.value)}
                  placeholder="URL"
                  className="bg-surface-container-lowest border border-outline-variant p-3 text-sm focus:border-tertiary outline-none"
                />
                <button
                  onClick={handleAddBridge}
                  disabled={isBridging || !bridgePlatform || !bridgeUrl}
                  className="bg-tertiary text-on-tertiary font-bold uppercase tracking-widest py-3 hover:brightness-110 disabled:opacity-50"
                >
                  Add Link
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                {bridges.map(b => (
                  <div key={b.id} className="p-4 bg-surface-container-low border border-outline-variant flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-tertiary">{b.platform}</p>
                      <p className="text-[10px] text-on-surface-variant truncate max-w-[200px]">{b.url}</p>
                    </div>
                    <LinkIcon className="w-4 h-4 text-tertiary opacity-40" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Sidebar */}
      <aside className="md:col-span-4 space-y-8">
        <div className="p-6 border-4 border-dotted border-outline-variant bg-surface-container-low/30">
          <h5 className="text-[10px] font-bold mb-4 opacity-60 uppercase tracking-widest">Overview</h5>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] uppercase">
              <span>Journal Entries:</span>
              <span className="font-bold">{counts.memories}</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase">
              <span>Links:</span>
              <span className="font-bold">{counts.bridges}</span>
            </div>
          </div>
        </div>

        {isReflecting && (
          <div className="p-5 bg-secondary/10 border border-secondary text-sm text-on-surface leading-relaxed">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2">How this works</p>
            <p className="text-xs text-on-surface-variant">
              ANAIS asks questions before offering any reflection. Answer honestly — the more you give, the more useful the reflection. You can push back if it misreads you.
            </p>
          </div>
        )}
      </aside>
    </motion.div>
  );
}
