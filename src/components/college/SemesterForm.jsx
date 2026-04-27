import { useState } from 'react';

const inputCls = `flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500`;

export default function SemesterForm({ initial = '', onSubmit, onCancel }) {
  const [name, setName] = useState(initial);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    if (!initial) setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="e.g. Fall 2025"
        className={inputCls}
      />
      <button type="submit"
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shrink-0">
        {initial ? 'Save' : 'Add'}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0">
          Cancel
        </button>
      )}
    </form>
  );
}
