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
  const [loading, setLoading] = useState(true);

  // Sync Tasks
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log("Setting up tasks listener for user:", currentUser.uid);
    // Move from root 'tasks' to 'users/{uid}/tasks' for security and isolation
    const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
    
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Tasks updated: ${taskList.length} found`);
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      console.error("onSnapshot error (tasks):", error);
    });

    return unsubscribe;
  }, [currentUser, authLoading]);

  // Persist to local storage
  useEffect(() => {
    if (tasks.length > 0 || !loading) {
      localStorage.setItem('mindledger_tasks', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  // Task Actions
  const addTask = useCallback(async (taskData) => {
    if (!currentUser) {
      console.error("Cannot add task: No user logged in");
      return;
    }

    console.log("Attempting to add task:", taskData);
    try {
      const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        completed: false
      });
      console.log("Task saved successfully with ID:", docRef.id);
    } catch (error) {
      console.error("Firestore write failed (addTask):", error);
    }
  }, [currentUser]);

  const updateTask = useCallback(async (id, updates) => {
    if (!currentUser) return;
    
    console.log(`Attempting to update task ${id}:`, updates);
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'tasks', id);
      await updateDoc(docRef, updates);
      console.log("Task updated successfully");
    } catch (error) {
      console.error("Firestore write failed (updateTask):", error);
    }
  }, [currentUser]);

  const deleteTask = useCallback(async (id) => {
    if (!currentUser) return;

    console.log(`Attempting to delete task ${id}`);
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'tasks', id);
      await deleteDoc(docRef);
      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Firestore write failed (deleteTask):", error);
    }
  }, [currentUser]);

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
