import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Flame, 
  BarChart3, 
  LogOut,
  BrainCircuit,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { cn } from '../ui';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/habits', label: 'Habits', icon: Flame },
  { path: '/planner', label: 'Planner', icon: CalendarDays },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
];

export default function Sidebar({ isOpen, setIsOpen, isDark, setIsDark }) {
  const { logout } = useAuth();

  return (
    <aside 
      className={cn(
        "bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 dark:bg-[#0B0F19] dark:border-[#374151]",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className={cn("p-6 flex items-center h-20", isOpen ? "justify-between" : "justify-center")}>
        <div className={cn("flex items-center gap-3", !isOpen && "hidden")}>
          <div className="p-2 bg-brand-primary rounded-xl flex-shrink-0">
            <BrainCircuit className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight truncate">MindLedger</h1>
        </div>
        {!isOpen && (
           <div className="p-2 bg-brand-primary rounded-xl flex-shrink-0 cursor-pointer" onClick={() => setIsOpen(true)}>
             <BrainCircuit className="text-white" size={24} />
           </div>
        )}
        {isOpen && (
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-slate-800 text-slate-400">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
              isActive 
                ? 'bg-brand-primary/10 text-brand-primary font-semibold' 
                : 'hover:bg-slate-800 hover:text-white',
              !isOpen && 'justify-center px-0'
            )}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {isOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800 space-y-2">
        <button
          onClick={() => setIsDark(!isDark)}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all",
            !isOpen && 'justify-center px-0'
          )}
          title={!isOpen ? "Toggle Theme" : undefined}
        >
          {isDark ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
          {isOpen && <span className="truncate">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all",
            !isOpen && 'justify-center px-0'
          )}
          title={!isOpen ? "Logout" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
