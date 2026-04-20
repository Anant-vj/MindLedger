import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { isAfter, isBefore, startOfToday, parseISO } from 'date-fns';

export function useProductivity() {
  const { tasks, habits } = useData();

  const stats = useMemo(() => {
    const today = startOfToday();
    
    // Task Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    const overdueTasks = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return isBefore(parseISO(t.dueDate), today);
    }).length;

    // Productivity Score: Weighted (Total Completed / Total) * 100
    // If overdue tasks exist, subtract from score
    const baseScore = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    const penalty = overdueTasks * 5; // -5% for each overdue task
    const productivityScore = Math.max(0, Math.min(100, Math.round(baseScore - penalty)));

    // Burnout Risk
    // High workload + Low habit consistency
    const highWorkload = tasks.filter(t => !t.completed).length > 10;
    
    // Habit Consistency
    let totalpossible = habits.length * 7; // Last 7 days
    let completionsCount = 0;
    habits.forEach(h => {
      completionsCount += h.completions?.length || 0;
    });
    
    const habitConsistency = habits.length === 0 ? 100 : Math.min(100, (completionsCount / (habits.length * 7)) * 100);
    
    let burnoutRisk = 'Low';
    if (highWorkload && habitConsistency < 50) burnoutRisk = 'High';
    else if (highWorkload || habitConsistency < 70) burnoutRisk = 'Moderate';

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      productivityScore,
      burnoutRisk,
      habitConsistency: Math.round(habitConsistency)
    };
  }, [tasks, habits]);

  return stats;
}
