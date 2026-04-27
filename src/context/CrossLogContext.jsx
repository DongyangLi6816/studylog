import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);

export function CrossLogProvider({ children }) {
  const [pending, setPending] = useState(null); // { todo, list }

  const promptCrossLog = useCallback((todo, list) => {
    if (!todo || todo.crossLogged) return;
    if (todo.category !== 'LeetCode' && todo.category !== 'College') return;
    setPending({ todo, list });
  }, []);

  const dismiss = useCallback(() => setPending(null), []);

  return (
    <Ctx.Provider value={{ pending, promptCrossLog, dismiss }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCrossLog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCrossLog must be used within CrossLogProvider');
  return ctx;
}
