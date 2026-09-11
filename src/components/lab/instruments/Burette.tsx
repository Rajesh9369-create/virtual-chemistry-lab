import { motion } from "framer-motion";
import type { FlowMode } from "@/types";

/* ══════════════════════════════════════════════════════════════════════════
   Burette — 50 mL class A, local coordinates
   tube: x 0…26, y 0…310      (6.2 units per mL, 0.00 mL at the TOP)
   stopcock: y 310…340         tip: y 340…372
   ══════════════════════════════════════════════════════════════════════════*/

const PX_PER_ML = 6.2;
const CAPACITY_ML = 50;

const HANDLE_ANGLE: Record<FlowMode, number> = {
  closed: 0,
  precision: 32,
  dropwise: 58,
  fast: 90,
};

export function BuretteTube({
  level,
  color,
  stopcock,
  onStopcock,
  focus,
  highlightReading,
}: {
  level: number;
  color: string;
  stopcock: FlowMode;
  onStopcock?: () => void;
  focus?: boolean;
  highlightReading?: number | null;
}) {
  /* the liquid surface: 0 mL of liquid → y 310 (bottom), 50 mL → y 0 (top),
     so the column genuinely rises from the bottom while filling            */
  const yTop = Math.max(0, (CAPACITY_ML - level) * PX_PER_ML);
  const open = stopcock !== "closed";

  return (
    <g className={focus ? "focus-halo" : undefined}>
      {/* graduations — 0.00 mL at the top, 50.00 mL at the bottom */}
      <g>
        {Array.from({ length: 51 }).map((_, v) => {
          const y = v * PX_PER_ML;
          const major = v % 10 === 0;
          const mid = v % 5 === 0;
          const len = major ? 13 : mid ? 9 : 6;
          return (
            <g key={v}>
              <path
                d={`M26 ${y} h${len}`}
                stroke={major ? "#dbe6f5" : "#93a4bd"}
                strokeOpacity={major ? 0.95 : 0.6}
                strokeWidth={major ? 1.3 : 1}
              />
              {major && (
                <text
                  x="44"
                  y={y + 3.4}
                  fill="#c3d2e6"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                  opacity="0.95"
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}
        <path d="M26 0 V310" stroke="#93a4bd" strokeOpacity="0.5" strokeWidth="1.2" />
      </g>

      {/* tube */}
      <rect x="0" y="0" width="26" height="312" rx="6" fill="url(#glassBody)" stroke="url(#glassEdge)" strokeWidth="1.8" />

      {/* liquid column — rises from the bottom as the burette is filled */}
      {level > 0.05 && (
        <g>
          <clipPath id="buretteClip">
            <rect x="1" y="1" width="24" height="310" rx="5" />
          </clipPath>
          <g clipPath="url(#buretteClip)">
            <rect
              x="1"
              y={yTop}
              width="24"
              height={Math.max(0, 310 - yTop)}
              fill={color}
              opacity="0.95"
            />
            {/* meniscus */}
            <ellipse cx="13" cy={yTop} rx="12" ry="3" fill="#ffffff" opacity="0.45" />
            <ellipse cx="13" cy={yTop + 1} rx="11" ry="2.2" fill="none" stroke="#0b1420" strokeOpacity="0.3" strokeWidth="1" />
            <rect x="2" y={yTop} width="4" height={Math.max(0, 310 - yTop)} fill="#ffffff" opacity="0.16" />
          </g>
        </g>
      )}

      {/* eye-level guide for readings */}
      {typeof highlightReading === "number" && (
        <motion.g initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <path
            d={`M-46 ${highlightReading * PX_PER_ML} H54`}
            stroke="#ffd23f"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
          <path d="M-46 -4 L-46 8" stroke="#ffd23f" strokeWidth="1.6" />
        </motion.g>
      )}

      {/* glass sheen */}
      <rect x="3" y="4" width="3.5" height="300" rx="2" fill="#ffffff" opacity="0.22" />
      <ellipse cx="13" cy="2" rx="12" ry="3" fill="none" stroke="#eaf3ff" strokeOpacity="0.45" strokeWidth="1.6" />

      {/* stopcock */}
      <g
        onClick={onStopcock}
        role={onStopcock ? "button" : undefined}
        aria-label={onStopcock ? `Stopcock — ${open ? "close" : "open"}` : undefined}
        aria-pressed={open}
        tabIndex={onStopcock ? 0 : undefined}
        onKeyDown={
          onStopcock
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onStopcock();
                }
              }
            : undefined
        }
        style={{ cursor: onStopcock ? "pointer" : "default" }}
      >
        <rect x="-4" y="310" width="34" height="30" rx="5" fill="#1d2839" stroke="#3a4a63" strokeWidth="1.2" />
        <path d="M10 340 L16 340 L14 372 L12 372 Z" fill="rgba(255,255,255,0.1)" stroke="url(#glassEdge)" strokeWidth="1.4" />
        {open && level > 0.05 && (
          <motion.circle
            cx="13"
            cy="350"
            r="2.2"
            fill={color}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
        <motion.g
          animate={{ rotate: HANDLE_ANGLE[stopcock] }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
          style={{ originX: "13px", originY: "325px" }}
        >
          <rect x="8" y="318" width="52" height="14" rx="7" fill="url(#metalBody)" stroke="#39424f" strokeWidth="1" />
          <circle cx="56" cy="325" r="6" fill="#6a7484" />
          <rect x="12" y="321" width="42" height="3" rx="1.5" fill="#ffffff" opacity="0.28" />
        </motion.g>
        <circle cx="13" cy="325" r="6.5" fill="#2b364a" stroke="#4a5871" strokeWidth="1" />
      </g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Filling funnel — 120 × 110 local units
   ══════════════════════════════════════════════════════════════════════════*/

export function Funnel({
  color,
  filling = false,
  visible = true,
}: {
  color: string;
  filling?: boolean;
  visible?: boolean;
}) {
  return (
    <motion.g
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -12 }}
      transition={{ duration: 0.4 }}
    >
      <path d="M0 0 L120 0 L70 62 L70 96 L50 96 L50 62 Z" fill="url(#glassBody)" stroke="url(#glassEdge)" strokeWidth="1.8" />
      {color && <path d="M4 3 L116 3 L72 58 L48 58 Z" fill={color} opacity={filling ? 0.9 : 0.4} />}
      <path d="M8 6 L8 14 L52 56" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      {filling && (
        <motion.rect
          x="55"
          y="96"
          width="10"
          height="30"
          rx="4"
          fill={color}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.45, repeat: Infinity }}
        />
      )}
    </motion.g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Falling titrant drop
   ══════════════════════════════════════════════════════════════════════════*/

export function TitrantDrop({
  id,
  from,
  to,
  color,
  onComplete,
}: {
  id: number;
  from: number;
  to: number;
  color: string;
  onComplete: () => void;
}) {
  return (
    <motion.g
      key={id}
      initial={{ y: from, opacity: 0, scaleY: 0.7 }}
      animate={{ y: to, opacity: [0, 1, 1, 0.9], scaleY: 1 }}
      transition={{ duration: 0.3, ease: "easeIn" }}
      onAnimationComplete={onComplete}
    >
      <ellipse cx="0" cy="0" rx="4.2" ry="5.4" fill={color} />
      <ellipse cx="-1.2" cy="-1.6" rx="1.4" ry="2" fill="#ffffff" opacity="0.55" />
    </motion.g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Focused burette reading view.
   A magnified window that always centres on the meniscus, with a zoom
   control (1×, 2×, 4×) so the exact reading can be read off the scale.
   viewBox 340 × 560
   ══════════════════════════════════════════════════════════════════════════*/

const CY = 262; // the meniscus is always drawn at this height
const TUBE_L = 156;
const TUBE_R = 204;

export function BuretteScale({
  reading,
  color,
  zoom = 1,
}: {
  reading: number;
  color: string;
  zoom?: number;
}) {
  const Z = 44 * zoom;
  const yOf = (v: number) => CY + (v - reading) * Z;
  const span = 214 / Z; // half of the visible window, in mL
  const first = Math.max(0, Math.floor((reading - span) * 20) / 20);
  const last = Math.min(CAPACITY_ML, Math.ceil((reading + span) * 20) / 20);

  const ticks: number[] = [];
  const step = zoom >= 2 ? 0.05 : 0.1;
  for (let v = first; v <= last + 1e-6; v = Math.round((v + step) * 100) / 100) ticks.push(Math.round(v * 100) / 100);

  const zeroY = yOf(0);
  const cx = (TUBE_L + TUBE_R) / 2;

  return (
    <g>
      {/* ── magnified graduation scale ─────────────────────────────────*/}
      <g>
        {ticks.map((v) => {
          const y = yOf(v);
          if (y < 26 || y > 504) return null;
          const major = Math.abs(v % 5) < 1e-6;
          const whole = Math.abs(v % 1) < 1e-6;
          const half = Math.abs(v % 0.5) < 1e-6;
          const tenth = Math.abs(v % 0.1) < 1e-6;
          const len = major ? 34 : whole ? 26 : half ? 18 : tenth ? 11 : 6;
          return (
            <g key={v}>
              <path
                d={`M${TUBE_L} ${y} h${-len}`}
                stroke={major ? "#f0f5fc" : whole ? "#cdd9ea" : tenth ? "#8b9cb6" : "#6d7e96"}
                strokeWidth={major ? 1.8 : whole ? 1.3 : 1}
                strokeOpacity={major || whole ? 1 : 0.85}
              />
              {whole && (
                <text
                  x={TUBE_L - len - 8}
                  y={y + 4.6}
                  textAnchor="end"
                  fill={major ? "#f0f5fc" : "#cdd9ea"}
                  fontSize="13.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {v.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}
        <path d={`M${TUBE_L} 30 V500`} stroke="#9fb0c8" strokeOpacity="0.55" strokeWidth="1.2" />
      </g>

      {/* ── glass tube ─────────────────────────────────────────────────*/}
      <rect x={TUBE_L} y="30" width={TUBE_R - TUBE_L} height="470" rx="8" fill="url(#glassBody)" stroke="url(#glassEdge)" strokeWidth="2" />
      <clipPath id="readerTubeClip">
        <rect x={TUBE_L + 1} y="31" width={TUBE_R - TUBE_L - 2} height="468" rx="7" />
      </clipPath>
      <g clipPath="url(#readerTubeClip)">
        {/* liquid below the meniscus */}
        <rect x={TUBE_L} y={CY} width={TUBE_R - TUBE_L} height={500 - CY} fill={color} opacity="0.95" />
        <rect x={TUBE_L + 3} y={CY} width="5" height={500 - CY} fill="#ffffff" opacity="0.2" />
        {/* ungraduated space above the zero mark */}
        {reading < span && zeroY > 34 && (
          <g>
            <rect x={TUBE_L + 1} y="31" width={TUBE_R - TUBE_L - 2} height={zeroY - 32} fill="#0a1220" opacity="0.35" />
            <text
              x={cx}
              y={Math.max(56, zeroY - 16)}
              textAnchor="middle"
              fill="#8b9cb6"
              fontSize="10"
              fontFamily="Inter, sans-serif"
              transform={`rotate(-90 ${cx} ${Math.max(56, zeroY - 16)})`}
            >
              above the zero mark
            </text>
          </g>
        )}
        {/* the meniscus — a concave curve whose lowest point is on the centre line */}
        <path
          d={`M${TUBE_L + 1} ${CY - 11} Q${cx} ${CY + 11} ${TUBE_R - 1} ${CY - 11}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.9"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx={cx} cy={CY} rx={(TUBE_R - TUBE_L) / 2 - 2} ry="4" fill="#ffffff" opacity="0.25" />
      </g>

      {/* ── reading line through the bottom of the meniscus ────────────*/}
      <g>
        <path d={`M14 ${CY} H326`} stroke="#ffd23f" strokeWidth="1.7" strokeDasharray="6 5" opacity="0.95" />
        <circle cx={cx} cy={CY} r="4.5" fill="#ffd23f" />
        <path d={`M14 ${CY} l0 -7 l0 14`} stroke="#ffd23f" strokeWidth="1.8" />
        <text x="14" y={CY - 14} fill="#ffd23f" fontSize="11.5" fontWeight="600" fontFamily="Inter, sans-serif">
          bottom of the meniscus
        </text>
        <text x="326" y={CY - 14} textAnchor="end" fill="#ffd23f" fontSize="11.5" fontFamily="Inter, sans-serif">
          read at eye level
        </text>
      </g>

      {/* eye-level sight */}
      <g transform="translate(300,470)">
        <circle cx="0" cy="0" r="12" fill="rgba(128,152,255,0.14)" stroke="#8098ff" strokeWidth="1.2" />
        <ellipse cx="0" cy="0" rx="7" ry="4.6" fill="none" stroke="#a8b9ff" strokeWidth="1.4" />
        <circle cx="0" cy="0" r="2" fill="#a8b9ff" />
      </g>
      <text x="300" y="498" textAnchor="middle" fill="#8b9cb6" fontSize="10" fontFamily="Inter, sans-serif">
        eye level
      </text>

      <text x="14" y="524" fill="#8d9db6" fontSize="11" fontFamily="Inter, sans-serif">
        {zoom >= 2 ? "Fine graduations 0.05 mL — read to 0.01 mL." : "Smallest graduation 0.1 mL — zoom in to read to 0.01 mL."}
      </text>
      <text x="14" y="542" fill="#5f7290" fontSize="10.5" fontFamily="Inter, sans-serif">
        Zoom ×{zoom} · the dashed line marks the lowest point of the meniscus.
      </text>
    </g>
  );
}
