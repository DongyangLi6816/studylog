import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useTodos } from '../context/TodosContext';
import { useCollege } from '../hooks/useCollege';

const inputCls = `w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500`;

const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

function IdleForm({ timer, collegeData }) {
  const [category, setCategory] = useState(timer.state.category === 'todo' ? 'leetcode' : timer.state.category);
  const [taskName, setTaskName] = useState(timer.state.taskName);
  const [semId, setSemId] = useState(timer.state.semId || '');
  const [courseId, setCourseId] = useState(timer.state.courseId || '');

  const semesters = collegeData.semesters || [];
  const courses = semesters.find(s => s.id === semId)?.courses || [];

  const handleStart = () => {
    if (!taskName.trim()) return;
    timer.start({ category, taskName: taskName.trim(), semId: semId || null, courseId: courseId || null, linkedTodoId: null });
  };

  return (
    <div className="space-y-3">
      {/* Category */}
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

      {/* College selectors */}
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
        </>
      )}

      {/* Task name */}
      <div>
        <label className={labelCls}>{category === 'leetcode' ? 'Problem Name' : 'Entry Name'}</label>
        <input className={inputCls} value={taskName} onChange={e => setTaskName(e.target.value)}
          placeholder={category === 'leetcode' ? 'e.g. Two Sum' : 'e.g. Assignment 3'}
          onKeyDown={e => e.key === 'Enter' && handleStart()} />
      </div>

      <button onClick={handleStart} disabled={!taskName.trim()}
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
  const { addTimeToTodo } = useTodos();
  const { data: collegeData } = useCollege();
  const navigate = useNavigate();

  const handleStop = () => {
    const result = timer.stop();
    setOpen(false);
    if (result.linkedTodoId) {
      addTimeToTodo(result.linkedTodoId, result.elapsedMs);
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
