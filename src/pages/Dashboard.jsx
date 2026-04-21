import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useProductivity } from '../hooks/useProductivity';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  Plus,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  Angry,
  Heart
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { tasks } = useData();
  const { currentUser } = useAuth();
  const { 
    productivityScore, 
    burnoutRisk, 
    completedTasks, 
    overdueTasks
  } = useProductivity();

  const [mood, setMood] = useState(null);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!currentUser) return;
    const moodRef = doc(db, 'users', currentUser.uid, 'moods', todayStr);
    const unsubscribe = onSnapshot(moodRef, (docSnap) => {
      if (docSnap.exists()) {
        setMood(docSnap.data().value);
      }
    });
    return () => unsubscribe();
  }, [currentUser, todayStr]);

  const handleSetMood = async (value) => {
    if (!currentUser) return;
    try {
      const moodRef = doc(db, 'users', currentUser.uid, 'moods', todayStr);
      await setDoc(moodRef, { value, updatedAt: new Date().toISOString() });
      setMood(value);
    } catch (err) {
      console.error("Failed to save mood:", err);
    }
  };

  const moods = [
    { value: 'terrible', icon: Angry, color: 'text-red-500', label: 'Terrible', bg: 'bg-red-50 dark:bg-red-500/10' },
    { value: 'bad', icon: Frown, color: 'text-orange-500', label: 'Bad', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { value: 'okay', icon: Meh, color: 'text-amber-500', label: 'Okay', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { value: 'good', icon: Smile, color: 'text-emerald-500', label: 'Good', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { value: 'excellent', icon: Heart, color: 'text-indigo-500', label: 'Excellent', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  ];

  const activeTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#F9FAFB]">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-[#9CA3AF] mt-2 font-medium">Track your progress and wellbeing at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Productivity Score" 
          value={`${productivityScore}%`} 
          icon={TrendingUp}
          color="text-[#6366F1] bg-[#6366F1]/10 dark:bg-[#6366F1]/20"
          subtitle="Based on task efficiency"
        />
        <StatCard 
          title="Burnout Risk" 
          value={burnoutRisk} 
          icon={Activity}
          color={
            burnoutRisk === 'High' ? 'text-[#EF4444] bg-[#EF4444]/10 dark:bg-[#EF4444]/20' : 
            burnoutRisk === 'Moderate' ? 'text-[#F59E0B] bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20' : 
            'text-[#10B981] bg-[#10B981]/10 dark:bg-[#10B981]/20'
          }
          subtitle="Workload vs Consistency"
        />
        <StatCard 
          title="Completed Tasks" 
          value={completedTasks} 
          icon={CheckCircle2}
          color="text-[#10B981] bg-[#10B981]/10 dark:bg-[#10B981]/20"
          subtitle="Total tasks finished"
        />
      </div>

      {/* Mood Tracker */}
      <Card className="p-6 border-none shadow-lg bg-white dark:bg-[#111827]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">How are you feeling today?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your mood helps us adjust your productivity insights.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => handleSetMood(m.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 border-2",
                  mood === m.value 
                    ? `border-indigo-500 ${m.bg} scale-105 shadow-md` 
                    : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <m.icon size={28} className={m.color} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Up Next</h2>
            <Link to="/tasks">
              <Button variant="ghost" className="text-sm flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {activeTasks.length > 0 ? (
              activeTasks.map(task => (
                <div key={task.id} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-[#374151] hover:border-[#6366F1] transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-sm",
                      task.priority === 'High' ? 'bg-[#EF4444]' : task.priority === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#6366F1]'
                    )} />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-[#F9FAFB]">{task.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-[#9CA3AF] mt-0.5">{task.dueDate || 'No due date'}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-[#F9FAFB] bg-white dark:bg-[#111827] px-3 py-1 rounded-lg border border-slate-200 dark:border-[#374151] shadow-sm">
                    {task.estimatedEffort}h
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-[#374151] bg-slate-50 dark:bg-transparent">
                <CheckCircle2 className="mb-3 text-[#10B981]" size={40} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F9FAFB]">All Caught Up</h3>
                <p className="text-sm text-slate-500 dark:text-[#9CA3AF] mt-1 text-center mb-4">You have no pending tasks right now. Great job!</p>
                <Link to="/tasks">
                  <Button variant="outline" className="text-[#6366F1] dark:text-[#F9FAFB]">Add New Task</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white border-none shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
            <h2 className="text-xl font-bold mb-4 tracking-tight">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="text-white/90 font-medium">Pending Tasks</span>
                <span className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</span>
              </div>
            </div>
            <Link to="/tasks">
               <Button className="w-full mt-6 bg-white text-[#6366F1] hover:bg-slate-50 shadow-sm font-semibold">
                Add New Task
              </Button>
            </Link>
          </Card>

          <Card className="border-2 border-dashed border-slate-200 dark:border-[#374151] flex flex-col items-center justify-center p-8 text-slate-500 dark:text-[#9CA3AF] bg-transparent">
            <TrendingUp size={40} className="mb-3 text-[#6366F1] opacity-80" />
            <p className="text-sm font-medium text-center">Consistent task management leads to better academic results.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card className="relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-[#F9FAFB] mt-1.5 tracking-tight">{value}</h3>
          <p className="text-xs font-medium text-slate-400 dark:text-[#6B7280] mt-2">{subtitle}</p>
        </div>
        <div className={cn("p-2.5 rounded-xl", color)}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
