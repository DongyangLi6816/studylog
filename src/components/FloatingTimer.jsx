import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useTodos } from '../context/TodosContext';
import { useCollege } from '../hooks/useCollege';
import { useLeetCodeLookup } from '../hooks/useLeetCodeLookup';
import { DIFFICULTY_COLORS } from '../utils/leetcodeConstants';

const inputCls = `w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500`;

const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

function LeetCodeInput({ onReady }) {
  const { lookupByNumber, searchByName } = useLeetCodeLookup();
  const [input, setInput] = useState('');
  const [matched, setMatched] = useState(null);
  const [results, setResults] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef(null);

  // Smart debounce: pure digits → number lookup, text → name search
  useEffect(() => {
    const val = input.trim();
    if (!val) { setMatched(null); setResults([]); setShowDrop(false); onReady(null); return; }

    const isNum = /^\d+$/.test(val);
    const delay = isNum ? 300 : 250;

    const id = setTimeout(() => {
      if (isNum) {
        const m = lookupByNumber(val);
        setMatched(m || null);
        setResults([]);
        setShowDrop(false);
        onReady(m ? m.title : val); // fall back to typed text if not found
      } else {
        const res = searchByName(val);
        setResults(res);
        setShowDrop(res.length > 0);
        setMatched(null);
        onReady(val); // let user type name directly
      }
    }, delay);
    return () => clearTimeout(id);
  }, [input, lookupByNumber, searchByName, onReady]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const pick = (r) => {
    setInput(`${r.num} – ${r.title}`);
    setMatched(r);
    setResults([]);
    setShowDrop(false);
    onReady(r.title);
  };

  return (
    <div className="space-y-2">
      <label className={labelCls}>Problem # or Name</label>
      <div className="relative" ref={dropRef}>
        <input
          className={inputCls}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="49  or  Group Anagram…"
          autoComplete="off"
        />
        {showDrop && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-44 overflow-y-auto">
            {results.map(r => (
              <button key={r.num} type="button" onMouseDown={() => pick(r)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="font-medium text-slate-900 dark:text-white">#{r.num} {r.title}</span>
                <span className={`ml-1.5 font-semibold px-1 py-0.5 rounded text-[10px] ${DIFFICULTY_COLORS[r.difficulty] || ''}`}>
                  {r.difficulty}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Match badge */}
      {matched && (
        <p className={`text-xs font-medium px-2 py-1 rounded-lg ${DIFFICULTY_COLORS[matched.difficulty] || 'text-slate-500'} bg-opacity-20`}>
          ✓ #{matched.num} · {matched.title} · {matched.difficulty}
        </p>
      )}
    </div>
  );
}

function IdleForm({ timer, collegeData }) {
  const [category, setCategory] = useState(timer.state.category === 'todo' ? 'leetcode' : timer.state.category);
  const [lcTaskName, setLcTaskName] = useState(''); // resolved from LeetCodeInput
  const [taskName, setTaskName] = useState(timer.state.taskName);
  const [semId, setSemId] = useState(timer.state.semId || '');
  const [courseId, setCourseId] = useState(timer.state.courseId || '');

  const semesters = collegeData.semesters || [];
  const courses = semesters.find(s => s.id === semId)?.courses || [];

  const handleStart = () => {
    if (category === 'leetcode') {
      if (!lcTaskName?.trim()) return;
      timer.start({ category, taskName: lcTaskName.trim(), semId: null, courseId: null, linkedTodoId: null });
    } else {
      if (!taskName.trim()) return;
      timer.start({ category, taskName: taskName.trim(), semId: semId || null, courseId: courseId || null, linkedTodoId: null });
    }
  };

  const canStart = category === 'leetcode' ? !!lcTaskName?.trim() : !!taskName.trim();

  return (
    <div className="space-y-3">
      {/* Category toggle */}
      <div>
        <label className={labelCls}>Category</label>
        <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
          {['leetcode', 'college'].map(c => (
            <button key={c} type="button" onClick={() => setCategory(c)}
              className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors ${
                category === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}>
              {c === 'leetcode' ? 'LeetCode' : 'College'}
            </button>
          ))}
        </div>
      </div>

      {/* LeetCode: smart number/name input */}
      {category === 'leetcode' && (
        <LeetCodeInput onReady={setLcTaskName} />
      )}

      {/* College: semester/course selectors + entry name */}
      {category === 'college' && (
        <>
          <div>
            <label className={labelCls}>Semester</label>
            <select className={inputCls} value={semId} onChange={e => { setSemId(e.target.value); setCourseId(''); }}>
              <option value="">Select semester…</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {semId && (
            <div>
              <label className={labelCls}>Course</label>
              <select className={inputCls} value={courseId} onChange={e => setCourseId(e.target.value)}>
                <option value="">Select course…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={labelCls}>Entry Name</label>
            <input className={inputCls} value={taskName} onChange={e => setTaskName(e.target.value)}
              placeholder="e.g. Assignment 3"
              onKeyDown={e => e.key === 'Enter' && handleStart()} />
          </div>
        </>
      )}

      <button onClick={handleStart} disabled={!canStart}
        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium transition-colors">
        Start Timer
      </button>
    </div>
  );
}

function ActiveDisplay({ timer, onStop }) {
  const { state, display } = timer;
  const isLinkedToTodo = !!state.linkedTodoId;
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className={`text-4xl font-mono font-bold text-slate-900 dark:text-white ${state.status === 'running' ? 'animate-pulse' : ''}`}>
          {display}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{state.taskName}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
          {state.status === 'running' ? 'Running…' : 'Paused'}
          {isLinkedToTodo && ' · Linked to Todo'}
        </p>
      </div>
      <div className="flex gap-2">
        {state.status === 'running'
          ? <button onClick={timer.pause} className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Pause</button>
          : <button onClick={timer.resume} className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">Resume</button>
        }
        <button onClick={onStop} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
          {isLinkedToTodo ? 'Finish' : 'Stop'}
        </button>
      </div>
      <button onClick={timer.reset} className="w-full text-xs text-slate-400 hover:text-red-400 transition-colors py-1">
        Discard
      </button>
    </div>
  );
}

export default function FloatingTimer() {
  const [open, setOpen] = useState(false);
  const timer = useTimer();
  const { data, addTimeToTodo } = useTodos();
  const { data: collegeData } = useCollege();
  const navigate = useNavigate();

  const handleStop = () => {
    const result = timer.stop();
    setOpen(false);

    if (result.linkedTodoId) {
      addTimeToTodo(result.linkedTodoId, result.elapsedMs);
      // Offer to also log as LeetCode problem if the todo was categorised as LeetCode
      const todo = [...data.today, ...data.tomorrow].find(t => t.id === result.linkedTodoId);
      if (todo?.category === 'LeetCode') {
        if (window.confirm(`Also log "${todo.text}" as a LeetCode problem?`)) {
          navigate('/leetcode', { state: { prefill: { problemName: todo.text, timeSpentMinutes: result.elapsedMinutes } } });
        }
      }
    } else if (result.category === 'leetcode') {
      navigate('/leetcode', { state: { prefill: { problemName: result.taskName, timeSpentMinutes: result.elapsedMinutes } } });
    } else if (result.semId && result.courseId) {
      navigate('/college', { state: { prefill: { semId: result.semId, courseId: result.courseId, entryName: result.taskName, timeSpentMinutes: result.elapsedMinutes } } });
    }
  };

  return (
    <>
      {/* Expanded panel */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-72 max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Study Timer</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none">×</button>
          </div>
          {timer.isActive
            ? <ActiveDisplay timer={timer} onStop={handleStop} />
            : <IdleForm timer={timer} collegeData={collegeData} />
          }
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all
          ${timer.isActive
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600'
          }`}
        aria-label="Study timer"
      >
        {timer.isActive ? (
          <span className={`text-white text-xs font-mono font-bold ${timer.state.status === 'running' ? 'animate-pulse' : ''}`}>
            {timer.display}
          </span>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth="2"/>
            <path strokeLinecap="round" strokeWidth="2" d="M12 7v5l3 3"/>
          </svg>
        )}
      </button>
    </>
  );
}
