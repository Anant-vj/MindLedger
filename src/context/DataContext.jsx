import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('mindledger_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('mindledger_habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  // Sync Tasks
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setTasks([]);
      return;
    }

    const q = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Sync Habits
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setHabits([]);
      return;
    }

    const q = query(collection(db, 'habits'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHabits(habitList);
    });

    return unsubscribe;
  }, [currentUser]);

  // Persist to local storage
  useEffect(() => {
    if (tasks.length > 0 || !loading) {
      localStorage.setItem('mindledger_tasks', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  useEffect(() => {
    if (habits.length > 0 || !loading) {
      localStorage.setItem('mindledger_habits', JSON.stringify(habits));
    }
  }, [habits, loading]);

  // Task Actions
  const addTask = useCallback(async (task) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...task,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        completed: false
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }, [currentUser]);

  const updateTask = useCallback(async (id, updates) => {
    try {
      await updateDoc(doc(db, 'tasks', id), updates);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }, []);

  // Habit Actions
  const addHabit = useCallback(async (habit) => {
    try {
      await addDoc(collection(db, 'habits'), {
        ...habit,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        completions: [] // Array of ISO date strings
      });
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  }, [currentUser]);

  const toggleHabitCompletion = useCallback(async (id, dateStr) => {
    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      let newCompletions;
      if (habit.completions.includes(dateStr)) {
        newCompletions = habit.completions.filter(d => d !== dateStr);
      } else {
        newCompletions = [...habit.completions, dateStr];
      }

      await updateDoc(doc(db, 'habits', id), { completions: newCompletions });
    } catch (error) {
      console.error("Error toggling habit completion:", error);
    }
  }, [habits]);

  const deleteHabit = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'habits', id));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  }, []);

  const value = {
    tasks,
    habits,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addHabit,
    toggleHabitCompletion,
    deleteHabit
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
