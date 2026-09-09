import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

/* ══════════════════════════════════════════════════════════════════════════
   Analytical balance — 320 × 220 local units
   Realistic four-figure instrument with digital display, stability indicator
   and a working tare key.
   ══════════════════════════════════════════════════════════════════════════*/

export function AnalyticalBalance({
  reading,
  stable,
  tared,
  focus,
  onTare,
}: {
  reading: number;
  stable: boolean;
  tared: boolean;
  focus?: boolean;
  onTare?: () => void;
}) {
  const negative = reading < -0.0005;
  return (
    <g className={focus ? "focus-halo" : undefined}>
      <defs>
        <linearGradient id="balBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232f42" />
          <stop offset="45%" stopColor="#141d2c" />
          <stop offset="100%" stopColor="#0d1522" />
        </linearGradient>
        <linearGradient id="lcd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1a12" />
          <stop offset="100%" stopColor="#071009" />
        </linearGradient>
        <linearGradient id="panSteel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7e8b9c" />
          <stop offset="35%" stopColor="#dfe7f0" />
          <stop offset="100%" stopColor="#69737f" />
        </linearGradient>
      </defs>

      {/* feet */}
      <rect x="42" y="206" width="26" height="10" rx="3" fill="#0a1119" />
      <rect x="252" y="206" width="26" height="10" rx="3" fill="#0a1119" />

      {/* body */}
      <rect x="16" y="86" width="288" height="122" rx="10" fill="url(#balBody)" stroke="#33425a" strokeWidth="1.5" />
      <rect x="22" y="92" width="276" height="4" rx="2" fill="#ffffff" opacity="0.07" />

      {/* LCD display */}
      <g>
        <rect x="34" y="104" width="176" height="66" rx="7" fill="url(#lcd)" stroke="#2b3d33" strokeWidth="1.4" />
        <rect x="38" y="108" width="168" height="58" rx="5" fill="#0a1a12" opacity="0.6" />
        <text
          x="52"
          y="150"
          fill={negative ? "#ff8f8f" : "#8bf5c2"}
          fontSize="40"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="600"
          letterSpacing="1"
        >
          {reading.toFixed(4)}
        </text>
        <text x="212" y="150" fill="#8bf5c2" fontSize="17" fontFamily="JetBrains Mono, monospace" opacity="0.85">
          g
        </text>
        {/* stability indicator */}
        <g transform="translate(46,116)">
          <circle cx="0" cy="0" r="3.6" fill={stable ? "#35d69a" : "#f7b03c"} className={stable ? undefined : "animate-blink"} />
          <text x="10" y="4" fill={stable ? "#35d69a" : "#f7b03c"} fontSize="9" fontFamily="Inter, sans-serif" letterSpacing="1.2">
            {stable ? "STABLE" : "UNSTABLE"}
          </text>
        </g>
        {tared && (
          <text x="190" y="118" fill="#9db2cd" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="end" letterSpacing="1">
            TARE
          </text>
        )}
      </g>

      {/* keys */}
      <g>
        <BalanceKey x={232} y={112} label="TARE" onTare={onTare} />
        <BalanceKey x={272} y={112} label="CAL" />
        <BalanceKey x={232} y={152} label="PRINT" />
        <BalanceKey x={272} y={152} label="UNIT" />
      </g>

      {/* level indicator */}
      <g transform="translate(70,186)">
        <circle cx="0" cy="0" r="9" fill="#0c1520" stroke="#3a4a63" strokeWidth="1" />
        <circle cx="0" cy="0" r="1.6" fill="#3a4a63" />
        <circle cx="-1.5" cy="-2" r="3.4" fill="#8fd6ff" opacity="0.5" />
      </g>
      <text x="86" y="190" fill="#7d8ea8" fontSize="8.5" fontFamily="Inter, sans-serif" letterSpacing="1">
        LEVEL
      </text>
      <text x="150" y="190" fill="#5f7290" fontSize="8.5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.5">
        d = 0.1 mg
      </text>

      {/* weighing chamber */}
      <g>
        {/* top plate */}
        <rect x="60" y="76" width="200" height="10" rx="3" fill="url(#panSteel)" opacity="0.9" />
        {/* pan */}
        <rect x="126" y="66" width="68" height="10" rx="5" fill="url(#panSteel)" />
        {/* draft shield */}
        <motion.g
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <path
            d="M52 66 L52 6 Q52 0 58 0 L262 0 Q268 0 268 6 L268 66"
            fill="rgba(180,214,255,0.07)"
            stroke="url(#glassEdge)"
            strokeWidth="2"
          />
          <path d="M160 2 L160 64" stroke="#cfe4ff" strokeOpacity="0.22" strokeWidth="1.6" />
          <path d="M56 10 L56 60" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2.4" />
          <rect x="58" y="4" width="204" height="4" rx="2" fill="#ffffff" opacity="0.09" />
        </motion.g>
      </g>
    </g>
  );
}

function BalanceKey({ x, y, label, onTare }: { x: number; y: number; label: string; onTare?: () => void }) {
  return (
    <g
      onClick={onTare}
      role={onTare ? "button" : undefined}
      aria-label={onTare ? `${label} key` : undefined}
      tabIndex={onTare ? 0 : undefined}
      onKeyDown={
        onTare
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTare();
              }
            }
          : undefined
      }
      style={{ cursor: onTare ? "pointer" : "default" }}
    >
      <motion.rect
        x={x}
        y={y}
        width="34"
        height="26"
        rx="6"
        fill="#1b2636"
        stroke="#3a4a63"
        strokeWidth="1"
        whileTap={onTare ? { fill: "#2c3a4f" } : undefined}
      />
      <text
        x={x + 17}
        y={y + 17}
        textAnchor="middle"
        fill={onTare ? "#dbe4f5" : "#8899b0"}
        fontSize="7.5"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.6"
      >
        {label}
      </text>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   In-scene floating readout (HTML overlay for crisp text)
   ══════════════════════════════════════════════════════════════════════════*/

export function SceneReadout({
  rows,
  className,
}: {
  rows: { label: string; value: string; tone?: "neutral" | "accent" | "warn" | "ok" | "bad" }[];
  className?: string;
}) {
  const toneClass = {
    neutral: "text-mist-100",
    accent: "text-accent-200",
    warn: "text-warn-400",
    ok: "text-ok-400",
    bad: "text-bad-400",
  };
  return (
    <div className={cn("glass-strong pointer-events-none rounded-2xl px-3.5 py-3", className)}>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-5">
            <span className="label-eyebrow whitespace-nowrap">{r.label}</span>
            <span className={cn("num text-[15px] font-semibold leading-none", toneClass[r.tone ?? "neutral"])}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
