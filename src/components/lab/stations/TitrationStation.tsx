import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SceneReadout } from "@/components/lab/instruments/Balance";
import { BuretteTube, Funnel, TitrantDrop } from "@/components/lab/instruments/Burette";
import {
  BenchSurface,
  ClampArm,
  ConicalFlask,
  GlassDefs,
  ReagentBottle,
  RetortStand,
  WhiteTile,
} from "@/components/lab/parts";
import { useLab } from "@/state/LabProvider";
import {
  PHYS,
  buretteReading,
  currentPhase,
  flaskColor,
  isNearEndpoint,
  phaseInfo,
  titreFraction,
} from "@/state/labMachine";
import type { FlowMode, FocusTarget } from "@/types";

const VIEW = "0 0 1000 620";
const BENCH = 520;

/* station geometry */
const BURETTE = { x: 420, y: 71, s: 0.75 };
const FLASK = { x: 355, y: 362, s: 0.75 };
const TIP = { x: 429.75, y: 350 };
const surfaceOf = (liquid: number) => FLASK.y + (206 - Math.min(70, liquid) * 1.55) * FLASK.s;

const ACTIVE: Record<string, FocusTarget[]> = {
  PREPARE_BURETTE: ["burette", "funnel"],
  INITIAL_READING: ["burette"],
  FINAL_READING: ["burette"],
  TITRATION: ["stopcock", "titrationFlask", "burette"],
};

const INTERVAL: Record<Exclude<FlowMode, "closed">, number> = {
  fast: PHYS.fastDropEvery,
  dropwise: PHYS.dropwiseEvery,
  precision: PHYS.precisionEvery,
};
const VOLUME: Record<Exclude<FlowMode, "closed">, number> = {
  fast: PHYS.fastDropVolume,
  dropwise: PHYS.dropwiseVolume,
  precision: PHYS.precisionVolume,
};

