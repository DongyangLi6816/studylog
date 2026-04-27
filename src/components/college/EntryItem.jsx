import { useState } from 'react';
import { TYPE_COLORS } from '../../utils/collegeConstants';
import EntryForm from './EntryForm';

export default function EntryItem({ entry, semId, courseId, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const { name, type, grade, date, timeSpentMinutes, notes } = entry;

  if (editing) {
    return (
      <div className="mb-2">
        <EntryForm
          initial={entry}
          onSubmit={(data) => { onUpdate(semId, courseId, entry.id, data); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-1.5 bg-white dark:bg-slate-800">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[type] || TYPE_COLORS.Other}`}>
          {type}
        </span>
        <span className="text-sm font-medium text-slate-900 dark:text-white flex-1 min-w-24 text-left">
          {name}
        </span>
        {grade && (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">{grade}</span>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{date}</span>
        {timeSpentMinutes > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{timeSpentMinutes}m</span>
        )}
        <span className={`text-slate-400 shrink-0 transition-transform text-xs ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-100 dark:border-slate-700 pt-2.5 space-y-2">
          {notes && <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{notes}</p>}
          {!notes && <p className="text-xs text-slate-400 dark:text-slate-500 italic">No notes.</p>}
          <div className="flex gap-3">
            <button onClick={() => setEditing(true)}
              className="text-xs font-medium text-indigo-500 hover:text-indigo-400 transition-colors">
              Edit
            </button>
            <button onClick={() => onDelete(semId, courseId, entry.id)}
              className="text-xs font-medium text-red-500 hover:text-red-400 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
