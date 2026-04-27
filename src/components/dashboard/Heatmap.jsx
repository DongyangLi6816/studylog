import { useState } from 'react';
import { formatMinutes } from '../../utils/dashboardStats';
import { localDateString } from '../../utils/dateUtils';

const CELL_COLORS = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-green-100 dark:bg-indigo-950',
  'bg-green-300 dark:bg-indigo-800',
  'bg-green-500 dark:bg-indigo-600',
  'bg-green-700 dark:bg-indigo-400',
  'bg-green-900 dark:bg-indigo-200',
];

const LEGEND = [
  { level: 0 }, { level: 1 }, { level: 2 }, { level: 3 }, { level: 4 }, { level: 5 },
];

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getLevel(minutes) {
  if (!minutes) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  if (minutes < 240) return 4;
  return 5;
}

function buildMonthGrid(year, month, dayMap, todayStr) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0 … Sun=6
  const lastDay = new Date(year, month + 1, 0).getDate();
  const numRows = Math.ceil((startOffset + lastDay) / 7);

  const rows = [];
  for (let row = 0; row < numRows; row++) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      const d = new Date(year, month, row * 7 + col - startOffset + 1);
      const dateStr = localDateString(d);
      const isCurrentMonth = d.getMonth() === month && d.getFullYear() === year;
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const { minutes = 0, count = 0 } = dayMap[dateStr] || {};
      week.push({
        dateStr, minutes, count,
        isCurrentMonth, isToday, isFuture,
        dayNum: d.getDate(),
        level: isCurrentMonth && !isFuture ? getLevel(minutes) : 0,
      });
    }
    rows.push(week);
  }
  return rows;
}

export default function Heatmap({ dayMap }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [tooltip, setTooltip] = useState(null);

  const todayStr = localDateString();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const rows = buildMonthGrid(viewYear, viewMonth, dayMap, todayStr);

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' });

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const goNext = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleEnter = (e, cell) => {
    if (!cell.isCurrentMonth || cell.isFuture || cell.count === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ ...cell, x: r.left + r.width / 2, y: r.top });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
        Study Activity
      </h2>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={goPrev}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous month"
        >
          ◀
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] text-center">
          {monthLabel}
        </span>
        <button
          onClick={goNext}
          disabled={isCurrentMonth}
          className={`p-1.5 rounded-lg transition-colors ${
            isCurrentMonth
              ? 'text-slate-200 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar rows */}
      <div className="space-y-1">
        {rows.map((week, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-1">
            {week.map((cell, ci) => (
              <div
                key={ci}
                onMouseEnter={e => handleEnter(e, cell)}
                onMouseLeave={() => setTooltip(null)}
                className={[
                  'h-8 rounded-md flex items-center justify-center',
                  !cell.isCurrentMonth
                    ? 'opacity-0 pointer-events-none'
                    : cell.isFuture
                    ? `${CELL_COLORS[0]} opacity-40`
                    : `${CELL_COLORS[cell.level]}${cell.count > 0 ? ' cursor-pointer hover:scale-105 hover:shadow-sm transition-transform duration-75' : ''}`,
                  cell.isToday ? 'ring-2 ring-inset ring-indigo-500 dark:ring-indigo-400' : '',
                ].filter(Boolean).join(' ')}
              >
                {cell.isCurrentMonth && (
                  <span className={`text-[10px] leading-none select-none ${
                    cell.isToday
                      ? 'font-bold text-indigo-600 dark:text-indigo-300'
                      : cell.level >= 3
                      ? 'font-medium text-white dark:text-slate-900'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {cell.dayNum}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">Less</span>
        {LEGEND.map(({ level }) => (
          <div key={level} className={`rounded-sm w-3 h-3 ${CELL_COLORS[level]}`} />
        ))}
        <span className="text-[10px] text-slate-400 dark:text-slate-500">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && tooltip.count > 0 && (
        <div
          className="fixed z-50 px-2.5 py-2 text-xs rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 8, transform: 'translate(-50%, -100%)' }}
        >
          <p className="font-semibold">{tooltip.dateStr}</p>
          <p>{formatMinutes(tooltip.minutes)} studied</p>
          <p>{tooltip.count} {tooltip.count === 1 ? 'entry' : 'entries'}</p>
        </div>
      )}
    </div>
  );
}