export function TitrationStation() {
  const { exp, state, dispatch } = useLab();
  const phase = currentPhase(state);
  const sim = exp.sim;
  const focus = phaseInfo(exp, phase).focus;
  const active = ACTIVE[phase] ?? [];
  const is = (t: FocusTarget) => active.includes(t);

  const [drops, setDrops] = useState<number[]>([]);
  const dropId = useRef(0);
  const flowing = phase === "TITRATION" && state.stopcock !== "closed" && !state.endpointConfirmed;

  useEffect(() => {
    if (!flowing) return;
    const mode = state.stopcock as Exclude<FlowMode, "closed">;
    const id = window.setInterval(() => {
      dropId.current += 1;
      const d = dropId.current;
      setDrops((prev) => [...prev.slice(-4), d]);
      dispatch({ type: "DELIVER", volume: VOLUME[mode] });
    }, INTERVAL[mode]);
    return () => window.clearInterval(id);
  }, [flowing, state.stopcock, dispatch]);

  const reading = buretteReading(state);
  const near = isNearEndpoint(state, exp);
  const f = titreFraction(state, exp);
  const flaskLiquid =
    exp.sim.prep.vessel === "conical" ? state.liquidInVessel : state.aliquotDispensed;

  const toggleStopcock = () => {
    if (phase !== "TITRATION") return;
    dispatch({ type: "SET_STOPCOCK", mode: state.stopcock === "closed" ? "dropwise" : "closed" });
  };

  return (
    <div className="relative h-full w-full">
      <svg viewBox={VIEW} className="h-full w-full" role="img" aria-label="Titration assembly">
        <GlassDefs />
        <BenchSurface y={BENCH} />

        {/* ── stand ───────────────────────────────────────────────────*/}
        <g transform="translate(204,498)">
          <RetortStand height={438} />
        </g>
        <g transform="translate(308,120)">
          <ClampArm length={112} />
        </g>
        <g transform="translate(308,300)">
          <ClampArm length={112} />
        </g>

        {/* ── white tile + titration flask ────────────────────────────*/}
        <g transform="translate(300,505)">
          <WhiteTile />
        </g>
        <g className={is("titrationFlask") ? "recede-none" : "recede"}>
          <g transform={`translate(${FLASK.x},${FLASK.y}) scale(${FLASK.s})`}>
            <ConicalFlask
              uid="titration"
              liquid={exp.sim.prep.vessel === "conical" ? state.liquidInVessel : state.aliquotDispensed}
              color={flaskColor(state, exp)}
              solid={0}
              swirl={state.swirling}
              flashes={state.dropFlash}
              focus={focus === "titrationFlask"}
              clickable={phase === "TITRATION"}
              onClick={() => dispatch({ type: "SWIRL" })}
              ariaLabel="Titration flask — click to swirl the contents"
            />
          </g>
        </g>

        {/* ── burette ─────────────────────────────────────────────────*/}
        <g className={is("burette") || is("stopcock") ? "recede-none" : "recede"}>
          <g transform={`translate(${BURETTE.x},${BURETTE.y}) scale(${BURETTE.s})`}>
            <BuretteTube
              level={state.buretteLevel}
              color={sim.titrant.color}
              stopcock={state.stopcock}
              onStopcock={toggleStopcock}
              focus={focus === "burette" || focus === "stopcock"}
              highlightReading={
                phase === "INITIAL_READING" || phase === "FINAL_READING" ? Math.max(0, reading) : null
              }
            />
          </g>
        </g>

        {/* ── funnel & titrant bottle (filling) ───────────────────────*/}
        {phase === "PREPARE_BURETTE" && (
          <>
            <g transform="translate(394,13) scale(0.6)">
              <Funnel color={sim.titrant.color} filling={state.filling} />
            </g>
            <g className={is("burette") ? "recede-none" : "recede"}>
              <motion.g
                animate={
                  state.filling
                    ? { x: 520, y: -95, rotate: -35 }
                    : { x: 700, y: 330, rotate: 0 }
                }
                transition={{ type: "spring", stiffness: 55, damping: 15 }}
                style={{ originX: "75px", originY: "190px" }}
              >
                <ReagentBottle
                  label={sim.titrant.name}
                  formula={sim.titrant.formula}
                  liquid={sim.titrant.color}
                  tag={`${sim.titrant.nominalMolarity} M`}
                  focus={focus === "burette"}
                  onClick={() => dispatch({ type: "FILL_BURETTE", on: true })}
                />
              </motion.g>
            </g>
            <AnimatePresence>
              {state.filling && (
                <motion.path
                  d="M487 6 Q470 16 452 32"
                  fill="none"
                  stroke={sim.titrant.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── falling titrant drops ───────────────────────────────────*/}
        <g transform={`translate(${TIP.x},${TIP.y})`}>
          {drops.map((d) => (
            <TitrantDrop
              key={d}
              id={d}
              from={4}
              to={surfaceOf(flaskLiquid) - TIP.y}
              color={sim.titrant.color}
              onComplete={() => setDrops((prev) => prev.filter((x) => x !== d))}
            />
          ))}
        </g>

        {/* endpoint glow */}
        <AnimatePresence>
          {f >= 1 && !state.overshot && (
            <motion.ellipse
              cx={430}
              cy={BENCH - 20}
              rx={150}
              ry={40}
              fill="#ffd23f"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
          {state.overshot && (
            <motion.ellipse
              cx={430}
              cy={BENCH - 20}
              rx={170}
              ry={44}
              fill="#ff6f6f"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.06, 0.16, 0.06] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </svg>

      {/* ── floating instrument readout ────────────────────────────────*/}
      <div className="absolute right-3 top-3 w-[184px] sm:right-5 sm:top-5">
        <SceneReadout
          rows={[
            { label: "Burette", value: `${reading.toFixed(2)} mL` },
            { label: "Delivered", value: `${state.delivered.toFixed(2)} mL` },
            {
              label: "Solution",
              value: f >= 1 ? (state.overshot ? "overshot" : "endpoint") : near ? "changing" : "before",
              tone: f >= 1 ? (state.overshot ? "bad" : "ok") : near ? "warn" : "neutral",
            },
          ]}
        />
      </div>
    </div>
  );
}
