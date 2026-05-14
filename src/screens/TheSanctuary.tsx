import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Target } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { db, collection, addDoc, serverTimestamp, onSnapshot, updateDoc, doc, query, orderBy } from '../lib/firebase';
import { toast } from 'sonner';

type Goal = {
  id: string;
  title: string;
  description?: string;
  targetDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: any;
};

const fmt = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const todayKey = fmt(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

export default function TheSanctuary() {
  const { user } = useFirebase();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      query(collection(db, 'users', user.uid, 'goals'), orderBy('targetDate', 'asc')),
      snap => setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Goal)))
    );
    return () => unsubscribe();
  }, [user]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const goalDateSet = new Set(goals.map(g => g.targetDate));

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const visibleGoals = selectedDate
    ? goals.filter(g => g.targetDate === selectedDate)
    : goals;

  const openForm = (dateKey?: string) => {
    setNewTitle('');
    setNewDesc('');
    setNewDate(dateKey ?? selectedDate ?? '');
    setShowForm(true);
  };

  const handleAdd = async () => {
    if (!user || !newTitle.trim() || !newDate) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        title: newTitle.trim(),
        description: newDesc.trim(),
        targetDate: newDate,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setShowForm(false);
      toast.success('Goal added.');
    } catch {
      toast.error('Failed to save goal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (goal: Goal) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', goal.id), {
        completed: !goal.completed,
      });
    } catch {
      toast.error('Could not update goal.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8 pb-32"
    >
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Target className="text-primary w-7 h-7" />
            <h2 className="text-4xl font-bold uppercase tracking-tighter text-on-surface">Goals</h2>
          </div>
          <p className="text-sm text-on-surface-variant">Track what you're working toward.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-[10px] hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        )}
      </header>

      {/* Add goal form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 border-l-8 border-primary space-y-4"
        >
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">New Goal</h4>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Goal title"
            className="w-full bg-surface-container-lowest border border-outline-variant p-3 text-sm focus:border-primary outline-none"
          />
          <textarea
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-surface-container-lowest border border-outline-variant p-3 text-sm focus:border-primary outline-none resize-none"
          />
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant p-3 text-sm focus:border-primary outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={isSaving || !newTitle.trim() || !newDate}
              className="flex-1 bg-primary text-on-primary py-3 font-bold uppercase tracking-widest text-[10px] hover:brightness-110 disabled:opacity-40 transition-all"
            >
              Save Goal
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-3 border border-outline-variant hover:bg-surface-container-high transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-7 glass-panel p-6 border-t-4 border-primary">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-primary/10 text-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold uppercase tracking-widest text-sm">{monthLabel}</h3>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-primary/10 text-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest opacity-40 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateKey = fmt(year, month, day);
              const hasGoals = goalDateSet.has(dateKey);
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={`aspect-square flex flex-col items-center justify-center gap-0.5 text-sm font-mono transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary'
                      : isToday
                      ? 'border-2 border-primary text-primary'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  <span>{day}</span>
                  {hasGoals && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-on-primary' : 'bg-primary'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
              <p className="text-[10px] text-on-surface-variant">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </p>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100"
              >
                Show all
              </button>
            </div>
          )}
        </div>

        {/* Goals list */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            {selectedDate ? 'Goals for this day' : `All Goals (${goals.length})`}
          </p>

          {visibleGoals.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-outline-variant">
              <p className="text-xs text-on-surface-variant opacity-40">
                {selectedDate ? 'No goals on this day.' : 'No goals yet.'}
              </p>
              {selectedDate && (
                <button
                  onClick={() => openForm(selectedDate)}
                  className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  Add one for this day
                </button>
              )}
            </div>
          ) : (
            visibleGoals.map(goal => (
              <div
                key={goal.id}
                className={`p-4 border-l-4 bg-surface-container-low flex items-start gap-3 transition-opacity ${
                  goal.completed ? 'border-outline-variant opacity-50' : 'border-primary'
                }`}
              >
                <button
                  onClick={() => handleToggle(goal)}
                  className={`mt-0.5 w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-colors ${
                    goal.completed
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant hover:border-primary'
                  }`}
                >
                  {goal.completed && <Check className="w-3 h-3 text-on-primary" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-snug ${goal.completed ? 'line-through' : ''}`}>
                    {goal.title}
                  </p>
                  {goal.description && (
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{goal.description}</p>
                  )}
                  {!selectedDate && (
                    <p className="text-[10px] text-primary opacity-60 mt-1 font-mono">
                      {new Date(goal.targetDate + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
