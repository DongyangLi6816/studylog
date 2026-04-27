import { createContext, useContext } from 'react';
import { useTimer as useTimerLogic } from '../hooks/useTimer';

const Ctx = createContext(null);

export function TimerProvider({ children }) {
  const timer = useTimerLogic();
  return <Ctx.Provider value={timer}>{children}</Ctx.Provider>;
}

export function useTimer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
