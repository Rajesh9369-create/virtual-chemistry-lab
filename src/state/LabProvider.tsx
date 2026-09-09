import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getExperiment } from "@/data/experiments";
import {
  autoAdvances,
  createInitialState,
  currentPhase,
  isPhaseComplete,
  labReducer,
  type LabAction,
} from "./labMachine";
import type { Experiment, LabState } from "@/types";

interface LabContextValue {
  exp: Experiment;
  state: LabState;
  dispatch: (action: LabAction) => void;
  complete: boolean;
  phase: ReturnType<typeof currentPhase>;
}

const LabContext = createContext<LabContextValue | null>(null);

/** Only tick the simulation while something is actually moving. */
function needsTick(s: LabState): boolean {
  return (
    s.scooping ||
    s.dispensing ||
    s.pouring ||
    s.drawing ||
    s.filling ||
    s.swirling > 0.002 ||
    (s.solidInVessel > 0 && s.dissolved < 1 && s.liquidInVessel >= 8)
  );
}

export function LabProvider({
  experimentId,
  children,
}: {
  experimentId: string;
  children: ReactNode;
}) {
  const exp = useMemo(() => getExperiment(experimentId), [experimentId]);
  const [state, dispatch] = useReducer(
    (s: LabState, a: LabAction) => labReducer(s, a, exp),
    exp,
    createInitialState,
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  /* ── animation clock ───────────────────────────────────────────────*/
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      // still tick once so that state changes that depend on time can settle
      const id = window.setInterval(() => {
        if (needsTick(stateRef.current)) dispatch({ type: "TICK", dt: 0.1 });
      }, 120);
      return () => window.clearInterval(id);
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (dt > 0 && needsTick(stateRef.current)) dispatch({ type: "TICK", dt });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── automatic progression ─────────────────────────────────────────*/
  const complete = isPhaseComplete(state, exp);
  const phase = currentPhase(state);
  const [toast, setToast] = useState<{ id: number; label: string } | null>(null);

  useEffect(() => {
    if (!complete || !autoAdvances(phase)) return;
    const snapshotIndex = state.index;
    const snapshotPhase = phase;
    const t = window.setTimeout(() => {
      const now = stateRef.current;
      if (now.index === snapshotIndex && isPhaseComplete(now, exp)) {
        setToast({ id: Date.now(), label: snapshotPhase });
        dispatch({ type: "NEXT_PHASE" });
      }
    }, 760);
    return () => window.clearTimeout(t);
  }, [complete, phase, state.index, exp]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const value = useMemo<LabContextValue>(
    () => ({ exp, state, dispatch, complete, phase }),
    [exp, state, complete, phase],
  );

  return (
    <LabContext.Provider value={value}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 sm:bottom-28">
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-mist-100 shadow-2xl">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ok-400/20 text-ok-400">
              ✓
            </span>
            Step complete — moving on
          </div>
        </div>
      )}
    </LabContext.Provider>
  );
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used inside a LabProvider");
  return ctx;
}

/** Convenience hook for pointer hold interactions (works for touch + mouse + keyboard). */
export function useHold(onChange: (active: boolean) => void) {
  const cb = useRef(onChange);
  cb.current = onChange;
  const stop = useCallback(() => cb.current(false), []);
  const start = useCallback(() => cb.current(true), []);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      start();
    },
    onPointerUp: stop,
    onPointerCancel: stop,
    onPointerLeave: stop,
    onKeyDown: (e: React.KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        start();
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") stop();
    },
    onBlur: stop,
  };
}
