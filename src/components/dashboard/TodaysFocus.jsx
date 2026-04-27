import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTodos } from '../../context/TodosContext';
import { useTimer } from '../../context/TimerContext';
import { useCrossLog } from '../../context/CrossLogContext';

const CATEGORY_COLORS = {
  LeetCode: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  College:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  General:  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
};

function formatTime(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  if (m === 0) return '< 1m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function formatMinutesCompact(min) {
  if (!min) return '0m';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function TodoRow({ todo, timer, onStart, onToggle }) {
  const isTimingThis = timer.isActive && timer.state.linkedTodoId === todo.id;
  const isRunning   = isTimingThis && timer.state.status === 'running';
  const isPaused    = isTimingThis && timer.state.status === 'paused';
  const liveExtra   = isTimingThis ? Math.floor(timer.elapsedMs / 1000) : 0;
  const totalSec    = todo.timeSpentSeconds + liveExtra;
  const timeLabel   = formatTime(totalSec);
  const catColor    = CATEGORY_COLORS[todo.category] || CATEGORY_COLORS.General;

  return (
    <div className={`flex items-center gap-2.5 py-2 border-b border-slate-50 dark:border-slate-700/40 last:border-0 ${todo.completed ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        className="shrink-0 w-4 h-4 rounded accent-indigo-600 cursor-pointer"
      />

      <span className={`flex-1 text-sm truncate ${todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>
        {todo.text}
      </span>

      <span className={`hidden sm:inline-flex shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${catColor}`}>
        {todo.category}
      </span>

      {timeLabel && (
        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500 min-w-[32px] text-right">
          {timeLabel}
        </span>
      )}

      {!todo.completed && (
        isRunning ? (
          <button
            onClick={() => timer.pause()}
            className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pause
          </button>
        ) : isPaused ? (
          <button
            onClick={() => timer.resume()}
            className="shrink-0 px-2 py-1 text-xs font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition-colors"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={() => onStart(todo)}
            className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </button>
        )
      )}
    </div>
  );
}

export default function TodaysFocus({ dayMap }) {
  const { data, addTodo, toggleComplete, addTimeToTodo } = useTodos();
  const timer = useTimer();
  const { promptCrossLog } = useCrossLog();

  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const todayTodos = data.today || [];
  const active    = todayTodos.filter(t => !t.completed);
  const completed = todayTodos.filter(t => t.completed);
  const total     = todayTodos.length;
  const doneCount = completed.length;
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMinutes = dayMap?.[todayStr]?.minutes || 0;

  // Show incomplete first, then completed; cap at 6 visible
  const sorted  = [...active, ...completed];
  const visible = sorted.slice(0, 6);
  const hasMore = sorted.length > 6;

  const handleStart = (todo) => {
    if (timer.isActive && timer.state.linkedTodoId !== todo.id) {
      if (!window.confirm(`Stop "${timer.state.taskName}" and start "${todo.text}"?`)) return;
      const result = timer.stop();
      if (result.linkedTodoId) addTimeToTodo(result.linkedTodoId, result.elapsedMs);
    }
    timer.start({ category: 'todo', taskName: todo.text, linkedTodoId: todo.id });
  };

  const handleToggle = (todo) => {
    if (timer.isActive && timer.state.linkedTodoId === todo.id && !todo.completed) {
      const result = timer.stop();
      addTimeToTodo(todo.id, result.elapsedMs);
    }
    toggleComplete('today', todo.id);
    if (!todo.completed) promptCrossLog(todo, 'today');
  };

  const handleAdd = () => {
    if (!newText.trim()) return;
    addTodo('today', newText.trim(), newCategory);
    setNewText('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Today's Focus</h2>
          {total > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {doneCount}/{total} done
              {todayMinutes > 0 && <span className="ml-2 text-indigo-500 dark:text-indigo-400 font-medium">{formatMinutesCompact(todayMinutes)}</span>}
            </p>
          )}
        </div>
        <Link to="/todos" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0">
          View All →
        </Link>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Todo rows */}
      {visible.length > 0 ? (
        <div className="mb-1">
          {visible.map(todo => (
            <TodoRow
              key={todo.id}
              todo={todo}
              timer={timer}
              onStart={handleStart}
              onToggle={handleToggle}
            />
          ))}
          {hasMore && (
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-2 text-center">
              +{sorted.length - 6} more —{' '}
              <Link to="/todos" className="text-indigo-500 hover:text-indigo-600 transition-colors">
                View all
              </Link>
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-3">
          No tasks for today yet.
        </p>
      )}

      {/* Quick add */}
      <div className="mt-4 flex gap-2">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="+ Add a task…"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <select
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          className="px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {['General', 'LeetCode', 'College'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={handleAdd}
          disabled={!newText.trim()}
          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
