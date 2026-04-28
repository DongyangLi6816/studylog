import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLeetCode } from '../context/LeetCodeContext';
import { useCelebration } from '../context/CelebrationContext';
import AddProblemForm from '../components/leetcode/AddProblemForm';
import ProblemList from '../components/leetcode/ProblemList';
import LeetCodeStats from '../components/leetcode/LeetCodeStats';

export default function LeetCode() {
  const { entries, addEntry, updateEntry, deleteEntry } = useLeetCode();
  const { triggerCelebration } = useCelebration();
  const [editEntry, setEditEntry] = useState(null);
  const location = useLocation();

  // Track prefill as state so it responds even when the page is already mounted
  const [prefill, setPrefill] = useState(location.state?.prefill ?? null);

  useEffect(() => {
    if (location.state?.prefill) {
      setPrefill(location.state.prefill);
    }
  }, [location.state]);

  const handleSubmit = (data) => {
    if (editEntry) {
      updateEntry(editEntry.id, data);
      setEditEntry(null);
    } else {
      addEntry(data);
      setPrefill(null);
      triggerCelebration(1);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this problem?')) deleteEntry(id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">LeetCode Tracker</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Log and review your DSA practice.</p>
      </div>

      {prefill && !editEntry && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-sm text-indigo-700 dark:text-indigo-300">
          <span>⏱️</span>
          <span>Timer stopped ({prefill.timeSpentMinutes}m) — enter the problem number or search by name below to log it.</span>
        </div>
      )}

      <AddProblemForm
        onSubmit={handleSubmit}
        editEntry={editEntry}
        onCancelEdit={() => setEditEntry(null)}
        prefill={prefill}
      />

      <LeetCodeStats entries={entries} />

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Problem History
        </h2>
        <ProblemList entries={entries} onEdit={setEditEntry} onDelete={handleDelete} />
      </div>
    </div>
  );
}
