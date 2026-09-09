import { motion } from "framer-motion";
import { ArrowRight, Beaker, Gauge, LineChart, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/layout/TopNav";
import { Button, Eyebrow } from "@/components/ui/primitives";
import { CATEGORIES, EXPERIMENTS, FLAGSHIP_ID } from "@/data/experiments";
import type { View } from "@/components/layout/TopNav";

/* ── Decorative animated titration assembly (line art) ──────────────────*/
function HeroArt() {
  return (
    <motion.svg
      viewBox="0 0 420 520"
      className="h-full w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroLiquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd6a5" />
          <stop offset="100%" stopColor="#f2a03f" />
        </linearGradient>
        <linearGradient id="heroTitrant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8b9ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5c74f4" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="heroStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
        </linearGradient>
        <radialGradient id="heroGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#5c74f4" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#5c74f4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="210" cy="250" r="200" fill="url(#heroGlow)" />

      {/* retort stand */}
      <g stroke="url(#heroStroke)" strokeWidth="2" fill="none">
        <path d="M96 470h250" />
        <path d="M126 470V88" />
        <path d="M126 150h74" />
        <path d="M126 150v-16" />
      </g>

      {/* burette */}
      <g>
        <rect x="186" y="86" width="26" height="278" rx="13" fill="rgba(255,255,255,0.035)" stroke="url(#heroStroke)" strokeWidth="1.6" />
        <motion.rect
          x="188"
          width="22"
          rx="11"
          fill="url(#heroTitrant)"
          initial={{ y: 88, height: 270 }}
          animate={{ y: 128, height: 230 }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <g stroke="rgba(255,255,255,0.3)" strokeWidth="1">
          {Array.from({ length: 13 }).map((_, i) => (
            <path key={i} d={`M212 ${100 + i * 20}h${i % 5 === 0 ? 12 : 7}`} />
          ))}
        </g>
        {/* stopcock */}
        <path d="M192 364h14v14h-14z" fill="rgba(255,255,255,0.1)" stroke="url(#heroStroke)" strokeWidth="1.5" />
        <path d="M199 371h26" stroke="url(#heroStroke)" strokeWidth="3" strokeLinecap="round" />
        <path d="M196 378v26h8v-26z" fill="rgba(255,255,255,0.07)" stroke="url(#heroStroke)" strokeWidth="1.4" />
      </g>

      {/* falling drop */}
      <motion.circle
        cx="200"
        r="4.5"
        fill="#a8b9ff"
        initial={{ cy: 404 }}
        animate={{ cy: 434 }}
        transition={{ duration: 0.75, repeat: Infinity, repeatDelay: 1.6, ease: "easeIn" }}
      />

      {/* conical flask */}
      <g>
        <path
          d="M182 424h36v18l52 74a16 16 0 0 1-13 24H143a16 16 0 0 1-13-24l52-74z"
          fill="rgba(255,255,255,0.04)"
          stroke="url(#heroStroke)"
          strokeWidth="1.8"
        />
        <clipPath id="heroFlaskClip">
          <path d="M182 424h36v18l52 74a16 16 0 0 1-13 24H143a16 16 0 0 1-13-24l52-74z" />
        </clipPath>
        <g clipPath="url(#heroFlaskClip)">
          <motion.path
            d="M124 452h152v92H124z"
            fill="url(#heroLiquid)"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="200"
            cy="452"
            rx="76"
            ry="5"
            fill="#ffe6bf"
            animate={{ rx: [76, 68, 76] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
        <path d="M188 418h24" stroke="url(#heroStroke)" strokeWidth="1.6" />
      </g>
    </motion.svg>
  );
}

const FEATURES = [
  {
    icon: Gauge,
    title: "A balance that really measures",
    body: "Scoop powder with the spatula, watch it fall, and read the analytical balance change one milligram at a time — with a stability indicator and a tare function.",
  },
  {
    icon: Beaker,
    title: "Glassware with physical state",
    body: "Flasks fill, swirl, dissolve solids, take indicator drops and change colour progressively as the titration approaches equivalence.",
  },
  {
    icon: LineChart,
    title: "Results from your own data",
    body: "The calculation engine uses the mass you weighed, the aliquot you pipetted and the burette readings you recorded. Nothing is pre-written.",
  },
  {
    icon: ShieldCheck,
    title: "Errors are part of the lesson",
    body: "Overshoot the endpoint, overfill a volumetric flask or misread a meniscus and the laboratory explains what happened, why it matters and how to correct it.",
  },
];

export function Landing({
  onNavigate,
  onStart,
}: {
  onNavigate: (v: View) => void;
  onStart: (id: string) => void;
}) {
  return (
    <div className="relative">
      {/* ── ambient background ───────────────────────────────────────*/}
      <div className="lab-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-drift absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent-500/20 blur-[110px]" />
        <div className="animate-drift absolute right-0 top-40 h-80 w-80 rounded-full bg-info-400/10 blur-[120px] [animation-delay:-6s]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden="true">
          <defs>
            <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M54 0H0v54" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── hero ─────────────────────────────────────────────────────*/}
      <Shell className="relative grid items-center gap-12 pb-10 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-breathe absolute inset-0 rounded-full bg-ok-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-300">
              {EXPERIMENTS.length} playable experiments · 5 techniques
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-[13vw] font-bold leading-[0.86] tracking-[-0.045em] text-mist-50 sm:text-6xl lg:text-[86px]"
          >
            <span className="block">Virtual</span>
            <span className="block bg-gradient-to-r from-mist-50 via-accent-200 to-accent-400 bg-clip-text text-transparent">
              Chemistry
            </span>
            <span className="block">Laboratory</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-7 max-w-xl text-[17px] leading-relaxed text-mist-300 sm:text-lg"
          >
            Perform volumetric analysis experiments through an interactive digital laboratory —
            weigh primary standards, prepare standard solutions, control a burette drop by drop and
            calculate the result from your own measurements.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" variant="primary" onClick={() => onStart(FLAGSHIP_ID)} className="sm:px-7">
              Enter virtual lab
              <ArrowRight size={17} />
            </Button>
            <Button size="lg" variant="subtle" onClick={() => onNavigate("library")}>
              Explore experiments
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/[0.08] pt-6"
          >
            {[
              { k: "Balance resolution", v: "0.0001 g" },
              { k: "Burette precision", v: "0.05 mL drop" },
              { k: "Reading tolerance", v: "±0.03 mL" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="label-eyebrow">{s.k}</dt>
                <dd className="num mt-1 text-lg font-semibold text-mist-100">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="mx-auto h-[380px] w-full max-w-[420px] sm:h-[460px] lg:h-[560px]">
          <HeroArt />
        </div>
      </Shell>

      {/* ── categories ───────────────────────────────────────────────*/}
      <Shell className="py-10 lg:py-14">
        <Eyebrow>Techniques available</Eyebrow>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onNavigate("library")}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass group min-h-[104px] rounded-2xl p-4 text-left transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span
                  className="num text-[11px] font-bold tracking-widest"
                  style={{ color: c.accent }}
                >
                  {c.short}
                </span>
                <span className="num text-[11px] text-mist-400">
                  {EXPERIMENTS.filter((e) => e.category === c.id).length}
                </span>
              </div>
              <div className="mt-3 text-sm font-semibold text-mist-50">{c.name}</div>
              <div className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-mist-400">
                {c.blurb}
              </div>
            </motion.button>
          ))}
        </div>
      </Shell>

      {/* ── features ─────────────────────────────────────────────────*/}
      <Shell className="pb-20 lg:pb-28">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass-strong rounded-3xl p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-accent-200">
                <f.icon size={18} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-mist-50">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mist-300">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </Shell>
    </div>
  );
}
