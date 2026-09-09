import { motion } from "framer-motion";
import { Check, ChevronRight, Circle, AlertTriangle, NotebookPen, RotateCcw } from "lucide-react";
import { PhaseControls } from "@/components/lab/PhaseControls";
import { useLab } from "@/state/LabProvider";
import {
  PHASE_LABEL,
  buretteReading,
  currentPhase,
  phaseInfo,
  phaseStatus,
  titreFraction,
} from "@/state/labMachine";
import { Badge, Button, Disclosure, Eyebrow, Measurement } from "@/components/ui/primitives";
import { cn } from "@/utils/cn";

function measurements() {
  const { exp, state } = useLab();
  const phase = currentPhase(state);
  const sim = exp.sim;
  const rows: { label: string; value: string; unit?: string; tone?: "ok" | "warn" | "bad" | "accent" | "neutral"; hint?: string }[] = [];

  switch (phase) {
    case "WEIGH":
      rows.push({ label: "Target mass", value: sim.sample.targetMass.toFixed(3), unit: "g" });
      rows.push({
        label: "Mass on paper",
        value: state.powderOnPaper.toFixed(4),
        unit: "g",
        tone: Math.abs(state.powderOnPaper - sim.sample.targetMass) <= sim.sample.massTolerance ? "ok" : "warn",
        hint: `accepted ±${sim.sample.massTolerance.toFixed(3)} g`,
      });
      break;
    case "TRANSFER":
      rows.push({ label: "Mass on paper", value: state.powderOnPaper.toFixed(4), unit: "g" });
      rows.push({ label: "Mass in flask", value: state.solidInVessel.toFixed(4), unit: "g" });
      break;
    case "ADD_WATER":
      rows.push({ label: "Solvent added", value: state.liquidInVessel.toFixed(1), unit: "mL" });
      rows.push({ label: "Required", value: sim.prep.dissolveWater.toFixed(0), unit: "mL" });
      break;
    case "DISSOLVE":
      rows.push({ label: "Dissolved", value: (state.dissolved * 100).toFixed(0), unit: "%", tone: state.dissolved > 0.98 ? "ok" : "warn" });
      rows.push({ label: "Volume", value: state.liquidInVessel.toFixed(1), unit: "mL" });
      break;
    case "MAKEUP":
      rows.push({
        label: "Flask volume",
        value: state.liquidInVessel.toFixed(2),
        unit: "mL",
        tone: Math.abs(state.liquidInVessel - (sim.prep.flaskVolume ?? 100)) <= 0.6 ? "ok" : "warn",
      });
      rows.push({ label: "Mark", value: (sim.prep.flaskVolume ?? 100).toFixed(1), unit: "mL" });
      break;
    case "ALIQUOT":
      rows.push({
        label: "Pipette volume",
        value: state.pipetteVolume.toFixed(2),
        unit: "mL",
        tone: Math.abs(state.pipetteVolume - (sim.prep.aliquot ?? 25)) <= 0.15 ? "ok" : "warn",
      });
      rows.push({ label: "Graduation mark", value: (sim.prep.aliquot ?? 25).toFixed(2), unit: "mL" });
      break;
    case "ADD_INDICATOR":
      rows.push({ label: "Drops added", value: String(state.indicatorDrops), tone: state.indicatorDrops >= (sim.indicator?.drops ?? 2) ? "ok" : "neutral" });
      rows.push({ label: "Flask volume", value: (sim.prep.vessel === "conical" ? state.liquidInVessel : state.aliquotDispensed).toFixed(2), unit: "mL" });
      break;
    case "PREPARE_BURETTE":
      rows.push({ label: "Burette reading", value: buretteReading(state).toFixed(2), unit: "mL", tone: Math.abs(buretteReading(state)) <= 0.1 ? "ok" : "warn" });
      rows.push({ label: "Titrant", value: sim.titrant.formula, hint: `≈ ${sim.titrant.nominalMolarity} mol/L` });
      break;
    case "INITIAL_READING":
    case "FINAL_READING":
      rows.push({ label: "Burette reading", value: buretteReading(state).toFixed(2), unit: "mL" });
      rows.push({ label: "Delivered", value: state.delivered.toFixed(2), unit: "mL" });
      break;
    case "TITRATION":
      rows.push({ label: "Initial reading", value: (state.initialReading ?? 0).toFixed(2), unit: "mL" });
      rows.push({
        label: "Titre delivered",
        value: state.delivered.toFixed(2),
        unit: "mL",
        tone: titreFraction(state, exp) >= 1 ? (state.overshot ? "bad" : "ok") : "neutral",
      });
      break;
    default:
      break;
  }
  if (rows.length === 0) return null;
  return (
    <div className={cn("grid gap-2", rows.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
      {rows.map((r) => (
        <Measurement key={r.label} label={r.label} value={r.value} unit={r.unit} tone={r.tone ?? "neutral"} hint={r.hint} />
      ))}
    </div>
  );
}

export function Notebook() {
  const { exp, state, phase, dispatch } = useLab();
  const info = phaseInfo(exp, phase);
  const done = state.phases.slice(0, state.index);
  const remaining = state.phases.slice(state.index + 1);
  const progress = (state.index / (state.phases.length - 1)) * 100;

  return (
    <aside className="glass-strong flex h-full flex-col overflow-hidden rounded-3xl">
      {/* header */}
      <div className="border-b border-white/[0.07] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="num rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-mist-300">
                {exp.code}
              </span>
              <span className="label-eyebrow">Lab notebook</span>
            </div>
            <h2 className="mt-2 truncate text-[15px] font-semibold tracking-tight text-mist-50">
              {exp.title}
            </h2>
          </div>
          <Badge tone="neutral">Run {state.attempt}</Badge>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {/* current step */}
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="accent">{info.step}</Badge>
            {info.target && phase !== "TITRATION" && (
              <span className="num text-[11px] text-mist-400">
                target {info.target.value} {info.target.unit}
              </span>
            )}
          </div>
          <h3 className="mt-2.5 text-lg font-semibold leading-tight tracking-tight text-mist-50">
            {info.title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-mist-200">{info.instruction}</p>
        </div>

        {measurements()}

        {/* controls */}
        <div className="rounded-2xl border border-white/[0.07] bg-ink-900/50 p-3">
          <Eyebrow className="mb-2.5">Laboratory controls</Eyebrow>
          <PhaseControls />
        </div>

        {/* context */}
        {(info.why || info.technique || info.safety) && (
          <div className="space-y-2">
            {info.why && <Disclosure title="Why does this matter?">{info.why}</Disclosure>}
            {info.technique && <Disclosure title="Technique">{info.technique}</Disclosure>}
            {info.safety && <Disclosure title="Safety">{info.safety}</Disclosure>}
          </div>
        )}

        {/* timeline */}
        <div>
          <Eyebrow className="mb-2.5">Procedure timeline</Eyebrow>
          <ol className="space-y-1">
            {[...done, phase, ...remaining].map((p) => {
              const status = phaseStatus(state, p);
              return (
                <li
                  key={p}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] transition-colors",
                    status === "active" && "bg-accent-500/[0.14] text-mist-50",
                    status === "done" && "text-mist-400",
                    status === "todo" && "text-mist-500",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                      status === "done" && "border-ok-400/40 bg-ok-400/15 text-ok-400",
                      status === "active" && "border-accent-300/60 bg-accent-500/25 text-accent-200",
                      status === "todo" && "border-white/12 text-mist-500",
                    )}
                  >
                    {status === "done" ? <Check size={11} /> : status === "active" ? <ChevronRight size={11} /> : <Circle size={5} />}
                  </span>
                  <span className={cn(status === "active" && "font-semibold")}>{PHASE_LABEL[p]}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* observations */}
        {state.observations.length > 0 && (
          <div>
            <Eyebrow className="mb-2">Recorded observations</Eyebrow>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              {state.observations.map((o, i) => (
                <div
                  key={o.label}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2 text-[12.5px]",
                    i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent",
                  )}
                >
                  <span className="text-mist-400">{o.label}</span>
                  <span className="num font-semibold text-mist-100">{o.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* deviations */}
        {state.deviations.length > 0 && (
          <div>
            <Eyebrow className="mb-2">Deviations recorded</Eyebrow>
            <div className="space-y-2">
              {state.deviations.map((d) => (
                <div
                  key={d.id}
                  className={cn(
                    "rounded-2xl border p-3",
                    d.severity === "error" ? "border-bad-400/30 bg-bad-400/[0.07]" : "border-warn-400/30 bg-warn-400/[0.06]",
                  )}
                >
                  <div className="flex items-center gap-2 text-[12.5px] font-semibold text-mist-50">
                    <AlertTriangle size={13} className={d.severity === "error" ? "text-bad-400" : "text-warn-400"} />
                    {d.title}
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-mist-300">{d.what}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-mist-400">
                    <span className="font-semibold text-mist-300">Why it matters: </span>
                    {d.why}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-mist-400">
                    <span className="font-semibold text-mist-300">Correction: </span>
                    {d.fix}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] p-3.5">
        <span className="flex items-center gap-2 text-[11.5px] text-mist-500">
          <NotebookPen size={13} /> {state.observations.length} entries
        </span>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "RESTART" })}>
          <RotateCcw size={13} /> Restart
        </Button>
      </div>
    </aside>
  );
}
