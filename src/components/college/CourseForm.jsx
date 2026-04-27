import { useState } from 'react';

const EMPTY = { code: '', name: '', creditHours: '' };

const inputCls = `w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500`;

const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

export default function CourseForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { code: initial.code, name: initial.name, creditHours: initial.creditHours ?? '' }
      : EMPTY
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      creditHours: form.creditHours !== '' ? Number(form.creditHours) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit}
      className="bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Course Code</label>
          <input className={inputCls} value={form.code} onChange={e => set('code', e.target.value)}
            placeholder="e.g. CS201" autoFocus />
        </div>
        <div>
          <label className={labelCls}>Credit Hours</label>
          <input className={inputCls} type="number" value={form.creditHours}
            onChange={e => set('creditHours', e.target.value)} placeholder="e.g. 3" min="1" max="12" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Course Name *</label>
        <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. Data Structures & Algorithms" required />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
          {initial ? 'Save' : 'Add Course'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
