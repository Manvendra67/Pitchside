import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { achievementStatus, type Achievement } from '@/lib/achievements';
import { EASE, gsap, prefersReducedMotion } from '@/lib/motion';
import { computeStats } from '@/lib/stats';
import { actions, useStore } from '@/lib/store';
import { AchievementBadge } from './AchievementBadge';
import { CheckDraw } from './CheckDraw';

interface Toast {
  id: number;
  title: string;
  body?: string;
  achievement?: Achievement;
}

const ToastContext = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(ToastContext);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const toast = { ...t, id: nextId++ };
    setToasts((all) => [...all.slice(-2), toast]);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <AchievementWatcher push={push} />
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const reduced = prefersReducedMotion();
    const life = toast.achievement ? 4.6 : 2.8;
    const tl = gsap.timeline({ onComplete: onDone });
    if (reduced) {
      tl.set(node, { opacity: 1 }).to(node, { opacity: 0, duration: 0.2 }, life);
    } else {
      tl.fromTo(node, { y: 24, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'settle' });
      if (toast.achievement) {
        tl.fromTo(
          node.querySelector('.badge'),
          { scale: 0.4, rotate: -25 },
          { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2.2)' },
          0.1,
        ).fromTo(node.querySelector('.toast__shine'), { xPercent: -120 }, { xPercent: 220, duration: 1.1, ease: EASE }, 0.35);
      }
      tl.to(node, { y: 12, opacity: 0, duration: 0.3, ease: 'power2.in' }, life);
    }
    return () => {
      tl.kill();
    };
  }, [onDone, toast.achievement]);

  return (
    <div ref={el} className={`toast${toast.achievement ? ' toast--achievement' : ''}`} style={{ opacity: 0 }}>
      {toast.achievement ? (
        <AchievementBadge achievement={toast.achievement} unlocked size={48} />
      ) : (
        <span className="toast__check">
          <CheckDraw done size={18} />
        </span>
      )}
      <div>
        <p className="toast__title">{toast.title}</p>
        {toast.body && <p className="toast__body">{toast.body}</p>}
      </div>
      {toast.achievement && <span className="toast__shine" aria-hidden="true" />}
    </div>
  );
}

/** Announces milestones the moment they unlock — once each. */
function AchievementWatcher({ push }: { push: (t: Omit<Toast, 'id'>) => void }) {
  const state = useStore();
  const unlocked = useMemo(
    () =>
      achievementStatus(computeStats(state))
        .filter((a) => a.unlocked)
        .map((a) => a.achievement),
    [state],
  );

  useEffect(() => {
    const fresh = unlocked.filter((a) => !state.seenAchievements.includes(a.id));
    if (!fresh.length) return;
    actions.markAchievementsSeen(fresh.map((a) => a.id));
    fresh.forEach((a, i) =>
      window.setTimeout(() => push({ title: `Milestone unlocked: ${a.name}`, body: a.description, achievement: a }), 700 + i * 900),
    );
  }, [unlocked, state.seenAchievements, push]);

  return null;
}
