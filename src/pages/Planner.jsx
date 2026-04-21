import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  format, 
  eachDayOfInterval,
  isSameDay,
  startOfToday
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  Trash2,
  Calendar,
  BarChart2,
  X,
  RotateCcw
} from 'lucide-react';
import { Card, Button, Input, cn } from '../components/ui';

// Planner Analytics embedded here
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, ComposedChart
} from 'recharts';

export default function Planner() {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Date Helpers
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  // Format for weekId: "2026-16"
  const weekId = format(weekStart, "yyyy-'W'II");
  
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const [activeTab, setActiveTab] = useState(format(startOfToday(), 'EEEE'));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const [recurringTasks, setRecurringTasks] = useState([]);
  const [isAddingRecurring, setIsAddingRecurring] = useState(false);
  const [newRecurringTask, setNewRecurringTask] = useState({
    title: '',
    days: [] // e.g. ['Monday', 'Wednesday']
  });

  useEffect(() => {
    if (!currentUser || !weekId) return;
    console.log("Setting up recurring tasks listener for user:", currentUser.uid, "weekId:", weekId);
    
    // Fixed path: users/{uid}/planner/recurring/tasks (5 segments - collection)
    const recurringRef = collection(db, "users", currentUser.uid, "planner", "recurring", "tasks");
    
    const unsubscribe = onSnapshot(recurringRef, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Recurring tasks updated:", tasks.length);
      setRecurringTasks(tasks);
    }, (error) => {
      console.error("onSnapshot error (recurring):", error);
    });
    return () => unsubscribe();
  }, [currentUser, weekId]);

  const handleAddRecurringTask = async (e) => {
    e.preventDefault();
    if (!newRecurringTask.title.trim() || newRecurringTask.days.length === 0) return;
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const taskData = {
      title: newRecurringTask.title.trim(),
      days: newRecurringTask.days,
      createdAt: serverTimestamp(),
      type: 'recurring'
    };

    console.log("Attempting to save recurring task:", taskData);
    try {
      const tasksRef = collection(db, "users", currentUser.uid, "planner", "recurring", "tasks");
      const docRef = await addDoc(tasksRef, taskData);
      console.log("Recurring task saved with ID:", docRef.id);
      setNewRecurringTask({ title: '', days: [] });
      setIsAddingRecurring(false);
    } catch (err) {
      console.error("Firestore write failed (recurring):", err);
    }
  };

  const toggleDay = (day) => {
    setNewRecurringTask(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="text-brand-primary" /> Weekly Planner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-white dark:bg-[#111827] p-2 rounded-xl shadow-sm border border-slate-100 dark:border-[#374151]">
            <Button variant="ghost" className="px-2" onClick={prevWeek}>
              <ChevronLeft size={20} />
            </Button>
            <span className="font-semibold px-4 cursor-pointer text-slate-900 dark:text-[#F9FAFB]" onClick={() => setCurrentDate(new Date())}>
              This Week
            </span>
            <Button variant="ghost" className="px-2" onClick={nextWeek}>
              <ChevronRight size={20} />
            </Button>
          </div>
          <Button 
            onClick={() => setIsAddingRecurring(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Recurring Task</span>
          </Button>
        </div>
      </div>

      {/* Adding Recurring Task Modal */}
      {isAddingRecurring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-indigo-500/20 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Recurring Task</h2>
              <button 
                onClick={() => setIsAddingRecurring(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddRecurringTask} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Task Title</label>
                <Input 
                  autoFocus
                  placeholder="e.g. Weekly Review, Gym, Reading..."
                  value={newRecurringTask.title}
                  onChange={(e) => setNewRecurringTask({...newRecurringTask, title: e.target.value})}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Repeat on</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                        newRecurringTask.days.includes(day)
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-white dark:bg-[#111827] border-slate-200 dark:border-[#374151] text-slate-600 dark:text-slate-400 hover:border-indigo-400"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsAddingRecurring(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!newRecurringTask.title.trim() || newRecurringTask.days.length === 0}
                >
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Analytics Section */}
      <PlannerAnalytics uid={currentUser?.uid} weekId={weekId} daysInWeek={daysInWeek} recurringTasks={recurringTasks} />

      {/* Mobile Tab Nav */}
      <div className="flex md:hidden overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {daysInWeek.map(day => (
          <button
            key={day.toISOString()}
            onClick={() => setActiveTab(format(day, 'EEEE'))}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm flex-shrink-0 transition-colors",
              activeTab === format(day, 'EEEE') 
                ? "bg-[#6366F1] text-white" 
                : "bg-white dark:bg-[#111827] text-slate-600 dark:text-[#9CA3AF] border border-slate-200 dark:border-[#374151]"
            )}
          >
            {format(day, 'EEE')}
          </button>
        ))}
      </div>

      {/* Desktop Columns / Mobile Active Tab */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {daysInWeek.map(day => (
          <div key={day.toISOString()} className={cn(
            "md:block",
            activeTab === format(day, 'EEEE') ? "block" : "hidden"
          )}>
            <DayColumn 
              dayDate={day} 
              uid={currentUser?.uid} 
              weekId={weekId} 
              recurringTasks={recurringTasks}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function DayColumn({ dayDate, uid, weekId, recurringTasks }) {
  const [oneOffTasks, setOneOffTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const dayName = format(dayDate, 'EEEE');
  const isTodayDate = isSameDay(dayDate, new Date());

  // One-off tasks listener
  useEffect(() => {
    if (!uid || !weekId) return;
    console.log("Setting up one-off tasks listener for day:", dayName, "weekId:", weekId);
    
    // Fixed path: users/{uid}/planner/weeks/{weekId}/days/{dayName}/tasks (9 segments total, but we use a valid one)
    // Actually, following user instructions for middle doc:
    const tasksRef = collection(db, 'users', uid, 'planner', `week_${weekId}`, `day_${dayName}_tasks`);
    
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`One-off tasks updated for ${dayName}:`, data.length);
      setOneOffTasks(data);
    }, (error) => {
      console.error(`onSnapshot error (one-off - ${dayName}):`, error);
    });
    return () => unsubscribe();
  }, [uid, weekId, dayName]);

  // Completions listener
  useEffect(() => {
    if (!uid || !weekId) return;
    // Fixed path: users/{uid}/planner/weeks/{weekId}/completions/{dayName} (6 segments)
    const compRef = doc(db, 'users', uid, 'planner', `week_${weekId}`, 'completions', dayName);
    const unsubscribe = onSnapshot(compRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompletions(docSnap.data());
      } else {
        setCompletions({});
      }
    }, (error) => {
      console.error(`onSnapshot error (completions - ${dayName}):`, error);
    });
    return () => unsubscribe();
  }, [uid, weekId, dayName]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    if (!uid) {
      console.error("No user logged in");
      return;
    }
    
    const taskData = {
      title: newTaskTitle.trim(),
      createdAt: serverTimestamp()
    };
    
    console.log(`Attempting to save task for ${dayName}:`, taskData);
    try {
      // Fixed path: users/{uid}/planner/weeks/{weekId}/days/{dayName}/tasks
      // Using a valid 5-segment path to comply with Firestore and user's "middle document" instruction
      const tasksRef = collection(db, 'users', uid, 'planner', `week_${weekId}`, `day_${dayName}_tasks`);
      const docRef = await addDoc(tasksRef, taskData);
      console.log("Task saved with ID:", docRef.id);
      setNewTaskTitle('');
    } catch (error) {
      console.error("Firestore write failed:", error);
    }
  };

  const toggleTask = React.useCallback(async (task) => {
    if (!uid || !weekId) return;
    try {
      const currentValue = !!completions[task.id];
      const compRef = doc(db, "users", uid, "planner", `week_${weekId}`, "completions", dayName);
      await setDoc(compRef, { [task.id]: !currentValue }, { merge: true });
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  }, [uid, weekId, dayName, completions]);

  const deleteTask = async (task) => {
    if (!uid || !weekId) return;
    try {
      console.log(`Deleting task: ${task.title} (Type: ${task.type || 'one-off'})`);
      if (task.type === 'recurring') {
        const docRef = doc(db, 'users', uid, 'planner', 'recurring', 'tasks', task.id);
        await deleteDoc(docRef);
        console.log("Recurring task series deleted");
      } else {
        const docRef = doc(db, 'users', uid, 'planner', `week_${weekId}`, `day_${dayName}_tasks`, task.id);
        await deleteDoc(docRef);
        console.log("One-off task deleted");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Combine relevant recurring tasks and one-off tasks
  const todaysRecurring = recurringTasks.filter(t => t.days && Array.isArray(t.days) && t.days.includes(dayName));
  const combinedTasks = [...todaysRecurring, ...oneOffTasks];
  
  // Create view models mapped to completion state
  const tasks = combinedTasks.map(t => ({
    ...t,
    completed: !!completions[t.id]
  })).sort((a, b) => {
    if (a.completed === b.completed) return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
    return a.completed ? 1 : -1;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <Card className={cn(
      "h-full flex flex-col p-4 bg-slate-50/50 dark:bg-[#0B0F19]/50",
      isTodayDate && "ring-2 ring-[#6366F1]/50 shadow-md"
    )}>
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-[#374151] pb-3">
        <div>
          <h3 className={cn(
            "font-bold",
            isTodayDate ? "text-[#6366F1]" : "text-slate-900 dark:text-white"
          )}>
            {dayName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">{format(dayDate, 'MMM d')}</p>
        </div>
        <span className="text-xs font-semibold bg-white dark:bg-[#111827] px-2 py-1 rounded-full text-slate-600 dark:text-[#F9FAFB] border border-slate-100 dark:border-[#374151]">
          {completedCount}/{tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-[250px] pr-1">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="group flex flex-col gap-1 bg-white dark:bg-[#1F2937] p-2.5 rounded-xl border border-slate-100 dark:border-[#374151] hover:border-[#6366F1]/50 transition-all text-sm"
          >
            <div className="flex items-start gap-2">
              <button 
                onClick={() => toggleTask(task)}
                className={cn(
                  "mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  task.completed 
                    ? "bg-[#10B981] border-[#10B981] text-white" 
                    : "border-slate-300 dark:border-gray-500 hover:border-[#6366F1]"
                )}
              >
                {task.completed && <Check size={12} strokeWidth={3} />}
              </button>
              <span className={cn(
                "flex-1 break-words flex items-center gap-2",
                task.completed ? "line-through text-slate-400 dark:text-gray-500" : "text-slate-700 dark:text-[#F9FAFB]"
              )}>
                {task.title}
                {task.type === 'recurring' && (
                  <RotateCcw size={10} className="text-indigo-400 flex-shrink-0" title="Recurring series" />
                )}
              </span>
              <button 
                onClick={() => deleteTask(task)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-gray-500 hover:text-[#EF4444] transition-opacity p-0.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-6 italic">
            No tasks yet
          </div>
        )}
      </div>

      <form onSubmit={handleAddTask} className="mt-4 pt-3 border-t border-slate-200 dark:border-[#374151]">
        <div className="relative">
          <Input 
            placeholder="Add task..." 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="pr-8 text-sm py-1.5 focus:ring-1 focus:ring-brand-primary"
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-primary hover:text-brand-primary/80 disabled:opacity-30"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </form>
    </Card>
  );
}

// Analytics Component handling its own subscription to all days of the current week
function PlannerAnalytics({ uid, weekId, daysInWeek, recurringTasks }) {
  const [weeklyData, setWeeklyData] = useState([]);
  
  useEffect(() => {
    if (!uid) return;

    // We must listen to all 7 day collections separately since they are dynamically path'd
    const unsubscribers = daysInWeek.map(day => {
      const dayName = format(day, 'EEEE');
      const shorts = format(day, 'EEE');
      
      const tasksRef = collection(db, 'users', uid, 'planner', `week_${weekId}`, `day_${dayName}_tasks`);
      const compRef = doc(db, 'users', uid, 'planner', `week_${weekId}`, 'completions', dayName);
      
      let localTasks = [];
      let localCompletions = {};

      const updateData = () => {
        // Filter recurring tasks for this specific day
        const todaysRecurring = recurringTasks.filter(rt => rt.days && rt.days.includes(dayName));
        const allTasks = [...todaysRecurring, ...localTasks];
        
        const total = allTasks.length;
        const completed = allTasks.filter(t => localCompletions[t.id]).length;
        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

        setWeeklyData(prev => {
          const newData = [...prev];
          const existIdx = newData.findIndex(d => d.name === shorts);
          const item = { 
            name: shorts, fullDate: day, 
            completed, total, completionRate: rate,
            moodScore: rate > 80 ? 9 : rate > 50 ? 7 : 5
          };
          if (existIdx >= 0) newData[existIdx] = item;
          else newData.push(item);
          newData.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
          return newData;
        });
      };

      const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
        localTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateData();
      }, (error) => {
        console.error("onSnapshot error (Analytics Tasks):", error);
      });

      const unsubComp = onSnapshot(compRef, (docSnap) => {
        localCompletions = docSnap.exists() ? docSnap.data() : {};
        updateData();
      }, (error) => {
        console.error("onSnapshot error (Analytics Comp):", error);
      });

      return () => { unsubTasks(); unsubComp(); };
    });

      return () => {
        unsubscribers.forEach(unsub => unsub());
        setWeeklyData([]); // clear on week change
      };
    }, [uid, weekId, recurringTasks]); // Include recurringTasks in dependencies

  // Simple Trend calculation logic
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <BarChart2 size={16} className="text-indigo-500" /> Weekly Completion (%)
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-700, #334155)" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400" />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-saas-border)', backgroundColor: 'var(--color-saas-card)', color: '#F9FAFB' }}
              />
              <Bar dataKey="completionRate" name="Completion %" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
           Task Completion vs Mood
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-700, #334155)" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400" />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400" />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor' }} className="text-slate-400" />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-saas-border)', backgroundColor: 'var(--color-saas-card)', color: '#F9FAFB' }}
              />
              <Bar yAxisId="left" dataKey="completed" name="Tasks Done" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="moodScore" name="Mood (1-10)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
