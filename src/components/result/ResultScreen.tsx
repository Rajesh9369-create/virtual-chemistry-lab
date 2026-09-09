import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, RotateCcw, Target, TriangleAlert } from "lucide-react";
import { useLab } from "@/state/LabProvider";
import { accuracyBand, computeResult, type Measurements } from "@/utils/chemistry";
import { Badge, Button, Eyebrow, Measurement } from "@/components/ui/primitives";
import { cn } from "@/utils/cn";

export function ResultScreen({
  onExit,
  onNext,
}: {
  onExit: () => void;
  onNext: () => void;
}) {
  const { exp, state, dispatch } = useLab();
  const m: Measurements = {
    sampleMass: state.confirmedMass ?? 0,
    flaskVolume: exp.sim.prep.flaskVolume ?? null,
    aliquot: exp.sim.prep.aliquot ?? null,
    initialReading: state.initialReading ?? 0,
    finalReading: state.finalReading ?? 0,
  };
  const result = computeResult(exp, m);
  const band = accuracyBand(result.value, exp.sim.calculation.expected);
  const dp = exp.sim.calculation.mode === "standardize" ? 4 : 2;
  const tone = band.tone;

  return (
    <div className="lab-bg min-h-full overflow-y-auto scroll-thin rounded-3xl border border-white/[0.08] p-5 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-ok-400/40 bg-ok-400/15 text-ok-400">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <Eyebrow>Experiment complete</Eyebrow>
              <div className="text-[13px] font-semibold text-mist-200">
                {exp.code} · Run {state.attempt}
              </div>
            </div>
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.02em] text-mist-50 sm:text-[40px]">
            {exp.title}
          </h1>
        </motion.div>

        {/* headline result */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="glass-strong mt-7 rounded-3xl p-6 sm:p-7"
        >
          <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr] sm:items-center">
            <div>
              <Eyebrow>{exp.sim.calculation.unknown}</Eyebrow>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <span className="num text-[52px] font-bold leading-none text-mist-50 sm:text-[64px]">
                  {result.value.toFixed(dp)}
                </span>
                <span className="num text-lg text-mist-400">{exp.sim.calculation.unit}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge
                  tone={tone === "ok" ? "ok" : tone === "info" ? "info" : tone === "warn" ? "warn" : "bad"}
                >
                  <Target size={12} /> {band.grade}
                </Badge>
                <Badge tone="neutral">deviation {band.pct.toFixed(2)} %</Badge>
                {state.overshot && <Badge tone="bad">endpoint overshot</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Measurement label={exp.sim.calculation.expectedLabel} value={exp.sim.calculation.expected.toFixed(dp)} unit={exp.sim.calculation.unit} />
              <Measurement label="Observed value" value={result.value.toFixed(dp)} unit={exp.sim.calculation.unit} tone="accent" />
            </div>
          </div>
          <p className="mt-5 border-t border-white/[0.08] pt-4 text-[13px] leading-relaxed text-mist-300">
            {exp.sim.calculation.toleranceHint} {state.deviations.length === 0
              ? "No procedural deviations were recorded — every operation was within tolerance."
              : `${state.deviations.length} deviation${state.deviations.length > 1 ? "s" : ""} recorded during the run.`}
          </p>
        </motion.div>

        {/* observations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="glass rounded-3xl p-5 sm:p-6">
            <Eyebrow>Observations</Eyebrow>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
              {[
                ...state.observations,
                { label: "Sample weighed", value: `${m.sampleMass.toFixed(4)} g` },
                ...(m.aliquot && m.flaskVolume
                  ? [{ label: "Aliquot taken", value: `${m.aliquot.toFixed(2)} mL of ${m.flaskVolume} mL` }]
                  : []),
              ].map((o, i) => (
                <div
                  key={o.label}
                  className={cn(
                    "flex items-center justify-between gap-4 px-4 py-2.5 text-[13px]",
                    i % 2 === 0 ? "bg-white/[0.03]" : "",
                  )}
                >
                  <span className="text-mist-400">{o.label}</span>
                  <span className="num font-semibold text-mist-100">{o.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-ink-900/60 p-4">
              <Eyebrow>Reaction</Eyebrow>
              {exp.reaction.map((r) => (
                <div key={r} className="num mt-2 text-[13.5px] leading-relaxed text-mist-200">
                  {r}
                </div>
              ))}
              <div className="mt-2 text-[12.5px] text-mist-400">{exp.sim.stoichNote}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-3xl p-5">
              <Eyebrow>Endpoint</Eyebrow>
              <p className="mt-2 text-[13px] leading-relaxed text-mist-300">{exp.endpoint}</p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: exp.sim.colors.initial }} />
                <span className="text-mist-500">→</span>
                <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: exp.sim.colors.endpoint }} />
                <span className="ml-1 text-[12px] text-mist-300">
                  {exp.sim.indicator?.transition ?? "self-indicating"}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "rounded-3xl p-5",
                state.deviations.length ? "border border-warn-400/25 bg-warn-400/[0.06]" : "border border-ok-400/25 bg-ok-400/[0.06]",
              )}
            >
              <Eyebrow>Procedural review</Eyebrow>
              {state.deviations.length === 0 ? (
                <p className="mt-2 text-[13px] leading-relaxed text-mist-200">
                  All operations were performed within tolerance — weighing, volume make-up, burette
                  readings and endpoint detection.
                </p>
              ) : (
                <ul className="mt-2 space-y-2.5">
                  {state.deviations.map((d) => (
                    <li key={d.id} className="text-[12.5px] leading-relaxed text-mist-300">
                      <span className="flex items-center gap-1.5 font-semibold text-mist-100">
                        <TriangleAlert size={12} className={d.severity === "error" ? "text-bad-400" : "text-warn-400"} />
                        {d.title}
                      </span>
                      {d.fix}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Button variant="primary" onClick={onNext} className="sm:flex-1">
            Next experiment <ArrowRight size={15} />
          </Button>
          <Button variant="subtle" onClick={() => dispatch({ type: "RESTART" })}>
            <RotateCcw size={15} /> Repeat this experiment
          </Button>
          <Button variant="ghost" onClick={onExit}>
            Back to the library
          </Button>
        </div>
      </div>
    </div>
  );
}
