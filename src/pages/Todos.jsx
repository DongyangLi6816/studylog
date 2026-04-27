import { useState, useRef, useEffect } from 'react';
import { useTodos } from '../context/TodosContext';
import { useTimer } from '../context/TimerContext';
import { useCrossLog } from '../context/CrossLogContext';
import { useCelebration } from '../context/CelebrationContext';

const CATEGORIES = ['General', 'LeetCode', 'College'];

const CATEGORY_COLORS = {
  LeetCode: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  College:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  General:  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
};

function formatTime(seconds) {
  if (!seconds) return '0m';
  const m = Math.floor(seconds / 60);
  if (m === 0) return '< 1m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function TodoItem({ todo, list, timer, onStart, onPause, onFinish, onDelete, onToggleComplete, onEdit, onMoveToToday, showMoveToToday }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef(null);

  const isTimingThis = timer.isActive && timer.state.linkedTodoId === todo.id;
  const isRunning   = isTimingThis && timer.state.status === 'running';
  const isPaused    = isTimingThis && timer.state.status === 'paused';

  // Live accumulated seconds: stored + current session
  const liveExtraSeconds = isTimingThis ? Math.floor(timer.elapsedMs / 1000) : 0;
  const totalSeconds = todo.timeSpentSeconds + liveExtraSeconds;

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleEditSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) onEdit(list, todo.id, trimmed);
    setEditing(false);
  };

  const categoryColor = CATEGORY_COLORS[todo.category] || CATEGORY_COLORS.General;

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${
      isTimingThis
        ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-900/20 shadow-sm'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
    } ${todo.completed ? 'opacity-55' : ''}`}>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(list, todo)}
        className="mt-1 shrink-0 w-4 h-4 rounded accent-indigo-600 cursor-pointer"
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {editing ? (
            <input
              ref={inputRef}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={e => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') { setEditText(todo.text); setEditing(false); }
              }}
              className="flex-1 min-w-0 px-2 py-0.5 rounded border border-indigo-400 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          ) : (
            <span
              onClick={() => !todo.completed && setEditing(true)}
              className={`text-sm font-medium leading-snug ${
                todo.completed
                  ? 'line-through text-slate-400 dark:text-slate-500 cursor-default'
                  : 'text-slate-900 dark:text-white cursor-text hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {todo.text}
            </span>
          )}

          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${categoryColor}`}>
            {todo.category}
          </span>

          {isTimingThis && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${isRunning ? 'bg-indigo-500 animate-pulse' : 'bg-amber-400'}`} title={isRunning ? 'Running' : 'Paused'} />
          )}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {formatTime(totalSeconds)}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0 ml-1">
        {!todo.completed && (
          <>
            {showMoveToToday && (
              <button
                onClick={() => onMoveToToday(todo.id)}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                → Today
              </button>
            )}

            {isRunning ? (
              <button
                onClick={onPause}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
              >
                Pause
              </button>
            ) : isPaused ? (
              <button
                onClick={() => timer.resume()}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={() => onStart(todo)}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
              >
                Start
              </button>
            )}

            {isTimingThis && (
              <button
                onClick={() => onFinish(todo)}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
              >
                Finish
              </button>
            )}
          </>
        )}

        <button
          onClick={() => onDelete(list, todo.id)}
          title="Delete"
          className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Todos() {
  const [activeTab, setActiveTab] = useState('today');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const timer = useTimer();
  const { promptCrossLog } = useCrossLog();
  const { triggerCelebration } = useCelebration();
  const { data, addTodo, updateTodo, deleteTodo, toggleComplete, addTimeToTodo, moveToToday, moveAllToToday } = useTodos();

  const list   = activeTab;
  const todos  = data[list] || [];
  const active    = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);

  const todayCount    = (data.today    || []).filter(t => !t.completed).length;
  const tomorrowCount = (data.tomorrow || []).filter(t => !t.completed).length;

  const handleAdd = () => {
    if (!newText.trim()) return;
    addTodo(list, newText.trim(), newCategory);
    setNewText('');
  };

  const handleStart = (todo) => {
    if (timer.isActive && timer.state.linkedTodoId !== todo.id) {
      const current = timer.state.taskName;
      if (!window.confirm(`Stop the current timer for "${current}" and start "${todo.text}"?`)) return;
      const result = timer.stop();
      if (result.linkedTodoId) addTimeToTodo(result.linkedTodoId, result.elapsedMs);
    }
    timer.start({ category: 'todo', taskName: todo.text, linkedTodoId: todo.id });
  };

  const handlePause = () => timer.pause();

  const handleFinish = (todo) => {
    if (!timer.isActive || timer.state.linkedTodoId !== todo.id) return;
    const result = timer.stop();
    addTimeToTodo(todo.id, result.elapsedMs);
  };

  const handleDelete = (lst, id) => {
    if (timer.isActive && timer.state.linkedTodoId === id) timer.reset();
    deleteTodo(lst, id);
  };

  const handleToggleComplete = (lst, todo) => {
    if (timer.isActive && timer.state.linkedTodoId === todo.id && !todo.completed) {
      const result = timer.stop();
      addTimeToTodo(todo.id, result.elapsedMs);
    }
    toggleComplete(lst, todo.id);
    if (!todo.completed) {
      triggerCelebration(1);
      promptCrossLog(todo, lst);
    }
  };

  const handleEdit = (lst, id, text) => {
    updateTodo(lst, id, { text });
    if (timer.state.linkedTodoId === id) timer.update({ taskName: text });
  };

  const renderList = (items, lst, showMoveToToday = false) => (
    <div className="space-y-2">
      {items.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          list={lst}
          timer={timer}
          onStart={handleStart}
          onPause={handlePause}
          onFinish={handleFinish}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          showMoveToToday={showMoveToToday && !todo.completed}
          onMoveToToday={moveToToday}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Todos</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Daily task list with integrated study timer.</p>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {[
          { key: 'today',    label: 'Today',    count: todayCount },
          { key: 'tomorrow', label: 'Tomorrow', count: tomorrowCount },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === key
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tomorrow bulk action */}
      {activeTab === 'tomorrow' && data.tomorrow.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={moveAllToToday}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Move all to Today →
          </button>
        </div>
      )}

      {/* Quick-add input */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2">
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={`Add a task for ${activeTab === 'today' ? 'today' : 'tomorrow'}…`}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* List content */}
      {active.length === 0 && completed.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            No tasks for {activeTab === 'today' ? 'today' : 'tomorrow'}.
          </p>
          <p className="text-xs mt-1">Add one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {active.length > 0 && renderList(active, list, activeTab === 'tomorrow')}

          {completed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2 px-1">
                Completed ({completed.length})
              </p>
              {renderList(completed, list, false)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
