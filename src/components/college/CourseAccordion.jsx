import { useState } from 'react';
import { avgGrade } from '../../utils/collegeConstants';
import EntryItem from './EntryItem';
import EntryForm from './EntryForm';
import CourseForm from './CourseForm';

export default function CourseAccordion({ course, semId, onUpdateCourse, onDeleteCourse, onAddEntry, onUpdateEntry, onDeleteEntry }) {
  const [open, setOpen] = useState(false);
  const [addingEntry, setAddingEntry] = useState(false);
  const [editing, setEditing] = useState(false);

  const avg = avgGrade(course.entries);

  const handleDeleteCourse = () => {
    if (window.confirm(`Delete "${course.name}" and all its entries?`)) onDeleteCourse(semId, course.id);
  };

  const handleDeleteEntry = (semId, courseId, entryId) => {
    if (window.confirm('Delete this entry?')) onDeleteEntry(semId, courseId, entryId);
  };

  if (editing) {
    return (
      <div className="mb-2">
        <CourseForm
          initial={course}
          onSubmit={(data) => { onUpdateCourse(semId, course.id, data); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="mb-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
      {/* Course header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
        <button onClick={() => setOpen(o => !o)} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <span className={`text-slate-400 transition-transform text-xs shrink-0 ${open ? 'rotate-180' : ''}`}>▾</span>
          {course.code && (
            <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 shrink-0">{course.code}</span>
          )}
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{course.name}</span>
          {course.creditHours && (
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{course.creditHours} cr</span>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
            {course.entries.length} {course.entries.length === 1 ? 'entry' : 'entries'}
          </span>
          {avg !== null && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
              Avg {avg}%
            </span>
          )}
        </button>
        <button onClick={() => setEditing(true)}
          className="text-xs text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-1">
          Edit
        </button>
        <button onClick={handleDeleteCourse}
          className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1">
          Delete
        </button>
      </div>

      {/* Course body */}
      {open && (
        <div className="p-3 space-y-2">
          {course.entries.length === 0 && !addingEntry && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">
              No entries yet — add one below.
            </p>
          )}

          {course.entries
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(entry => (
              <EntryItem
                key={entry.id}
                entry={entry}
                semId={semId}
                courseId={course.id}
                onUpdate={onUpdateEntry}
                onDelete={handleDeleteEntry}
              />
            ))}

          {addingEntry ? (
            <EntryForm
              onSubmit={(data) => { onAddEntry(semId, course.id, data); setAddingEntry(false); }}
              onCancel={() => setAddingEntry(false)}
            />
          ) : (
            <button
              onClick={() => setAddingEntry(true)}
              className="w-full py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-400 dark:text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              + Add Entry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
