import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { useData } from '../context/DataContext';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Check, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { 
  format, 
  startOfToday, 
  subDays, 
  isSameDay, 
  parseISO,
  startOfWeek,
  addDays,
  isAfter
} from 'date-fns';

export default function Habits() {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  
  const today = startOfToday();
  const weekDays = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    await addHabit({ title: newHabitTitle });
    setNewHabitTitle('');
    setIsAdding(false);
  };

  const getStreak = (completions) => {
    if (!completions || completions.length === 0) return 0;
    let streak = 0;
    let curr = today;
    
    // Simple streak: consecutive days counting back from today
    while (true) {
      const dateStr = format(curr, 'yyyy-MM-dd');
      if (completions.includes(dateStr)) {
        streak++;
        curr = subDays(curr, 1);
      } else {
        // If today isn't completed, check yesterday to continue a streak
        if (streak === 0 && isSameDay(curr, today)) {
          curr = subDays(curr, 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Habit Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Build consistency and track your daily streaks.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus size={20} /> New Habit
        </Button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-2 border-[#6366F1]/20 animate-in fade-in zoom-in duration-200">
             <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
              <Input 
                autoFocus
                placeholder="Habit Name (e.g. 25m Focus Session, Morning Meditation)"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  <X size={20} />
                </Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        {habits.length > 0 ? (
          habits.map(habit => (
            <Card key={habit.id} className="p-0 overflow-hidden group">
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#6366F1]/10 text-[#6366F1] rounded-2xl group-hover:bg-[#6366F1] group-hover:text-white transition-all">
                    <Flame size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{habit.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                      <TrendingUp size={12} />
                      Current Streak: {getStreak(habit.completions)} days
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-gray-900/50">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isCompleted = habit.completions?.includes(dateStr);
                    const isToday = isSameDay(day, today);

                    return (
                      <div key={dateStr} className="flex flex-col items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-tighter",
                          isToday ? "text-brand-primary" : "text-slate-400"
                        )}>
                          {format(day, 'EEE')}
                        </span>
                        <button
                          onClick={() => toggleHabitCompletion(habit.id, dateStr)}
                          className={cn(
                            "w-full aspect-square rounded-xl flex items-center justify-center transition-all border-2",
                            isCompleted 
                              ? "bg-[#6366F1] border-[#6366F1] text-white scale-100 shadow-md shadow-[#6366F1]/20" 
                              : "bg-white dark:bg-[#111827] border-slate-100 dark:border-gray-700 text-slate-300 dark:text-gray-500 hover:border-slate-300 dark:hover:border-gray-500 scale-95"
                          )}
                        >
                          {isCompleted ? <Check size={20} strokeWidth={3} /> : <span className="text-sm font-bold">{format(day, 'd')}</span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
            <Flame className="mx-auto mb-4 text-slate-200 dark:text-gray-600" size={64} />
            <h3 className="text-xl font-bold text-slate-400 dark:text-gray-300">No habits tracked yet</h3>
            <p className="text-slate-400 dark:text-gray-500 mt-1">Consistency is key to wellbeing. Add your first habit!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
