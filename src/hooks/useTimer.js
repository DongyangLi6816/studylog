import { useState, useEffect } from 'react';

const KEY = 'studylog_timer';
const IDLE = {
  status: 'idle',       // 'idle' | 'running' | 'paused'
  startedAt: null,      // Date.now() of when the current run began
  elapsedMs: 0,         // accumulated ms before current run
  category: 'leetcode', // 'leetcode' | 'college'
  taskName: '',
  semId: null,
  courseId: null,
};

function load() {
  try { return { ...IDLE, ...JSON.parse(localStorage.getItem(KEY)) }; }
  catch { return IDLE; }
}
function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

function formatTime(ms) {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

export function useTimer() {
  const [state, setState] = useState(load);
  const [now, setNow] = useState(Date.now);

  // Tick every second while running
  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  const elapsedMs = state.status === 'running' && state.startedAt
    ? state.elapsedMs + (now - state.startedAt)
    : state.elapsedMs;

  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));
  const display = formatTime(elapsedMs);
  const isActive = state.status === 'running' || state.status === 'paused';

  const mutate = (next) => { save(next); setState(next); };

  const start = (taskInfo) => mutate({
    ...IDLE, status: 'running', startedAt: Date.now(), elapsedMs: 0, ...taskInfo,
  });

  const pause = () => mutate({
    ...state, status: 'paused', elapsedMs, startedAt: null,
  });

  const resume = () => mutate({
    ...state, status: 'running', startedAt: Date.now(),
  });

  const stop = () => {
    const result = {
      category: state.category,
      taskName: state.taskName,
      semId: state.semId,
      courseId: state.courseId,
      elapsedMs,
      elapsedMinutes,
    };
    mutate(IDLE);
    return result;
  };

  const reset = () => mutate(IDLE);

  const update = (patch) => {
    const next = { ...state, ...patch };
    save(next); setState(next);
  };

  return { state, elapsedMs, elapsedMinutes, display, isActive, start, pause, resume, stop, reset, update };
}
