import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ── Panel ─────────────────────────────────────────────────────────────*/
export function Panel({
  children,
  className,
  tone = "glass",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  tone?: "glass" | "strong" | "deep";
  as?: "div" | "section" | "aside";
}) {
  return (
    <As className={cn(tone === "glass" ? "glass" : tone === "strong" ? "glass-strong" : "glass-deep", "rounded-3xl", className)}>
      {children}
    </As>
  );
}

/* ── Button ────────────────────────────────────────────────────────────*/
type Variant = "primary" | "subtle" | "ghost" | "danger" | "success";

const VARIANTS: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-b from-accent-400 to-accent-600 border border-accent-300/40 shadow-[0_10px_28px_-12px_rgba(92,116,244,0.9),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-accent-300 hover:to-accent-500",
  subtle: "neu text-mist-100",
  ghost: "text-mist-300 border border-white/10 hover:text-mist-100 hover:border-white/25 bg-white/[0.03]",
  danger:
    "text-white bg-gradient-to-b from-[#e25b5b] to-[#c03d3d] border border-[#ff9a9a]/40 shadow-[0_10px_28px_-12px_rgba(224,80,80,0.9)]",
  success:
    "text-[#04241a] bg-gradient-to-b from-ok-400 to-ok-500 border border-ok-400/50 shadow-[0_10px_28px_-12px_rgba(23,180,124,0.9)] font-semibold",
};

export function Button({
  variant = "subtle",
  size = "md",
  active,
  full,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  full?: boolean;
}) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" && "min-h-9 px-3 text-xs",
        size === "md" && "px-4 text-sm",
        size === "lg" && "min-h-12 px-6 text-base",
        VARIANTS[variant],
        active && "neu-on",
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Big hold-to-act control used for pouring / scooping / flowing. */
export function HoldButton({
  children,
  className,
  holdProps,
  active,
  disabled,
  tone = "subtle",
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  holdProps: Record<string, unknown>;
  active?: boolean;
  disabled?: boolean;
  tone?: "subtle" | "primary" | "warn";
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={!!active}
      disabled={disabled}
      {...(holdProps as ButtonHTMLAttributes<HTMLButtonElement>)}
      className={cn(
        "relative inline-flex min-h-12 w-full select-none items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        tone === "subtle" && "neu text-mist-100",
        tone === "primary" &&
          "neu text-white bg-gradient-to-b from-accent-400/80 to-accent-600/70 border-accent-300/40",
        tone === "warn" && "neu text-white bg-gradient-to-b from-warn-400/80 to-[#c9761c]/70",
        active && "neu-on",
        className,
      )}
    >
      {active && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <span className="animate-scan absolute inset-y-0 w-1/3 bg-white/15 blur-md" />
        </span>
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

/* ── Eyebrow / badge ──────────────────────────────────────────────────*/
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("label-eyebrow", className)}>{children}</div>;
}

type Tone = "neutral" | "accent" | "ok" | "info" | "warn" | "bad" | "endpoint";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/[0.07] text-mist-300 border-white/10",
  accent: "bg-accent-500/18 text-accent-200 border-accent-400/35",
  ok: "bg-ok-400/15 text-ok-400 border-ok-400/35",
  info: "bg-info-400/15 text-info-400 border-info-400/35",
  warn: "bg-warn-400/15 text-warn-400 border-warn-400/35",
  bad: "bg-bad-400/15 text-bad-400 border-bad-400/35",
  endpoint: "bg-endpoint-400/15 text-endpoint-400 border-endpoint-400/35",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Measurement ──────────────────────────────────────────────────────*/
export function Measurement({
  label,
  value,
  unit,
  tone = "neutral",
  hint,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: Tone;
  hint?: string;
  className?: string;
}) {
  const valueTone: Record<Tone, string> = {
    neutral: "text-mist-50",
    accent: "text-accent-200",
    ok: "text-ok-400",
    info: "text-info-400",
    warn: "text-warn-400",
    bad: "text-bad-400",
    endpoint: "text-endpoint-400",
  };
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-ink-850/70 px-4 py-3",
        tone !== "neutral" && "bg-ink-850/90",
        className,
      )}
    >
      <div className="label-eyebrow">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={cn("num text-[26px] font-semibold leading-none sm:text-[30px]", valueTone[tone])}>
          {value}
        </span>
        {unit && <span className="num text-sm text-mist-400">{unit}</span>}
      </div>
      {hint && <div className="mt-1.5 text-[11px] leading-snug text-mist-400">{hint}</div>}
    </div>
  );
}

/* ── Disclosure ───────────────────────────────────────────────────────*/
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  icon,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-left text-[13px] font-semibold text-mist-200 transition hover:text-mist-50"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ChevronDown
          size={15}
          className={cn("shrink-0 text-mist-400 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.8, 0.28, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-[13px] leading-relaxed text-mist-300">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Section heading ──────────────────────────────────────────────────*/
export function SectionTitle({
  eyebrow,
  title,
  right,
  className,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
        <h2 className="text-xl font-semibold tracking-tight text-mist-50 sm:text-2xl">{title}</h2>
      </div>
      {right}
    </div>
  );
}
