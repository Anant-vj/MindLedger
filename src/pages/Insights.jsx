import React, { useMemo } from 'react';
import { Card } from '../components/ui';
import { useData } from '../context/DataContext';
import { useProductivity } from '../hooks/useProductivity';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Brain, 
  Target, 
  Zap, 
  ShieldAlert,
  Info
} from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444'];

export default function Insights() {
  const { tasks, habits } = useData();
  const { 
    productivityScore, 
    burnoutRisk, 
    habitConsistency,
    completedTasks,
    totalTasks
  } = useProductivity();

  // Task Distribution by Priority
  const priorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // Habit Completion Rate
  const habitData = useMemo(() => {
    return habits.map(h => ({
      name: h.title,
      completions: h.completions?.length || 0
    })).slice(0, 5);
  }, [habits]);

  const getInsightMessage = () => {
    if (burnoutRisk === 'High') {
      return {
        title: "Burnout Alert!",
        text: "Your workload density is extremely high while habit consistency is dropping. We recommend rescheduling 2-3 non-essential tasks and taking a 15-minute break.",
        icon: ShieldAlert,
        color: "text-red-600 bg-red-50 border-red-100"
      };
    }
    if (productivityScore > 80) {
      return {
        title: "Deep Flow State",
        text: "You're in the zone! Your efficiency is above peak performance. Keep this momentum but ensure you stay hydrated.",
        icon: Zap,
        color: "text-indigo-600 bg-indigo-50 border-indigo-100"
      };
    }
    return {
      title: "Keep it up!",
      text: "Maintain your current pace. Small, consistent efforts lead to major academic breakthroughs. Consider focusing on 'High' priority tasks next.",
      icon: Target,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    };
  };

  const insight = getInsightMessage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">AI-driven analytics to optimize your focus.</p>
      </div>

      <div className={cn("p-6 rounded-2xl border flex items-start gap-4", insight.color, "dark:bg-transparent dark:border-[#374151]")}>
        <div className="p-3 bg-white dark:bg-[#111827] rounded-xl shadow-sm border dark:border-[#374151]">
          <insight.icon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg dark:text-white">{insight.title}</h3>
          <p className="mt-1 text-sm opacity-90 dark:text-slate-300">{insight.text}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Over Time / Score Gauge */}
        <Card className="h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap size={18} className="text-[#6366F1]" /> Productivity Pulse
          </h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center">
              <div className="text-6xl font-black text-slate-900 dark:text-white">{productivityScore}%</div>
              <p className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest text-xs mt-2">Overall Efficiency</p>
            </div>
            {/* Simple Pie Gauge */}
            <div className="absolute inset-0">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: productivityScore },
                      { value: 100 - productivityScore }
                    ]}
                    innerRadius={80}
                    outerRadius={100}
                    startAngle={225}
                    endAngle={-45}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Task Priority Distribution */}
        <Card className="h-[400px]">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Brain size={18} className="text-[#6366F1]" /> Task Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-saas-border)', backgroundColor: 'var(--color-saas-card)', color: '#F9FAFB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs font-bold text-slate-400">
            {priorityData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name.toUpperCase()}
              </div>
            ))}
          </div>
        </Card>

        {/* Habit Performance */}
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <Target size={18} className="text-[#6366F1]" /> Habit Consistency
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-saas-border)', backgroundColor: 'var(--color-saas-card)', color: '#F9FAFB' }}
                />
                <Bar 
                  dataKey="completions" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="bg-slate-900 dark:bg-gradient-to-br dark:from-[#1F2937] dark:to-[#111827] text-white p-8 rounded-3xl relative overflow-hidden dark:border dark:border-[#374151]">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Did you know?</h2>
          <p className="text-slate-400 dark:text-slate-300 max-w-lg mb-6">
            Taking a 5-minute break every 25 minutes (Pomodoro technique) can increase university study productivity by up to 28%.
          </p>
          <div className="flex gap-4">
             <div className="flex flex-col">
              <span className="text-3xl font-bold">{completedTasks}</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Tasks Finished</span>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{habitConsistency}%</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Habit Level</span>
            </div>
          </div>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <Brain size={200} />
        </div>
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
