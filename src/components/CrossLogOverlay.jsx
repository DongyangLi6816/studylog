import { useState, useEffect, useRef } from 'react';
import { useCrossLog } from '../context/CrossLogContext';
import { useTodos } from '../context/TodosContext';
import { useLeetCode } from '../context/LeetCodeContext';
import { useCollege } from '../context/CollegeContext';
import { useLeetCodeLookup } from '../hooks/useLeetCodeLookup';
import { useCelebration } from '../context/CelebrationContext';
import { STATUSES, DIFFICULTY_COLORS } from '../utils/leetcodeConstants';
import { ENTRY_TYPES } from '../utils/collegeConstants';

const inputCls = `w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500`;

const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

// Pull a leading number from todo text like "Solve #49" or "LC 206"
function extractProblemNumber(text) {
  const m = text.match(/(?:lc\s*)?#?(\d{1,4})\b/i);
  return m ? m[1] : '';
}

// ── LeetCode cross-log form ─────────────────────────────────────────────────

function LCForm({ todo, onConfirm, onCancel }) {
  const { lookupByNumber, searchByName } = useLeetCodeLookup();
  const [input, setInput] = useState(() => extractProblemNumber(todo.text));
  const [matched, setMatched] = useState(null);
  const [results, setResults] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [status, setStatus] = useState('Solved');
  const [timeMinutes, setTimeMinutes] = useState(() => String(Math.max(1, Math.round((todo.timeSpentSeconds || 0) / 60))));
  const [notes, setNotes] = useState(todo.text);
  const dropRef = useRef(null);

  useEffect(() => {
    const val = input.trim();
    if (!val) { setMatched(null); setResults([]); setShowDrop(false); return; }
    const isNum = /^\d+$/.test(val);
    const delay = isNum ? 300 : 250;
    const id = setTimeout(() => {
      if (isNum) {
        const m = lookupByNumber(val);
        setMatched(m || null);
        setResults([]); setShowDrop(false);
      } else {
        const res = searchByName(val);
        setResults(res);
        setShowDrop(res.length > 0);
        setMatched(null);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [input, lookupByNumber, searchByName]);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const pick = (r) => {
    setInput(`${r.num} – ${r.title}`);
    setMatched(r);
    setResults([]); setShowDrop(false);
  };

  const handleConfirm = () => {
    const name = matched ? matched.title : input.trim();
    if (!name) return;
    onConfirm({
      problemName: name,
      problemNumber: matched ? Number(matched.num) : null,
      difficulty: matched ? matched.difficulty : 'Medium',
      status,
      timeSpentMinutes: Number(timeMinutes) || 0,
      notes,
      url: matched?.url || '',
      fromTodo: true,
    });
  };

  return (
    <div className="space-y-3">
      <div ref={dropRef} className="relative">
        <label className={labelCls}>Problem # or Name</label>
        <input
          className={inputCls}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="49  or  Group Anagram…"
          autoComplete="off"
          autoFocus
        />
        {showDrop && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-36 overflow-y-auto">
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
        {matched && (
          <p className={`mt-1 text-xs font-medium px-2 py-1 rounded-lg ${DIFFICULTY_COLORS[matched.difficulty] || 'text-slate-500'}`}>
            ✓ #{matched.num} · {matched.title} · {matched.difficulty}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Time (min)</label>
          <input className={inputCls} type="number" min="0" value={timeMinutes} onChange={e => setTimeMinutes(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <input className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={!input.trim()}
          className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
          Log Entry
        </button>
      </div>
    </div>
  );
}

// ── College cross-log form ───────────────────────────────────────────────────

function CollegeForm({ todo, onConfirm, onCancel }) {
  const { data: collegeData } = useCollege();
  const semesters = collegeData.semesters || [];

  const [semId, setSemId] = useState(semesters[0]?.id || '');
  const courses = semesters.find(s => s.id === semId)?.courses || [];
  const [courseId, setCourseId] = useState(() => semesters[0]?.courses?.[0]?.id || '');
  const [name, setName] = useState(todo.text);
  const [type, setType] = useState('Assignment');
  const [timeMinutes, setTimeMinutes] = useState(() => String(Math.max(1, Math.round((todo.timeSpentSeconds || 0) / 60))));
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setCourseId(courses[0]?.id || '');
  }, [semId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    if (!semId || !courseId || !name.trim()) return;
    onConfirm(semId, courseId, {
      name: name.trim(),
      type,
      timeSpentMinutes: Number(timeMinutes) || 0,
      grade,
      notes,
      fromTodo: true,
    });
  };

  if (semesters.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No semesters found. Add one in the College section first.
        </p>
        <button onClick={onCancel}
          className="w-full py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Semester</label>
          <select className={inputCls} value={semId} onChange={e => setSemId(e.target.value)}>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Course</label>
          <select className={inputCls} value={courseId} onChange={e => setCourseId(e.target.value)}>
            <option value="">Select…</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Entry Name</label>
        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Type</label>
          <select className={inputCls} value={type} onChange={e => setType(e.target.value)}>
            {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Time (min)</label>
          <input className={inputCls} type="number" min="0" value={timeMinutes} onChange={e => setTimeMinutes(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Grade (optional)</label>
          <input className={inputCls} value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. 95/100" />
        </div>
        <div>
          <label className={labelCls}>Notes (optional)</label>
          <input className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="…" />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={!semId || !courseId || !name.trim()}
          className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
          Log Entry
        </button>
      </div>
    </div>
  );
}

// ── Main overlay ─────────────────────────────────────────────────────────────

export default function CrossLogOverlay() {
  const { pending, dismiss } = useCrossLog();
  const { markCrossLogged } = useTodos();
  const { addEntry: addLCEntry } = useLeetCode();
  const { addEntry: addCollegeEntry } = useCollege();
  const { triggerCelebration } = useCelebration();
  const [step, setStep] = useState('prompt'); // 'prompt' | 'form'

  // Reset to prompt step whenever a new pending item arrives
  useEffect(() => { setStep('prompt'); }, [pending]);

  if (!pending) return null;
  const { todo } = pending;
  const isLC = todo.category === 'LeetCode';

  const handleSkip = () => dismiss();
  const handleYes = () => setStep('form');

  const handleConfirmLC = (data) => {
    addLCEntry(data);
    markCrossLogged(todo.id);
    dismiss();
    triggerCelebration(1);
  };

  const handleConfirmCollege = (semId, courseId, data) => {
    addCollegeEntry(semId, courseId, data);
    markCrossLogged(todo.id);
    dismiss();
    triggerCelebration(1);
  };

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between ${isLC ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLC ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
              {isLC ? 'LC' : 'UNI'}
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
              {todo.text}
            </span>
          </div>
          <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none shrink-0 ml-2">×</button>
        </div>

        <div className="px-4 py-4">
          {step === 'prompt' ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Log this to your <strong>{isLC ? 'LeetCode' : 'College'} tracker</strong>?
              </p>
              <div className="flex gap-2">
                <button onClick={handleSkip}
                  className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Skip
                </button>
                <button onClick={handleYes}
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium transition-colors ${isLC ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  Yes, log it
                </button>
              </div>
            </div>
          ) : isLC ? (
            <LCForm todo={todo} onConfirm={handleConfirmLC} onCancel={handleSkip} />
          ) : (
            <CollegeForm todo={todo} onConfirm={handleConfirmCollege} onCancel={handleSkip} />
          )}
        </div>
      </div>
    </div>
  );
}
