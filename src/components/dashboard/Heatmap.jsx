import { useState } from 'react';
import { formatMinutes } from '../../utils/dashboardStats';

// Color levels: index 0 = no activity, 5 = most active
const CELL_COLORS = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-green-100 dark:bg-indigo-950',
  'bg-green-300 dark:bg-indigo-800',
  'bg-green-500 dark:bg-indigo-600',
  'bg-green-700 dark:bg-indigo-400',
  'bg-green-900 dark:bg-indigo-200',
];

const LEGEND = [
  { label: 'None', level: 0 },
  { label: '<30m', level: 1 },
  { label: '30m', level: 2 },
  { label: '1h', level: 3 },
  { label: '2h', level: 4 },
  { label: '4h+', level: 5 },
];

function getLevel(minutes) {
  if (!minutes) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  if (minutes < 240) return 4;
  return 5;
}

function buildGrid(dayMap) {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 52 * 7);
  start.setDate(start.getDate() - start.getDay()); // align to Sunday

  const weeks = [], monthLabels = [];
  let lastMonth = -1;

  for (let col = 0; col < 53; col++) {
    const week = [];
    const sunday = new Date(start); sunday.setDate(sunday.getDate() + col * 7);

    const m = sunday.getMonth();
    if (m !== lastMonth && sunday <= today) {
      monthLabels.push({ label: sunday.toLocaleString('default', { month: 'short' }), col });
      lastMonth = m;
    }

    for (let row = 0; row < 7; row++) {
      const d = new Date(sunday); d.setDate(d.getDate() + row);
      const dateStr = d.toISOString().slice(0, 10);
      const isFuture = d > today;
      const { minutes = 0, count = 0 } = dayMap[dateStr] || {};
      week.push({ dateStr, minutes, count, isFuture, level: isFuture ? -1 : getLevel(minutes) });
    }
    weeks.push(week);
  }
  return { weeks, monthLabels };
}

const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];
const CELL = 12, GAP = 3, STRIDE = CELL + GAP, DAY_COL = 28;

export default function Heatmap({ dayMap }) {
  const [tooltip, setTooltip] = useState(null);
  const { weeks, monthLabels } = buildGrid(dayMap);

  const handleEnter = (e, cell) => {
    if (cell.isFuture) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ ...cell, x: r.left + r.width / 2, y: r.top });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
        Study Activity
      </h2>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="relative" style={{ minWidth: DAY_COL + 53 * STRIDE }}>
          {/* Month labels */}
          <div className="relative h-5 mb-1" style={{ paddingLeft: DAY_COL }}>
            {monthLabels.map(({ label, col }) => (
              <span key={`${label}-${col}`}
                className="absolute text-[10px] text-slate-400 dark:text-slate-500"
                style={{ left: col * STRIDE }}>
                {label}
              </span>
            ))}
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-0" style={{ columnGap: `${GAP}px` }}>
            {/* Day-of-week labels */}
            <div className="flex flex-col shrink-0" style={{ width: DAY_COL, gap: GAP }}>
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="text-[10px] text-slate-400 dark:text-slate-500 text-right pr-1 leading-none"
                  style={{ height: CELL, lineHeight: `${CELL}px` }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, col) => (
              <div key={col} className="flex flex-col shrink-0" style={{ gap: GAP }}>
                {week.map((cell, row) => (
                  <div
                    key={row}
                    onMouseEnter={e => handleEnter(e, cell)}
                    onMouseLeave={() => setTooltip(null)}
                    className={`rounded-sm cursor-default transition-opacity ${
                      cell.isFuture ? 'opacity-0' : CELL_COLORS[cell.level]
                    }`}
                    style={{ width: CELL, height: CELL }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Less</span>
            {LEGEND.map(({ level }) => (
              <div key={level} className={`rounded-sm ${CELL_COLORS[level]}`} style={{ width: CELL, height: CELL }} />
            ))}
            <span className="text-[10px] text-slate-400 dark:text-slate-500">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip (fixed position) */}
      {tooltip && tooltip.count > 0 && (
        <div className="fixed z-50 px-2.5 py-2 text-xs rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 8, transform: 'translate(-50%, -100%)' }}>
          <p className="font-semibold">{tooltip.dateStr}</p>
          <p>{formatMinutes(tooltip.minutes)} studied</p>
          <p>{tooltip.count} {tooltip.count === 1 ? 'entry' : 'entries'}</p>
        </div>
      )}
    </div>
  );
}
