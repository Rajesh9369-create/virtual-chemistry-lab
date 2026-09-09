import { motion } from "framer-motion";
import { ArrowUpRight, Clock, FlaskConical, Layers, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Shell } from "@/components/layout/TopNav";
import { Badge, Button, Eyebrow, SectionTitle } from "@/components/ui/primitives";
import { CATEGORIES, EXPERIMENTS } from "@/data/experiments";
import type { CategoryId } from "@/types";
import { cn } from "@/utils/cn";
import type { View } from "@/components/layout/TopNav";

type Filter = CategoryId | "all";

const DIFFICULTY_TONE = {
  Introductory: "ok",
  Intermediate: "info",
  Advanced: "warn",
} as const;

export function Library({
  onOpen,
  onNavigate,
}: {
  onOpen: (id: string) => void;
  onNavigate: (v: View) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const list = filter === "all" ? EXPERIMENTS : EXPERIMENTS.filter((e) => e.category === filter);
  const category = CATEGORIES.find((c) => c.id === filter);

  return (
    <div className="relative min-h-screen pb-24">
      <div className="lab-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_100%_at_20%_0%,rgba(92,116,244,0.16),transparent_70%)]" />

      <Shell className="pt-10 lg:pt-14">
        <SectionTitle
          eyebrow="Experiment library"
          title="Choose a volumetric determination"
          right={
            <div className="hidden text-right sm:block">
              <div className="num text-2xl font-semibold text-mist-50">{list.length}</div>
              <div className="label-eyebrow mt-1">experiments</div>
            </div>
          }
        />
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-mist-300">
          Every experiment runs on the same laboratory engine: the balance, the glassware, the burette
          and the calculation are all real simulations driven by your own measurements.
        </p>
      </Shell>

      <Shell className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* ── category rail ────────────────────────────────────────*/}
        <div>
          <div className="lg:sticky lg:top-24">
            <Eyebrow className="mb-3 hidden lg:block">Technique</Eyebrow>
            <div
              role="tablist"
              aria-label="Experiment category"
              className="scroll-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              <RailButton active={filter === "all"} onClick={() => setFilter("all")} label="All experiments" meta={`${EXPERIMENTS.length}`} />
              {CATEGORIES.map((c) => (
                <RailButton
                  key={c.id}
                  active={filter === c.id}
                  onClick={() => setFilter(c.id)}
                  label={c.name}
                  meta={`${EXPERIMENTS.filter((e) => e.category === c.id).length}`}
                  accent={c.accent}
                />
              ))}
            </div>

            {category && (
              <div className="glass mt-5 hidden rounded-2xl p-4 lg:block">
                <div className="label-eyebrow">About this technique</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-mist-300">{category.blurb}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── experiment list ──────────────────────────────────────*/}
        <div className="space-y-3">
          {list.map((e, i) => (
            <motion.article
              key={e.id}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.25) }}
              className="glass group relative overflow-hidden rounded-3xl p-5 transition-colors duration-300 hover:border-white/20 sm:p-6"
            >
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
                style={{ background: CATEGORIES.find((c) => c.id === e.category)?.accent }}
              />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] font-semibold tracking-wider text-mist-300">
                      {e.code}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-400">
                      {e.technique}
                    </span>
                  </div>

                  <h3 className="mt-3 text-[19px] font-semibold leading-snug tracking-tight text-mist-50 sm:text-xl">
                    {e.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-mist-300">
                    {e.tagline}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge tone={DIFFICULTY_TONE[e.difficulty]}>
                      <Layers size={11} /> {e.difficulty}
                    </Badge>
                    <Badge tone="neutral">
                      <Clock size={11} /> {e.duration}
                    </Badge>
                    <Badge tone="neutral">
                      <FlaskConical size={11} /> {e.apparatus.length} apparatus
                    </Badge>
                    <Badge tone="neutral">
                      <ShieldAlert size={11} /> {e.reagents.length} reagents
                    </Badge>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-[190px]">
                  <Button variant="primary" onClick={() => onOpen(e.id)} className="w-full">
                    Start experiment <ArrowUpRight size={15} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onOpen(e.id)} className="w-full">
                    Read the principle
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}

          <div className="glass flex flex-col items-start gap-3 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[14px] font-semibold text-mist-50">
                Need the theory first?
              </div>
              <p className="mt-1 text-[13px] text-mist-300">
                Review primary standards, equivalence points, indicator selection and burette
                technique before you start.
              </p>
            </div>
            <Button variant="subtle" onClick={() => onNavigate("learn")}>
              Open the learning section
            </Button>
          </div>
        </div>
      </Shell>
    </div>
  );
}

function RailButton({
  active,
  onClick,
  label,
  meta,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  meta: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all duration-200",
        active
          ? "border-white/20 bg-white/[0.12] text-mist-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
          : "border-white/8 bg-white/[0.03] text-mist-400 hover:border-white/15 hover:text-mist-100",
      )}
    >
      <span className="flex items-center gap-2.5">
        {accent && (
          <span
            className="h-2 w-2 rounded-full transition"
            style={{ background: active ? accent : "rgba(255,255,255,0.2)" }}
          />
        )}
        {label}
      </span>
      <span className="num text-[11px] text-mist-400">{meta}</span>
    </button>
  );
}
