import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { useData } from '../context/DataContext';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Calendar,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    estimatedEffort: '1'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTask(formData);
    setIsAdding(false);
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      estimatedEffort: '1'
    });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      const priorityMap = { High: 0, Medium: 1, Low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    }
    return a.completed ? 1 : -1;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Task Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organize your academic workload effectively.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus size={20} /> Add New Task
        </Button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-2 border-[#6366F1]/20 animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Task</h2>
              <button onClick={() => setIsAdding(false)} type="button" className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Task Title</label>
                  <Input 
                    required 
                    placeholder="e.g. Finish Operating Systems Project"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Description</label>
                  <textarea 
                    className="input-field min-h-[100px] py-3"
                    placeholder="Break down the requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Priority</label>
                  <select 
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Effort (Hours)</label>
                  <Input 
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.estimatedEffort}
                    onChange={(e) => setFormData({...formData, estimatedEffort: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Due Date</label>
                  <Input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-gray-600">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <Card 
              key={task.id} 
              className={cn(
                "group transition-all hover:border-[#6366F1]/50 border border-slate-100 dark:border-gray-700",
                task.completed && "opacity-60 bg-slate-50 dark:bg-gray-900"
              )}
            >
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => updateTask(task.id, { completed: !task.completed })}
                  className="mt-1 text-slate-400 hover:text-brand-primary transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare className="text-brand-primary" size={24} />
                  ) : (
                    <Square size={24} />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-bold text-lg text-slate-900 dark:text-white truncate",
                      task.completed && "line-through text-slate-400 dark:text-slate-500"
                    )}>
                      {task.title}
                    </h3>
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                      task.priority === 'High' ? 'bg-red-100 text-red-600' : 
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {task.dueDate || 'No date'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {task.estimatedEffort} hours
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-slate-200 dark:border-gray-600">
            <AlertCircle className="mx-auto mb-4 text-slate-200 dark:text-gray-600" size={64} />
            <h3 className="text-xl font-bold text-slate-400 dark:text-gray-400">No tasks found</h3>
            <p className="text-slate-400 dark:text-gray-500 mt-1">Start by adding your first task above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
