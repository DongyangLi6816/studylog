import { useEffect, useState } from 'react';

export default function Tier1Toast({ message, onDismiss }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = setTimeout(() => setLeaving(true), 2700);   // 200 anim-in + 2500 hold
    const doneTimer  = setTimeout(() => onDismiss(),     3000);    // + 300 fade-out
    return () => { clearTimeout(leaveTimer); clearTimeout(doneTimer); };
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        animation: leaving ? undefined : 'toast-in 200ms ease-out both',
        opacity: leaving ? 0 : undefined,
        transition: leaving ? 'opacity 300ms ease-out' : undefined,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      className="fixed top-16 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl
        bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm
        border border-green-200 dark:border-green-800
        shadow-lg cursor-pointer select-none pointer-events-auto"
    >
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"
        style={{ animation: 'check-pop 300ms ease-out both' }}
      >
        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
        {message}
      </span>
    </div>
  );
}
