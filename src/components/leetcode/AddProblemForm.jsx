import { useState, useEffect } from 'react';
import { DIFFICULTIES, STATUSES } from '../../utils/leetcodeConstants';
import TagSelector from './TagSelector';

const EMPTY = {
  problemName: '',
  problemNumber: '',
  difficulty: 'Medium',
  status: 'Solved',
  topics: [],
  timeSpentMinutes: '',
  notes: '',
  url: '',
  date: new Date().toISOString().slice(0, 10),
};

export default function AddProblemForm({ onSubmit, editEntry, onCancelEdit, prefill }) {
  const [form, setForm] = useState(() =>
    prefill ? { ...EMPTY, problemName: prefill.problemName || '', timeSpentMinutes: prefill.timeSpentMinutes || '' } : EMPTY
  );
  const [open, setOpen] = useState(!!prefill);

  useEffect(() => {
    if (editEntry) {
      setForm({
        ...editEntry,
        problemNumber: editEntry.problemNumber ?? '',
        timeSpentMinutes: editEntry.timeSpentMinutes ?? '',
      });
      setOpen(true);
    }
  }, [editEntry]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.problemName.trim()) return;
    onSubmit({
      ...form,
      problemNumber: form.problemNumber !== '' ? Number(form.problemNumber) : null,
      timeSpentMinutes: form.timeSpentMinutes !== '' ? Number(form.timeSpentMinutes) : 0,
    });
    if (!editEntry) setForm(EMPTY);
    if (editEntry) onCancelEdit();
    setOpen(false);
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setOpen(false);
    onCancelEdit?.();
  };

  const inputCls = `w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
    bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
    focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`;

  const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

  if (!open && !editEntry) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
      >
        <span className="text-lg leading-none">+</span> Log Problem
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
        {editEntry ? 'Edit Problem' : 'Log New Problem'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <label className={labelCls}>Problem Name *</label>
          <input className={inputCls} value={form.problemName}
            onChange={e => set('problemName', e.target.value)} required placeholder="e.g. Two Sum" />
        </div>

        <div>
          <label className={labelCls}>Problem #</label>
          <input className={inputCls} type="number" value={form.problemNumber}
            onChange={e => set('problemNumber', e.target.value)} placeholder="e.g. 1" min="1" />
        </div>

        <div>
          <label className={labelCls}>Difficulty</label>
          <select className={inputCls} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Time Spent (min)</label>
          <input className={inputCls} type="number" value={form.timeSpentMinutes}
            onChange={e => set('timeSpentMinutes', e.target.value)} placeholder="e.g. 30" min="0" />
        </div>

        <div>
          <label className={labelCls}>Date</label>
          <input className={inputCls} type="date" value={form.date}
            onChange={e => set('date', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>URL</label>
          <input className={inputCls} type="url" value={form.url}
            onChange={e => set('url', e.target.value)} placeholder="https://leetcode.com/problems/..." />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>Topics</label>
        <TagSelector selected={form.topics} onChange={tags => set('topics', tags)} />
      </div>

      <div className="mb-5">
        <label className={labelCls}>Notes</label>
        <textarea className={`${inputCls} resize-y`} rows={3} value={form.notes}
          onChange={e => set('notes', e.target.value)} placeholder="Approach, key insight, mistakes..." />
      </div>

      <div className="flex gap-3">
        <button type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
          {editEntry ? 'Save Changes' : 'Add Problem'}
        </button>
        <button type="button" onClick={handleCancel}
          className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
