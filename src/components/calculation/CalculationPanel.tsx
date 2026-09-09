import { useState } from "react";
import { Check, Sigma } from "lucide-react";
import { useLab } from "@/state/LabProvider";
import { computeResult, type Measurements } from "@/utils/chemistry";
import { Badge, Button, Eyebrow, Measurement } from "@/components/ui/primitives";

export function CalculationPanel() {
  const { exp, state, dispatch } = useLab();
  const [revealed, setRevealed] = useState(1);

  const m: Measurements = {
    sampleMass: state.confirmedMass ?? 0,
    flaskVolume: exp.sim.prep.flaskVolume ?? null,
    aliquot: exp.sim.prep.aliquot ?? null,
    initialReading: state.initialReading ?? 0,
    finalReading: state.finalReading ?? 0,
  };
  const result = computeResult(exp, m);
  const all = revealed >= result.steps.length;
  const unit = exp.sim.calculation.unit;

  return (
    <div className="lab-bg h-full overflow-y-auto scroll-thin rounded-3xl border border-white/[0.08] p-5 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Eyebrow>Step {String(exp.phases.indexOf("CALCULATION") + 1).padStart(2, "0")} · Calculation</Eyebrow>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-mist-50 sm:text-3xl">
          {exp.sim.calculation.mode === "standardize" ? "Standardization calculation" : "Assay calculation"}
        </h2>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-mist-300">
          Every value below comes from a measurement you made in this laboratory. Work through the
          steps in order to determine the {exp.sim.calculation.unknown.toLowerCase()}.
        </p>

        {/* inputs */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Measurement label="Sample mass" value={m.sampleMass.toFixed(4)} unit="g" />
          {m.flaskVolume && m.aliquot ? (
            <>
              <Measurement label="Flask volume" value={m.flaskVolume.toFixed(0)} unit="mL" />
              <Measurement label="Aliquot" value={m.aliquot.toFixed(2)} unit="mL" />
            </>
          ) : (
            <Measurement label="Stoichiometry" value={String(exp.sim.stoichRatio)} hint={exp.sim.stoichNote} />
          )}
          <Measurement label="Titre volume" value={result.titre.toFixed(2)} unit="mL" tone="accent" />
        </div>

        {/* steps */}
        <ol className="mt-6 space-y-3">
          {result.steps.slice(0, revealed).map((s, i) => (
            <li key={s.label} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] font-semibold text-mist-50">
                  {i + 1}. {s.label}
                </span>
                <span className="num rounded-lg border border-white/10 bg-ink-850 px-2.5 py-1 text-[13px] font-semibold text-accent-200">
                  {s.result}
                </span>
              </div>
              <div className="num mt-2.5 text-[13px] text-mist-300">{s.formula}</div>
              <div className="num mt-1 text-[13px] text-mist-400">{s.substitution}</div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          {!all ? (
            <Button variant="primary" onClick={() => setRevealed((r) => r + 1)}>
              <Sigma size={15} /> Reveal the next step
            </Button>
          ) : (
            <div className="glass-strong flex-1 rounded-3xl p-5">
              <Eyebrow>{exp.sim.calculation.unknown}</Eyebrow>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="num text-4xl font-bold leading-none text-mist-50">
                  {result.value.toFixed(exp.sim.calculation.mode === "standardize" ? 4 : 2)}
                </span>
                <span className="num text-base text-mist-400">{unit}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="info">{exp.sim.calculation.expectedLabel}</Badge>
                <span className="num text-[13px] font-semibold text-mist-200">
                  {exp.sim.calculation.expected.toFixed(exp.sim.calculation.mode === "standardize" ? 4 : 2)} {unit}
                </span>
              </div>
            </div>
          )}
          <Button
            variant={all ? "primary" : "ghost"}
            onClick={() => dispatch({ type: "NEXT_PHASE" })}
            disabled={!all}
            className="sm:w-auto"
          >
            <Check size={15} /> View the final report
          </Button>
        </div>
      </div>
    </div>
  );
}
