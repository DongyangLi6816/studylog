import { useState, useMemo } from 'react';
import FilterBar from './FilterBar';
import ProblemRow from './ProblemRow';

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

function applyFilters(entries, { search, topic, difficulty, status }) {
  return entries.filter(e => {
    if (search && !e.problemName.toLowerCase().includes(search.toLowerCase()) &&
        !(String(e.problemNumber).includes(search))) return false;
    if (topic && !e.topics.includes(topic)) return false;
    if (difficulty && e.difficulty !== difficulty) return false;
    if (status && e.status !== status) return false;
    return true;
  });
}

function applySort(entries, sortBy) {
  const arr = [...entries];
  switch (sortBy) {
    case 'date_asc':  return arr.sort((a, b) => a.date.localeCompare(b.date));
    case 'difficulty': return arr.sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);
    case 'time_desc': return arr.sort((a, b) => (b.timeSpentMinutes || 0) - (a.timeSpentMinutes || 0));
    case 'time_asc':  return arr.sort((a, b) => (a.timeSpentMinutes || 0) - (b.timeSpentMinutes || 0));
    default:          return arr.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export default function ProblemList({ entries, onEdit, onDelete }) {
  const [filters, setFilters] = useState({ search: '', topic: '', difficulty: '', status: '' });
  const [sortBy, setSortBy] = useState('date_desc');

  const filtered = useMemo(() => applySort(applyFilters(entries, filters), sortBy), [entries, filters, sortBy]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500">
        <div className="text-4xl mb-3">⌨️</div>
        <p className="text-base font-medium mb-1">No problems logged yet</p>
        <p className="text-sm">Start by logging your first problem above!</p>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        filters={filters} setFilters={setFilters}
        sortBy={sortBy} setSortBy={setSortBy}
        total={entries.length} shown={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <p className="text-sm">No problems match your filters.</p>
        </div>
      ) : (
        <div>
          {filtered.map(entry => (
            <ProblemRow key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
