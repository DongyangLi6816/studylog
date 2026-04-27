export const ENTRY_TYPES = ['Assignment', 'Exam', 'Quiz', 'Lab', 'Project', 'Other'];

export const TYPE_COLORS = {
  Assignment: 'text-blue-600   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/30',
  Exam:       'text-red-600    dark:text-red-400    bg-red-50    dark:bg-red-900/30',
  Quiz:       'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30',
  Lab:        'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
  Project:    'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30',
  Other:      'text-slate-600  dark:text-slate-400  bg-slate-100 dark:bg-slate-700',
};

export function parseGrade(grade) {
  if (!grade) return null;
  const m = grade.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  return m ? (parseFloat(m[1]) / parseFloat(m[2])) * 100 : null;
}

export function avgGrade(entries) {
  const grades = entries.map(e => parseGrade(e.grade)).filter(g => g !== null);
  if (!grades.length) return null;
  return Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
}
