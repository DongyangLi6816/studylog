import { useState } from 'react';
import CourseAccordion from './CourseAccordion';
import CourseForm from './CourseForm';
import SemesterForm from './SemesterForm';

export default function SemesterAccordion({ semester, ops }) {
  const [open, setOpen] = useState(true);
  const [addingCourse, setAddingCourse] = useState(false);
  const [editing, setEditing] = useState(false);

  const { updateSemester, deleteSemester, addCourse, updateCourse, deleteCourse, addEntry, updateEntry, deleteEntry } = ops;

  const handleDelete = () => {
    if (window.confirm(`Delete semester "${semester.name}" and all its courses?`)) {
      deleteSemester(semester.id);
    }
  };

  const totalEntries = semester.courses.reduce((sum, c) => sum + c.entries.length, 0);

  return (
    <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Semester header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-100 dark:bg-slate-800">
        {editing ? (
          <SemesterForm
            initial={semester.name}
            onSubmit={(name) => { updateSemester(semester.id, name); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <button onClick={() => setOpen(o => !o)} className="flex-1 flex items-center gap-3 text-left">
              <span className={`text-slate-400 transition-transform text-sm shrink-0 ${open ? 'rotate-180' : ''}`}>▾</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{semester.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {semester.courses.length} course{semester.courses.length !== 1 ? 's' : ''}
                {' · '}
                {totalEntries} entr{totalEntries !== 1 ? 'ies' : 'y'}
              </span>
            </button>
            <button onClick={() => setEditing(true)}
              className="text-xs text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-1">
              Rename
            </button>
            <button onClick={handleDelete}
              className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1">
              Delete
            </button>
          </>
        )}
      </div>

      {/* Semester body */}
      {open && (
        <div className="p-4 space-y-2 bg-white dark:bg-slate-900/40">
          {semester.courses.length === 0 && !addingCourse && (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
              No courses yet — add your first one below.
            </p>
          )}

          {semester.courses.map(course => (
            <CourseAccordion
              key={course.id}
              course={course}
              semId={semester.id}
              onUpdateCourse={updateCourse}
              onDeleteCourse={deleteCourse}
              onAddEntry={addEntry}
              onUpdateEntry={updateEntry}
              onDeleteEntry={deleteEntry}
            />
          ))}

          {addingCourse ? (
            <CourseForm
              onSubmit={(data) => { addCourse(semester.id, data); setAddingCourse(false); }}
              onCancel={() => setAddingCourse(false)}
            />
          ) : (
            <button
              onClick={() => setAddingCourse(true)}
              className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-400 dark:text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              + Add Course
            </button>
          )}
        </div>
      )}
    </div>
  );
}
