import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'studylog_leetcode';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useLeetCode() {
  const [entries, setEntries] = useState(load);

  const addEntry = useCallback((data) => {
    const entry = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      problemName: '',
      problemNumber: null,
      difficulty: 'Medium',
      status: 'Solved',
      topics: [],
      timeSpentMinutes: 0,
      notes: '',
      url: '',
      date: new Date().toISOString().slice(0, 10),
      ...data,
    };
    setEntries(prev => {
      const next = [entry, ...prev];
      save(next);
      return next;
    });
    return entry;
  }, []);

  const updateEntry = useCallback((id, data) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...data } : e);
      save(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const bulkLoad = useCallback((newEntries) => {
    save(newEntries);
    setEntries(newEntries);
  }, []);

  return { entries, addEntry, updateEntry, deleteEntry, bulkLoad };
}
