import { useState, useEffect, useRef } from 'react';
import { DIFFICULTIES, STATUSES, DIFFICULTY_COLORS } from '../../utils/leetcodeConstants';
import { useLeetCodeLookup } from '../../hooks/useLeetCodeLookup';
import TagSelector from './TagSelector';
import { localDateString } from '../../utils/dateUtils';

const EMPTY = {
  problemName: '',
  problemNumber: '',
  difficulty: 'Medium',
  status: 'Solved',
  topics: [],
  timeSpentMinutes: '',
  notes: '',
  url: '',
  date: localDateString(),
};

const inputCls = `w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`;

const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

// Compact tag pill for the auto-fill preview
function TagPill({ label }) {
  return (
    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
      {label}
    </span>
  );
}

// Auto-fill preview box shown when a problem is matched
function MatchPreview({ matched, extraTopics, onExtraTopicsChange }) {
  const [addingTag, setAddingTag] = useState('');
  const diffColor = DIFFICULTY_COLORS[matched.difficulty] || '';

  const addTag = () => {
    const t = addingTag.trim();
    if (t && !extraTopics.includes(t)) onExtraTopicsChange([...extraTopics, t]);
    setAddingTag('');
  };

  const removeExtra = (t) => onExtraTopicsChange(extraTopics.filter(x => x !== t));

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">✓</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          #{matched.num} — {matched.title}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffColor}`}>
          {matched.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {matched.tags.map(t => <TagPill key={t} label={t} />)}
        {extraTopics.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
            {t}
            <button type="button" onClick={() => removeExtra(t)} className="hover:text-indigo-500">×</button>
          </span>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        leetcode.com/problems/{matched.slug}/
      </p>

      {/* Quick custom tag add */}
      <div className="flex gap-2 pt-0.5">
        <input
          type="text"
          value={addingTag}
          onChange={e => setAddingTag(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="+ custom tag"
          className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <button type="button" onClick={addTag}
          className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          Add tag
        </button>
      </div>
    </div>
  );
}

export default function AddProblemForm({ onSubmit, editEntry, onCancelEdit, prefill }) {
  const { lookupByNumber, searchByName, isReady } = useLeetCodeLookup();

  // 'lookup' = auto-fill mode; 'manual' = full form
  const [mode, setMode] = useState('lookup');

  // Lookup state
  const [numInput, setNumInput] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [matched, setMatched] = useState(null);
  const [extraTopics, setExtraTopics] = useState([]); // user-added tags on top of matched.tags

  // Form data (used in manual mode and for shared fields)
  const [form, setForm] = useState(EMPTY);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const numRef = useRef(null);

  // Open and seed from prefill (timer stopped → navigate to LeetCode page)
  useEffect(() => {
    if (prefill) {
      setForm(f => ({ ...f, timeSpentMinutes: prefill.timeSpentMinutes ?? '' }));
      if (prefill.problemName) setNameSearch(prefill.problemName);
      setOpen(true);
    }
  }, [prefill]);

  // Edit mode: switch to manual and populate form
  useEffect(() => {
    if (editEntry) {
      setForm({
        ...EMPTY,
        ...editEntry,
        problemNumber: editEntry.problemNumber ?? '',
        timeSpentMinutes: editEntry.timeSpentMinutes ?? '',
      });
      setMode('manual');
      setOpen(true);
    }
  }, [editEntry]);

  // Autofocus number input when form opens in lookup mode
  useEffect(() => {
    if (open && mode === 'lookup') {
      setTimeout(() => numRef.current?.focus(), 50);
    }
  }, [open, mode]);

  // Number lookup debounce
  useEffect(() => {
    if (!numInput || isNaN(Number(numInput)) || Number(numInput) <= 0) {
      setMatched(null);
      return;
    }
    const id = setTimeout(() => setMatched(lookupByNumber(numInput)), 300);
    return () => clearTimeout(id);
  }, [numInput, lookupByNumber]);

  // Name search debounce
  useEffect(() => {
    if (!nameSearch || nameSearch.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const id = setTimeout(() => {
      const results = searchByName(nameSearch);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    }, 250);
    return () => clearTimeout(id);
  }, [nameSearch, searchByName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectResult = (result) => {
    setMatched(result);
    setNumInput(result.num);
    setNameSearch('');
    setSearchResults([]);
    setShowDropdown(false);
    setExtraTopics([]);
  };

  const switchToManual = () => {
    if (matched) {
      setForm(f => ({
        ...f,
        problemName: matched.title,
        problemNumber: matched.num,
        difficulty: matched.difficulty,
        topics: [...matched.tags, ...extraTopics],
        url: `https://leetcode.com/problems/${matched.slug}/`,
      }));
    }
    setMode('manual');
  };

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    let submitData;

    if (mode === 'lookup') {
      if (!matched) return; // shouldn't reach here (button disabled)
      submitData = {
        ...form,
        problemName: matched.title,
        problemNumber: Number(matched.num),
        difficulty: matched.difficulty,
        topics: [...matched.tags, ...extraTopics],
        url: `https://leetcode.com/problems/${matched.slug}/`,
      };
    } else {
      if (!form.problemName.trim()) return;
      submitData = {
        ...form,
        problemNumber: form.problemNumber !== '' ? Number(form.problemNumber) : null,
      };
    }

    onSubmit({
      ...submitData,
      timeSpentMinutes: submitData.timeSpentMinutes !== '' ? Number(submitData.timeSpentMinutes) : 0,
    });

    if (!editEntry) {
      setForm(EMPTY);
      setNumInput('');
      setNameSearch('');
      setMatched(null);
      setExtraTopics([]);
      setMode('lookup');
    }
    if (editEntry) onCancelEdit();
    setOpen(false);
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setNumInput('');
    setNameSearch('');
    setMatched(null);
    setExtraTopics([]);
    setMode('lookup');
    setOpen(false);
    onCancelEdit?.();
  };

  // ----- Collapsed state -----
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

  // ----- Shared bottom fields (status, time, date, notes) -----
  const sharedFields = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <div className="sm:col-span-3">
        <label className={labelCls}>Notes</label>
        <textarea className={`${inputCls} resize-y`} rows={2} value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Approach, key insight, mistakes…" />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
        {editEntry ? 'Edit Problem' : 'Log New Problem'}
      </h2>

      {/* ===== LOOKUP MODE ===== */}
      {mode === 'lookup' && (
        <div className="space-y-4">
          {/* Number + name search inputs */}
          <div className="flex gap-3 items-start">
            {/* Problem number */}
            <div className="w-36 shrink-0">
              <label className={labelCls}>Problem #</label>
              <input
                ref={numRef}
                className={inputCls}
                type="number"
                value={numInput}
                onChange={e => { setNumInput(e.target.value); setNameSearch(''); setMatched(null); }}
                placeholder="e.g. 49"
                min="1"
              />
            </div>

            <div className="self-end pb-2 text-sm text-slate-400 dark:text-slate-500 shrink-0">or</div>

            {/* Name search with dropdown */}
            <div className="flex-1 relative" ref={dropdownRef}>
              <label className={labelCls}>Search by name</label>
              <input
                className={inputCls}
                type="text"
                value={nameSearch}
                onChange={e => { setNameSearch(e.target.value); setNumInput(''); setMatched(null); }}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="e.g. Group Anagram…"
                autoComplete="off"
              />
              {showDropdown && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg max-h-52 overflow-y-auto">
                  {searchResults.map(r => (
                    <button
                      key={r.num}
                      type="button"
                      onMouseDown={() => selectResult(r)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <span className="text-sm text-slate-900 dark:text-white font-medium">
                        #{r.num} — {r.title}
                      </span>
                      <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[r.difficulty] || ''}`}>
                        {r.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Match preview */}
          {matched && (
            <MatchPreview
              matched={matched}
              extraTopics={extraTopics}
              onExtraTopicsChange={setExtraTopics}
            />
          )}

          {/* Not-found message */}
          {numInput && !matched && Number(numInput) > 0 && isReady && (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Problem #{numInput} not in database —{' '}
              <button type="button" onClick={switchToManual} className="text-indigo-500 hover:text-indigo-600 underline">
                enter details manually
              </button>
            </p>
          )}

          {/* Loading state */}
          {!isReady && (
            <p className="text-xs text-slate-400 dark:text-slate-500">Loading problem database…</p>
          )}

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Shared fields */}
          {sharedFields}

          {/* Manual fallback link */}
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={switchToManual}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              Enter all fields manually →
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!matched}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              Add Problem
            </button>
            <button type="button" onClick={handleCancel}
              className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== MANUAL MODE ===== */}
      {mode === 'manual' && (
        <div className="space-y-4">
          {!editEntry && (
            <button type="button" onClick={() => setMode('lookup')}
              className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              ← Back to auto-fill lookup
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className={labelCls}>Problem Name *</label>
              <input className={inputCls} value={form.problemName}
                onChange={e => set('problemName', e.target.value)} required placeholder="e.g. Two Sum" autoFocus />
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
                onChange={e => set('url', e.target.value)} placeholder="https://leetcode.com/problems/…" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Topics</label>
            <TagSelector selected={form.topics} onChange={tags => set('topics', tags)} />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea className={`${inputCls} resize-y`} rows={3} value={form.notes}
              onChange={e => set('notes', e.target.value)} placeholder="Approach, key insight, mistakes…" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={!form.problemName.trim()}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium transition-colors">
              {editEntry ? 'Save Changes' : 'Add Problem'}
            </button>
            <button type="button" onClick={handleCancel}
              className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
