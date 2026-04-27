import { useState } from 'react';
import { TOPICS } from '../../utils/leetcodeConstants';

export default function TagSelector({ selected, onChange }) {
  const [custom, setCustom] = useState('');

  const toggle = (tag) => {
    onChange(
      selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]
    );
  };

  const addCustom = () => {
    const tag = custom.trim();
    if (tag && !selected.includes(tag)) {
      onChange([...selected, tag]);
    }
    setCustom('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {TOPICS.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              selected.includes(tag)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Custom tag input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom tag..."
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700
            text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Show selected custom (non-predefined) tags */}
      {selected.filter(t => !TOPICS.includes(t)).map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            bg-indigo-600 text-white"
        >
          {tag}
          <button type="button" onClick={() => toggle(tag)} className="hover:text-indigo-200">×</button>
        </span>
      ))}
    </div>
  );
}
