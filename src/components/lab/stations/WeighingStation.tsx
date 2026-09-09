import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLab } from "@/state/LabProvider";
import { currentPhase, phaseInfo } from "@/state/labMachine";
import { AnalyticalBalance } from "@/components/lab/instruments/Balance";
import {
  BenchSurface,
  ConicalFlask,
  ContactShadow,
  GlassDefs,
  PowderStream,
  ReagentBottle,
  Spatula,
  VolumetricFlask,
  WeighingPaper,
} from "@/components/lab/parts";
import { SOLVENT_COLOR } from "@/state/labMachine";
import type { FocusTarget } from "@/types";

const VIEW = "0 0 1000 620";
const BENCH = 520;

const ACTIVE: Record<string, FocusTarget[]> = {
  PREPARE: ["reagent"],
  WEIGH: ["spatula", "reagent", "balance", "weighingPaper"],
  TRANSFER: ["weighingPaper", "prepVessel"],
};

export function WeighingStation() {
  const { exp, state, dispatch } = useLab();
  const phase = currentPhase(state);
  const sim = exp.sim;
  const focus = phaseInfo(exp, phase).focus;
  const [transferring, setTransferring] = useState(false);

  const active = ACTIVE[phase] ?? [];
  const is = (t: FocusTarget) => active.includes(t);
  const powderColor = sim.sample.powderColor;
  const stable = state.balanceStableTimer > 0.35;

  const startTransfer = () => {
    if (state.powderOnPaper <= 0.0002 || transferring) return;
    setTransferring(true);
    window.setTimeout(() => dispatch({ type: "TRANSFER" }), 950);
  };

  return (
    <svg viewBox={VIEW} className="h-full w-full" role="img" aria-label="Analytical weighing station">
      <GlassDefs />
      <BenchSurface y={BENCH} />

      {/* ── analytical balance ───────────────────────────────────────*/}
      <g className={is("balance") ? "recede-none" : "recede"}>
        <ContactShadow cx={230} cy={516} rx={140} />
        <g transform="translate(70,300)">
          <AnalyticalBalance
            reading={state.powderOnPaper}
            stable={stable}
            tared={state.tared}
            focus={focus === "balance"}
            onTare={phase === "WEIGH" ? () => dispatch({ type: "TARE" }) : undefined}
          />
        </g>
      </g>

      {/* ── weighing paper ───────────────────────────────────────────*/}
      <g className={is("weighingPaper") ? "recede-none" : "recede"}>
        <motion.g
          initial={false}
          animate={
            transferring
              ? { x: 350, y: -80, rotate: -18 }
              : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
        >
          <g transform="translate(150,288)">
            <WeighingPaper
              mass={state.powderOnPaper}
              color={powderColor}
              focus={focus === "weighingPaper"}
              tilting={transferring ? 1 : 0}
              onClick={
                phase === "TRANSFER"
                  ? startTransfer
                  : phase === "WEIGH"
                    ? () => dispatch({ type: "TAP_PAPER" })
                    : undefined
              }
            />
          </g>
        </motion.g>
      </g>

      {/* powder falling onto the paper */}
      <g transform="translate(230,244)">
        <PowderStream active={state.dispensing} color={powderColor} seed={phase === "WEIGH" ? 1 : 0} />
      </g>

      {/* ── spatula ──────────────────────────────────────────────────*/}
      <g className={is("spatula") ? "recede-none" : "recede"}>
        <motion.g
          animate={
            state.spatulaAt === "bottle"
              ? { x: 690, y: 268, rotate: 0 }
              : { x: 128, y: 236, rotate: 0 }
          }
          transition={{ type: "spring", stiffness: 70, damping: 14 }}
        >
          <Spatula load={state.spatulaLoad} color={powderColor} at={state.spatulaAt} />
        </motion.g>
      </g>

      {/* ── reagent bottle ───────────────────────────────────────────*/}
      <g className={is("reagent") ? "recede-none" : "recede"}>
        <ContactShadow cx={845} cy={518} rx={78} />
        <g transform="translate(770,330)">
          <ReagentBottle
            label={sim.sample.name}
            formula={sim.sample.formula}
            powderColor={powderColor}
            open={state.reagentSelected}
            focus={focus === "reagent"}
            onClick={
              phase === "PREPARE"
                ? () => dispatch({ type: "SELECT_REAGENT" })
                : phase === "WEIGH"
                  ? () => {
                      dispatch({ type: "SPATULA_TO", at: "bottle" });
                      dispatch({ type: "SCOOP", on: true });
                      window.setTimeout(() => dispatch({ type: "SCOOP", on: false }), 1400);
                    }
                  : undefined
            }
          />
        </g>
      </g>

      {/* ── receiving vessel ─────────────────────────────────────────*/}
      <g className={is("prepVessel") ? "recede-none" : "recede"}>
        <ContactShadow cx={560} cy={518} rx={80} />
        <AnimatePresence>
          <motion.g
            key={sim.prep.vessel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {sim.prep.vessel === "volumetric" ? (
              <g transform="translate(460,300)">
                <VolumetricFlask
                  uid="prep"
                  volume={state.liquidInVessel}
                  capacity={sim.prep.flaskVolume ?? 100}
                  color={SOLVENT_COLOR}
                  solid={state.solidInVessel}
                  solidColor={powderColor}
                  dissolving={state.dissolved}
                  swirl={state.swirling}
                  focus={focus === "prepVessel"}
                />
              </g>
            ) : (
              <g transform="translate(460,310)">
                <ConicalFlask
                  uid="prep"
                  liquid={state.liquidInVessel}
                  color={SOLVENT_COLOR}
                  solid={state.solidInVessel}
                  solidColor={powderColor}
                  dissolving={state.dissolved}
                  swirl={state.swirling}
                  focus={focus === "prepVessel"}
                  ariaLabel="Conical flask containing the weighed sample"
                />
              </g>
            )}
          </motion.g>
        </AnimatePresence>
      </g>

      {/* powder falling into the vessel during transfer */}
      <g transform="translate(560,250)">
        <PowderStream active={transferring} color={powderColor} seed={7} />
      </g>
    </svg>
  );
}
