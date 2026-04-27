import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCollege } from '../context/CollegeContext';
import { useCelebration } from '../context/CelebrationContext';
import SemesterAccordion from '../components/college/SemesterAccordion';
import { localDateString } from '../utils/dateUtils';
import SemesterForm from '../components/college/SemesterForm';

function TimerPrefillBanner({ prefill, collegeData, onSave, onDismiss }) {
  const sem = (collegeData.semesters || []).find(s => s.id === prefill.semId);
  const course = sem?.courses?.find(c => c.id === prefill.courseId);
  if (!sem || !course) return null;

  return (
    <div className="mb-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">⏱️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Timer stopped</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-0.5">
            <strong>{prefill.entryName}</strong> — {prefill.timeSpentMinutes}m
          </p>
          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
            {sem.name} → {course.code} {course.name}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onSave}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
            Save Entry
          </button>
          <button onClick={onDismiss}
            className="px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function College() {
  const college = useCollege();
  const { data, addSemester } = college;
  const { triggerCelebration } = useCelebration();
  const [addingSemester, setAddingSemester] = useState(false);
  const location = useLocation();
  const [prefill, setPrefill] = useState(location.state?.prefill ?? null);

  const ops = {
    updateSemester: college.updateSemester,
    deleteSemester: college.deleteSemester,
    addCourse:      college.addCourse,
    updateCourse:   college.updateCourse,
    deleteCourse:   college.deleteCourse,
    addEntry:       (semId, courseId, data) => { college.addEntry(semId, courseId, data); triggerCelebration(1); },
    updateEntry:    college.updateEntry,
    deleteEntry:    college.deleteEntry,
  };

  const handlePrefillSave = () => {
    college.addEntry(prefill.semId, prefill.courseId, {
      name: prefill.entryName,
      type: 'Assignment',
      grade: '',
      date: localDateString(),
      timeSpentMinutes: prefill.timeSpentMinutes,
      notes: '',
    });
    setPrefill(null);
    triggerCelebration(1);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">College Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Semesters → Courses → Entries</p>
        </div>
        {!addingSemester && (
          <button onClick={() => setAddingSemester(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            + Add Semester
          </button>
        )}
      </div>

      {prefill && (
        <TimerPrefillBanner
          prefill={prefill}
          collegeData={data}
          onSave={handlePrefillSave}
          onDismiss={() => setPrefill(null)}
        />
      )}

      {addingSemester && (
        <div className="mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">New Semester</p>
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
          <button onClick={() => setAddingSemester(true)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
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
