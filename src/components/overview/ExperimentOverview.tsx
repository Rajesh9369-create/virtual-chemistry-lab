import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  BookOpen,
  CircleDot,
  FlaskConical,
  Info,
  ShieldAlert,
  Sigma,
  Thermometer,
} from "lucide-react";
import { Shell } from "@/components/layout/TopNav";
import { Badge, Button, Disclosure, Eyebrow, SectionTitle } from "@/components/ui/primitives";
import type { Experiment } from "@/types";
import type { View } from "@/components/layout/TopNav";

export function ExperimentOverview({
  exp,
  onBegin,
  onBack,
  onNavigate,
}: {
  exp: Experiment;
  onBegin: () => void;
  onBack: () => void;
  onNavigate: (v: View) => void;
}) {
  const sim = exp.sim;
  return (
    <div className="relative min-h-screen pb-32">
      <div className="lab-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-[radial-gradient(55%_100%_at_75%_0%,rgba(92,116,244,0.18),transparent_70%)]" />

      <Shell className="pt-8 lg:pt-12">
        <button
          type="button"
          onClick={onBack}
          className="mb-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-mist-300 transition hover:text-mist-50"
        >
          <ArrowLeft size={15} /> Back to the library
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12">
          {/* ── main column ────────────────────────────────────────*/}
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="num rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] font-semibold tracking-wider text-mist-300">
                  {exp.code}
                </span>
                <Eyebrow>{exp.technique}</Eyebrow>
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-mist-50 sm:text-[44px]">
                {exp.title}
              </h1>
              <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-mist-300">{exp.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge tone="info">{exp.difficulty}</Badge>
                <Badge tone="neutral">{exp.duration}</Badge>
                <Badge tone="neutral">{exp.phases.length} laboratory steps</Badge>
                <Badge tone="accent">{sim.stoichNote}</Badge>
              </div>
            </motion.div>

            {/* reaction */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-strong mt-9 overflow-hidden rounded-3xl"
            >
              <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3">
                <Sigma size={14} className="text-accent-200" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-300">
                  Reaction
                </span>
              </div>
              <div className="space-y-2 px-5 py-5">
                {exp.reaction.map((r) => (
                  <div key={r} className="num overflow-x-auto text-[15px] leading-relaxed text-mist-100 sm:text-[17px]">
                    {r}
                  </div>
                ))}
                <div className="text-[12.5px] text-mist-400">
                  Stoichiometry: {sim.stoichNote} · {sim.titrant.formula} ≈{" "}
                  {sim.titrant.nominalMolarity} mol/L
                </div>
              </div>
            </motion.div>

            {/* principle */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-4"
            >
              <SectionTitle eyebrow="Principle" title="Why this method works" className="mb-4" />
              <p className="text-[14.5px] leading-[1.75] text-mist-300">{exp.principle}</p>
            </motion.div>

            {/* procedure */}
            <div className="mt-10">
              <SectionTitle eyebrow="Procedure" title="What you will do" className="mb-4" />
              <div className="space-y-2">
                {exp.procedure.map((p, i) => (
                  <Disclosure
                    key={p.title}
                    title={`${i + 1}. ${p.title}`}
                    icon={<span className="num text-[11px] text-mist-500">{String(i + 1).padStart(2, "0")}</span>}
                  >
                    {p.detail}
                  </Disclosure>
                ))}
              </div>
            </div>
          </div>

          {/* ── side column ────────────────────────────────────────*/}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="glass-strong rounded-3xl p-5">
              <Eyebrow>Reagents</Eyebrow>
              <ul className="mt-3 space-y-3">
                {exp.reagents.map((r) => (
                  <li key={r.name} className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13.5px] font-semibold text-mist-50">{r.name}</span>
                      {r.formula && <span className="num text-[12px] text-accent-200">{r.formula}</span>}
                    </div>
                    <div className="mt-0.5 text-[11.5px] uppercase tracking-wider text-mist-500">{r.role}</div>
                    <p className="mt-1 text-[12.5px] leading-snug text-mist-300">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong rounded-3xl p-5">
              <Eyebrow>Apparatus</Eyebrow>
              <ul className="mt-3 grid gap-2">
                {exp.apparatus.map((a) => (
                  <li key={a.name} className="flex items-start gap-2.5">
                    <FlaskConical size={13} className="mt-0.5 shrink-0 text-mist-500" />
                    <span className="text-[13px] text-mist-200">
                      {a.name}
                      <span className="block text-[11.5px] text-mist-500">{a.spec}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <CircleDot size={14} className="text-endpoint-400" />
                <Eyebrow>Expected endpoint</Eyebrow>
              </div>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist-200">{exp.endpoint}</p>
              {sim.indicator && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="h-4 w-4 rounded-full" style={{ background: sim.colors.initial }} />
                  <span className="text-mist-500">→</span>
                  <span className="h-4 w-4 rounded-full" style={{ background: sim.colors.endpoint }} />
                  <span className="ml-1 text-[12px] text-mist-300">{sim.indicator.transition}</span>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-warn-400/25 bg-warn-400/[0.07] p-5">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-warn-400" />
                <Eyebrow className="text-warn-400">Safety</Eyebrow>
              </div>
              <ul className="mt-3 space-y-2">
                {exp.safety.map((s) => (
                  <li key={s} className="flex gap-2 text-[12.5px] leading-relaxed text-mist-200">
                    <span className="text-warn-400">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-accent-200" />
                <Eyebrow>You will learn</Eyebrow>
              </div>
              <ul className="mt-3 space-y-2">
                {exp.learning.map((l) => (
                  <li key={l} className="flex gap-2 text-[12.5px] leading-relaxed text-mist-300">
                    <span className="text-accent-300">→</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Shell>

      {/* ── sticky begin bar ────────────────────────────────────────*/}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-ink-950/85 backdrop-blur-xl">
        <Shell className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-mist-50">{exp.title}</div>
            <div className="mt-0.5 hidden items-center gap-1.5 text-[11.5px] text-mist-400 sm:flex">
              <Info size={11} />
              {exp.phases.length} interactive steps · no prior setup required
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("learn")} className="hidden sm:inline-flex">
              <Thermometer size={14} /> Theory
            </Button>
            <Button variant="primary" onClick={onBegin}>
              <Beaker size={16} /> Begin experiment <ArrowRight size={15} />
            </Button>
          </div>
        </Shell>
      </div>
    </div>
  );
}
