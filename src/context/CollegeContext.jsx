import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { localDateString } from '../utils/dateUtils';

const STORAGE_KEY = 'studylog_college';
const EMPTY = { semesters: [] };

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || EMPTY; }
  catch { return EMPTY; }
}
function save(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

const Ctx = createContext(null);

export function CollegeProvider({ children }) {
  const [data, setData] = useState(load);

  const mutate = useCallback((fn) => {
    setData(prev => { const next = fn(prev); save(next); return next; });
  }, []);

  const addSemester = useCallback((name) => {
    const sem = { id: uuid(), name, courses: [] };
    mutate(d => ({ ...d, semesters: [...d.semesters, sem] }));
  }, [mutate]);

  const updateSemester = useCallback((semId, name) => {
    mutate(d => ({ ...d, semesters: d.semesters.map(s => s.id === semId ? { ...s, name } : s) }));
  }, [mutate]);

  const deleteSemester = useCallback((semId) => {
    mutate(d => ({ ...d, semesters: d.semesters.filter(s => s.id !== semId) }));
  }, [mutate]);

  const addCourse = useCallback((semId, courseData) => {
    const course = { id: uuid(), creditHours: null, ...courseData, entries: [] };
    mutate(d => ({
      ...d,
      semesters: d.semesters.map(s =>
        s.id === semId ? { ...s, courses: [...s.courses, course] } : s),
    }));
  }, [mutate]);

  const updateCourse = useCallback((semId, courseId, courseData) => {
    mutate(d => ({
      ...d,
      semesters: d.semesters.map(s =>
        s.id === semId
          ? { ...s, courses: s.courses.map(c => c.id === courseId ? { ...c, ...courseData } : c) }
          : s),
    }));
  }, [mutate]);

  const deleteCourse = useCallback((semId, courseId) => {
    mutate(d => ({
      ...d,
      semesters: d.semesters.map(s =>
        s.id === semId ? { ...s, courses: s.courses.filter(c => c.id !== courseId) } : s),
    }));
  }, [mutate]);

  const addEntry = useCallback((semId, courseId, entryData) => {
    const entry = {
      id: uuid(), createdAt: new Date().toISOString(),
      name: '', type: 'Assignment', grade: '',
      date: localDateString(),
      timeSpentMinutes: 0, notes: '',
      ...entryData,
    };
    mutate(d => ({
      ...d,
      semesters: d.semesters.map(s =>
        s.id === semId ? {
          ...s,
          courses: s.courses.map(c =>
            c.id === courseId ? { ...c, entries: [...c.entries, entry] } : c),
        } : s),
    }));
  }, [mutate]);

  const updateEntry = useCallback((semId, courseId, entryId, entryData) => {
    mutate(d => ({
      ...d,
      semesters: d.semesters.map(s =>
        s.id === semId ? {
          ...s,
          courses: s.courses.map(c =>
            c.id === courseId ? {
              ...c,
              entries: c.entries.map(e => e.id === entryId ? { ...e, ...entryData } : e),
            } : c),
        } : s),
    }));
  }, [mutate]);

  const deleteEntry = useCallback((semId, courseId, entryId) => {
    mutate(d => ({
      ...d,
      semesters: d.semesters.map(s =>
        s.id === semId ? {
          ...s,
          courses: s.courses.map(c =>
            c.id === courseId ? { ...c, entries: c.entries.filter(e => e.id !== entryId) } : c),
        } : s),
    }));
  }, [mutate]);

  const bulkLoad = useCallback((newData) => { save(newData); setData(newData); }, []);

  return (
    <Ctx.Provider value={{
      data,
      addSemester, updateSemester, deleteSemester,
      addCourse, updateCourse, deleteCourse,
      addEntry, updateEntry, deleteEntry,
      bulkLoad,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCollege() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCollege must be used within CollegeProvider');
  return ctx;
}
