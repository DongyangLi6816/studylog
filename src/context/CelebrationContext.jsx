import { createContext, useContext, useState, useCallback, useRef } from 'react';

const MESSAGES = [
  "Locked in. 🔥",
  "Another one down.",
  "Solid work.",
  "That's the way.",
  "Clean solve. 💪",
  "Keep stacking.",
  "Logged and loaded.",
  "Progress made.",
  "+1. Let's go.",
  "Nicely done.",
  "On a roll.",
  "Brain gains. 🧠",
  "Momentum.",
  "One more in the books.",
  "You showed up. That's what matters.",
  "Consistency wins.",
];

const Ctx = createContext(null);

export function CelebrationProvider({ children }) {
  const [celebration, setCelebration] = useState(null);
  const lastMsgRef = useRef(null);

  const triggerCelebration = useCallback((tier = 1) => {
    if (tier === 1) {
      let msg;
      do {
        msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      } while (msg === lastMsgRef.current && MESSAGES.length > 1);
      lastMsgRef.current = msg;
      setCelebration({ tier: 1, message: msg, id: Date.now() });
    }
  }, []);

  const clearCelebration = useCallback(() => setCelebration(null), []);

  return (
    <Ctx.Provider value={{ celebration, triggerCelebration, clearCelebration }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCelebration() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCelebration must be used within CelebrationProvider');
  return ctx;
}
