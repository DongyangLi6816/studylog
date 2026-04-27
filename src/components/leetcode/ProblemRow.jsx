import { useState } from 'react';
import { DIFFICULTY_COLORS, STATUS_COLORS } from '../../utils/leetcodeConstants';

function Badge({ text, colorCls }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colorCls}`}>
      {text}
    </span>
  );
}

export default function ProblemRow({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const { problemName, problemNumber, difficulty, status, topics, timeSpentMinutes, notes, url, date } = entry;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-2 bg-white dark:bg-slate-800">
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        {/* Date */}
        <span className="text-xs text-slate-400 dark:text-slate-500 w-24 shrink-0">{date}</span>

        {/* # + Name */}
        <span className="font-medium text-slate-900 dark:text-white text-sm flex-1 min-w-40">
          {problemNumber ? <span className="text-slate-400 dark:text-slate-500 mr-1">#{problemNumber}</span> : null}
          {problemName}
        </span>

        {/* Badges */}
        <span className="flex items-center gap-2 shrink-0">
          <Badge text={difficulty} colorCls={DIFFICULTY_COLORS[difficulty]} />
          <Badge text={status} colorCls={STATUS_COLORS[status]} />
        </span>

        {/* Topics (first 2) */}
        <span className="hidden sm:flex gap-1 shrink-0">
          {topics.slice(0, 2).map(t => (
            <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {t}
            </span>
          ))}
          {topics.length > 2 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              +{topics.length - 2}
            </span>
          )}
        </span>

        {/* Time */}
        {timeSpentMinutes > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{timeSpentMinutes}m</span>
        )}

        {/* Chevron */}
        <span className={`text-slate-400 dark:text-slate-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-3">
          {/* All topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topics.map(t => (
                <span key={t} className="px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {notes && (
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{notes}</p>
          )}

          {/* URL */}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-500 hover:text-indigo-400 underline underline-offset-2 break-all">
              {url}
            </a>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={() => onEdit(entry)}
              className="text-xs font-medium text-indigo-500 hover:text-indigo-400 transition-colors">
              Edit
            </button>
            <button onClick={() => onDelete(entry.id)}
              className="text-xs font-medium text-red-500 hover:text-red-400 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
