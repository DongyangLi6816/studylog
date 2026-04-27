import { useState } from 'react';
import { ENTRY_TYPES } from '../../utils/collegeConstants';

const EMPTY = {
  name: '', type: 'Assignment', grade: '',
  date: new Date().toISOString().slice(0, 10),
  timeSpentMinutes: '', notes: '',
};

const inputCls = `w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500`;

const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

export default function EntryForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, timeSpentMinutes: initial.timeSpentMinutes || '' }
      : EMPTY
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      grade: form.grade.trim(),
      notes: form.notes.trim(),
      timeSpentMinutes: form.timeSpentMinutes !== '' ? Number(form.timeSpentMinutes) : 0,
    });
  };

  return (
    <form onSubmit={handleSubmit}
      className="bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={labelCls}>Entry Name *</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Assignment 3" required autoFocus />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
            {ENTRY_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Grade</label>
          <input className={inputCls} value={form.grade} onChange={e => set('grade', e.target.value)}
            placeholder='e.g. 85/100, HD, A+' />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input className={inputCls} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Time Spent (min)</label>
          <input className={inputCls} type="number" value={form.timeSpentMinutes}
            onChange={e => set('timeSpentMinutes', e.target.value)} placeholder="e.g. 90" min="0" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Notes</label>
          <textarea className={`${inputCls} resize-y`} rows={2} value={form.notes}
            onChange={e => set('notes', e.target.value)} placeholder="Key takeaways, approach..." />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
          {initial ? 'Save' : 'Add Entry'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
