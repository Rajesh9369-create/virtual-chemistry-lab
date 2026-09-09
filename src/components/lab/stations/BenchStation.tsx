import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLab } from "@/state/LabProvider";
import { SOLVENT_COLOR, currentPhase, flaskColor, phaseInfo } from "@/state/labMachine";
import {
  BenchSurface,
  ConicalFlask,
  ContactShadow,
  GlassDefs,
  IndicatorBottle,
  Pipette,
  SolventBottle,
  VolumetricFlask,
} from "@/components/lab/parts";
import type { FocusTarget } from "@/types";

const VIEW = "0 0 1000 620";
const BENCH = 520;

const ACTIVE: Record<string, FocusTarget[]> = {
  ADD_WATER: ["washBottle", "prepVessel"],
  DISSOLVE: ["prepVessel"],
  MAKEUP: ["washBottle", "prepVessel"],
  ALIQUOT: ["pipette", "prepVessel"],
  ADD_INDICATOR: ["indicator", "titrationFlask"],
};

export function BenchStation() {
  const { exp, state, dispatch } = useLab();
  const phase = currentPhase(state);
  const sim = exp.sim;
  const focus = phaseInfo(exp, phase).focus;
  const active = ACTIVE[phase] ?? [];
  const is = (t: FocusTarget) => active.includes(t);

  const [indicatorDrop, setIndicatorDrop] = useState<{ id: number } | null>(null);

  const usesDilution = sim.prep.vessel === "volumetric";
  const flaskLiquid = usesDilution && phase === "ADD_INDICATOR" ? state.aliquotDispensed : state.liquidInVessel;

  const addIndicatorDrop = () => {
    if (phase !== "ADD_INDICATOR") return;
    const id = Date.now();
    setIndicatorDrop({ id });
    window.setTimeout(() => {
      dispatch({ type: "ADD_DROP" });
      setIndicatorDrop(null);
    }, 620);
  };

  const pipetteAt: "rest" | "drawing" | "lifted" | "dispensing" = state.drawing
    ? "drawing"
    : state.pipetteVolume > 0.2
      ? state.aliquotConfirmed
        ? "dispensing"
        : "lifted"
      : "rest";

  const pipettePos =
    pipetteAt === "drawing"
      ? { x: 333, y: 177 }
      : pipetteAt === "lifted"
        ? { x: 333, y: 32 }
        : pipetteAt === "dispensing"
          ? { x: 683, y: 87 }
          : { x: 503, y: 222 };

  return (
    <svg viewBox={VIEW} className="h-full w-full" role="img" aria-label="Solution preparation bench">
      <GlassDefs />
      <BenchSurface y={BENCH} />

      {/* ── solvent bottle ───────────────────────────────────────────*/}
      <g className={is("washBottle") ? "recede-none" : "recede"}>
        <ContactShadow cx={165} cy={518} rx={70} />
        <motion.g
          animate={
            state.pouring
              ? { x: 400, y: 120, rotate: 0 }
              : { x: 90, y: 340, rotate: 0 }
          }
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          <SolventBottle
            label={sim.prep.solventName ?? "Distilled water"}
            pouring={state.pouring}
            focus={focus === "washBottle"}
            onHoldStart={phase === "ADD_WATER" || phase === "MAKEUP" ? () => dispatch({ type: "POUR", on: true }) : undefined}
            onHoldEnd={state.pouring ? () => dispatch({ type: "POUR", on: false }) : undefined}
          />
        </motion.g>
      </g>

      {/* solvent stream */}
      <AnimatePresence>
        {state.pouring && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.path
              d="M560 150 Q566 230 524 300"
              fill="none"
              stroke={SOLVENT_COLOR}
              strokeWidth={phase === "MAKEUP" ? 3 : 6}
              strokeLinecap="round"
              opacity="0.85"
              animate={{ opacity: [0.6, 0.95, 0.6] }}
              transition={{ duration: 0.28, repeat: Infinity }}
            />
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                r={2.4}
                fill={SOLVENT_COLOR}
                initial={{ cx: 560, cy: 150, opacity: 0 }}
                animate={{ cx: [560, 548, 526], cy: [150, 230, 300], opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.16, ease: "easeIn" }}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>

      {/* ── preparation vessel ───────────────────────────────────────*/}
      <g className={is("prepVessel") ? "recede-none" : "recede"}>
        <ContactShadow cx={520} cy={518} rx={78} />
        {usesDilution && phase !== "ADD_INDICATOR" ? (
          <g transform="translate(420,300)">
            <VolumetricFlask
              uid="prep"
              volume={state.liquidInVessel}
              capacity={sim.prep.flaskVolume ?? 100}
              color={SOLVENT_COLOR}
              solid={state.solidInVessel}
              solidColor={sim.sample.powderColor}
              dissolving={state.dissolved}
              swirl={state.swirling}
              focus={focus === "prepVessel"}
              onClick={
                phase === "DISSOLVE"
                  ? () => dispatch({ type: "SWIRL" })
                  : phase === "ADD_WATER" || phase === "MAKEUP"
                    ? () => dispatch({ type: "POUR", on: !state.pouring })
                    : undefined
              }
            />
          </g>
        ) : (
          <g transform="translate(420,310)">
            <ConicalFlask
              uid="prep"
              liquid={flaskLiquid}
              color={phase === "ADD_INDICATOR" ? flaskColor(state, exp) : SOLVENT_COLOR}
              solid={state.solidInVessel}
              solidColor={sim.sample.powderColor}
              dissolving={state.dissolved}
              swirl={state.swirling}
              focus={focus === "prepVessel"}
              clickable={phase === "DISSOLVE"}
              onClick={() => dispatch({ type: "SWIRL" })}
              ariaLabel="Conical flask — click to swirl"
            />
          </g>
        )}
      </g>

      {/* make-up-to-mark guide */}
      {phase === "MAKEUP" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path
            d={`M420 ${352} L620 ${352}`}
            stroke="#ffd23f"
            strokeWidth="1.6"
            strokeDasharray="7 6"
            opacity="0.85"
          />
          <text x="628" y="356" fill="#ffd23f" fontSize="11" fontFamily="Inter, sans-serif">
            {sim.prep.flaskVolume} mL mark
          </text>
        </motion.g>
      )}

      {/* ── conical flask receiving the aliquot ──────────────────────*/}
      {(phase === "ALIQUOT" || phase === "ADD_INDICATOR") && usesDilution && (
        <g className={is("titrationFlask") || is("prepVessel") ? "recede-none" : "recede"}>
          <ContactShadow cx={700} cy={518} rx={70} />
          <g transform="translate(600,310)">
            <ConicalFlask
              uid="aliquot"
              liquid={state.aliquotDispensed}
              color={phase === "ADD_INDICATOR" ? flaskColor(state, exp) : SOLVENT_COLOR}
              swirl={state.swirling}
              focus={focus === "titrationFlask"}
            />
          </g>
        </g>
      )}

      {/* ── pipette ──────────────────────────────────────────────────*/}
      {phase === "ALIQUOT" && (
        <>
          <g className={is("pipette") ? "recede-none" : "recede"}>
            <motion.g
              animate={pipettePos}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            >
              <g transform="scale(0.55)">
                <Pipette
                  uid="work"
                  volume={state.pipetteVolume}
                  target={sim.prep.aliquot ?? 25}
                  color={SOLVENT_COLOR}
                  focus={focus === "pipette"}
                />
              </g>
            </motion.g>
          </g>
          <AnimatePresence>
            {pipetteAt === "dispensing" && (
              <motion.path
                d="M700 306 L700 360"
                stroke={SOLVENT_COLOR}
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 0.95, 0.5] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── indicator bottle ─────────────────────────────────────────*/}
      {phase === "ADD_INDICATOR" && sim.indicator && (
        <g className={is("indicator") ? "recede-none" : "recede"}>
          <ContactShadow cx={805} cy={518} rx={52} />
          <motion.g
            animate={indicatorDrop ? { x: 320, y: 30 } : { x: 740, y: 380 }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
          >
            <IndicatorBottle
              label={sim.indicator.name}
              color={sim.colors.initial}
              focus={focus === "indicator"}
              tilt={!!indicatorDrop}
              onClick={addIndicatorDrop}
            />
          </motion.g>
          <AnimatePresence>
            {indicatorDrop && (
              <motion.circle
                key={indicatorDrop.id}
                r={4.5}
                fill={sim.colors.initial}
                initial={{ cx: 500, cy: 250, opacity: 0 }}
                animate={{ cx: 508, cy: 372, opacity: [0, 1, 1, 0.9] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeIn" }}
              />
            )}
          </AnimatePresence>
        </g>
      )}

      {/* liquid surface ripples while pouring */}
      <AnimatePresence>
        {state.pouring && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[0, 0.4].map((d) => (
              <motion.ellipse
                key={d}
                cx={524}
                cy={BENCH - 158}
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.35"
                strokeWidth="1.4"
                initial={{ rx: 4, ry: 1.4, opacity: 0.8 }}
                animate={{ rx: 30, ry: 6, opacity: 0 }}
                transition={{ duration: 1.1, repeat: Infinity, delay: d, ease: "easeOut" }}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
