import { useState } from 'react';
import { useCollege } from '../hooks/useCollege';
import SemesterAccordion from '../components/college/SemesterAccordion';
import SemesterForm from '../components/college/SemesterForm';

export default function College() {
  const college = useCollege();
  const { data, addSemester } = college;
  const [addingSemester, setAddingSemester] = useState(false);

  const ops = {
    updateSemester: college.updateSemester,
    deleteSemester: college.deleteSemester,
    addCourse:      college.addCourse,
    updateCourse:   college.updateCourse,
    deleteCourse:   college.deleteCourse,
    addEntry:       college.addEntry,
    updateEntry:    college.updateEntry,
    deleteEntry:    college.deleteEntry,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">College Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Semesters → Courses → Entries
          </p>
        </div>
        {!addingSemester && (
          <button
            onClick={() => setAddingSemester(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            + Add Semester
          </button>
        )}
      </div>

      {addingSemester && (
        <div className="mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            New Semester
          </p>
          <SemesterForm
            onSubmit={(name) => { addSemester(name); setAddingSemester(false); }}
            onCancel={() => setAddingSemester(false)}
          />
        </div>
      )}

      {data.semesters.length === 0 && !addingSemester ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-base font-medium mb-1">No semesters yet</p>
          <p className="text-sm mb-5">Add your first semester to get started.</p>
          <button
            onClick={() => setAddingSemester(true)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Add Semester
          </button>
        </div>
      ) : (
        data.semesters.map(semester => (
          <SemesterAccordion key={semester.id} semester={semester} ops={ops} />
        ))
      )}
    </div>
  );
}
