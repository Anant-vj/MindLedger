import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { isAfter, isBefore, startOfToday, parseISO } from 'date-fns';

export function useProductivity() {
  const { tasks } = useData();

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
    // High workload
    const activeTasksCount = tasks.filter(t => !t.completed).length;
    
    let burnoutRisk = 'Low';
    if (activeTasksCount > 15) burnoutRisk = 'High';
    else if (activeTasksCount > 8) burnoutRisk = 'Moderate';

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      productivityScore,
      burnoutRisk
    };
  }, [tasks]);

  return stats;
}
