import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ParticleCanvas from './ParticleCanvas';

const DARK_COLORS  = ['#60A5FA', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#F87171', '#818CF8'];
const LIGHT_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function Tier1Toast({ message, onDismiss }) {
  const { theme } = useTheme();
  const [leaving, setLeaving] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true);
  const dismissedRef = useRef(false);

  const safeDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss();
  };

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2200);
    const t2 = setTimeout(safeDismiss, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = () => {
    setLeaving(true);
    setTimeout(safeDismiss, 600);
  };

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const particleGroups = [
    { type: 'ribbon',   count: 24, colors },
    { type: 'streamer', count: 45, colors },
  ];

  // Burst origin: center-x, just below the toast card (toast is at top-16 = 64px)
  const origin = { x: window.innerWidth / 2, y: 82 };

  return (
    <>
      {showCanvas && (
        <ParticleCanvas
          groups={particleGroups}
          duration={2000}
          origin={origin}
          onDone={() => setShowCanvas(false)}
        />
      )}

      <div
        onClick={handleClick}
        style={{
          animation: leaving ? undefined : 'toast-in 200ms ease-out both',
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateX(-50%) translateY(-10px)' : 'translateX(-50%)',
          transition: 'opacity 600ms ease-in, transform 600ms ease-in',
          left: '50%',
        }}
        className="fixed top-16 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-xl
          bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm
          border border-green-200 dark:border-green-800
          shadow-lg cursor-pointer select-none pointer-events-auto"
      >
        <span
          className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"
          style={{ animation: 'check-pop 300ms ease-out 200ms both' }}
        >
          <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span
          className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap"
          style={{ animation: 'msg-in 200ms ease-out 400ms both' }}
        >
          {message}
        </span>
      </div>
    </>
  );
}
