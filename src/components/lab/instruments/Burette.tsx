import { motion } from "framer-motion";
import type { FlowMode } from "@/types";

/* ══════════════════════════════════════════════════════════════════════════
   Burette — 50 mL class A, local coordinates
   tube: x 0…26, y 0…310   (6.2 units per mL)
   stopcock: y 310…340      tip: y 340…372
   ══════════════════════════════════════════════════════════════════════════*/

const PX_PER_ML = 6.2;

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
  const yTop = Math.max(0, level * PX_PER_ML);
  const open = stopcock !== "closed";

  return (
    <g className={focus ? "focus-halo" : undefined}>
      {/* graduations */}
      <g>
        {Array.from({ length: 51 }).map((_, v) => {
          const y = v * PX_PER_ML;
          const major = v % 10 === 0;
          const mid = v % 5 === 0;
          const len = major ? 13 : mid ? 9 : 6;
          if (v % 1 !== 0) return null;
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

      {/* liquid column */}
      {level > 0.05 && (
        <g>
          <clipPath id="buretteClip">
            <rect x="1" y="1" width="24" height="310" rx="5" />
          </clipPath>
          <g clipPath="url(#buretteClip)">
            <rect x="1" y={yTop} width="24" height={Math.max(0, 310 - yTop)} fill={color} opacity="0.92" />
            <ellipse cx="13" cy={yTop} rx="12" ry="3" fill="#ffffff" opacity="0.32" />
            <ellipse cx="13" cy={yTop} rx="12" ry="2.4" fill="none" stroke="#0b1420" strokeOpacity="0.35" strokeWidth="1" />
            <rect x="2" y={yTop} width="4" height={Math.max(0, 310 - yTop)} fill="#ffffff" opacity="0.16" />
          </g>
        </g>
      )}

      {/* eye-level guide for readings */}
      {typeof highlightReading === "number" && (
        <motion.g
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
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
      {color && (
        <path d="M6 4 L114 4 L72 56 L48 56 Z" fill={color} opacity={filling ? 0.75 : 0.35} />
      )}
      <path d="M8 6 L8 14 L52 56" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      {filling && (
        <motion.rect
          x="55"
          y="98"
          width="10"
          height="26"
          rx="4"
          fill={color}
          animate={{ opacity: [0.5, 1, 0.5], y: [98, 104, 98] }}
          transition={{ duration: 0.5, repeat: Infinity }}
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
      <ellipse cx="-1.2" cy="-1.6" rx="1.4" ry="2" fill="#ffffff" opacity="0.5" />
    </motion.g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Focused burette reading view — large, with movable eye-level guide
   viewBox 320 × 560
   ══════════════════════════════════════════════════════════════════════════*/

export function BuretteScale({
  reading,
  color,
  guide,
  onGuideChange,
}: {
  reading: number;
  color: string;
  guide: number;
  onGuideChange?: (v: number) => void;
}) {
  const yTop = (50 - reading) * PX_PER_ML;
  const guideY = guide * PX_PER_ML;
  const atMeniscus = Math.abs(guide - reading) <= 0.03;

  return (
    <g>
      {/* frame */}
      <rect x="0" y="0" width="320" height="560" rx="18" fill="rgba(8,13,24,0.6)" stroke="rgba(255,255,255,0.08)" />

      <g transform="translate(96,10)">
        {Array.from({ length: 51 }).map((_, v) => {
          const y = v * PX_PER_ML;
          const major = v % 10 === 0;
          const mid = v % 5 === 0;
          const len = major ? 22 : mid ? 15 : 10;
          return (
            <g key={v}>
              <path
                d={`M26 ${y} h${len}`}
                stroke={major ? "#eaf1fb" : "#9fb0c8"}
                strokeOpacity={major ? 1 : 0.65}
                strokeWidth={major ? 1.6 : 1}
              />
              {major && (
                <text x="56" y={y + 4} fill="#cdd9ea" fontSize="13" fontFamily="JetBrains Mono, monospace">
                  {v}
                </text>
              )}
            </g>
          );
        })}

        {/* tube */}
        <rect x="0" y="0" width="26" height="312" rx="6" fill="url(#glassBody)" stroke="url(#glassEdge)" strokeWidth="2" />
        <clipPath id="readerClip">
          <rect x="1" y="1" width="24" height="310" rx="5" />
        </clipPath>
        <g clipPath="url(#readerClip)">
          <rect x="1" y={yTop} width="24" height={Math.max(0, 312 - yTop)} fill={color} opacity="0.93" />
          <ellipse cx="13" cy={yTop} rx="12" ry="3.6" fill="#ffffff" opacity="0.3" />
          <ellipse cx="13" cy={yTop + 1.6} rx="11" ry="2.6" fill="none" stroke="#0a1220" strokeOpacity="0.4" strokeWidth="1.2" />
          <rect x="2" y={yTop} width="4" height={Math.max(0, 312 - yTop)} fill="#ffffff" opacity="0.18" />
        </g>
        <rect x="3" y="5" width="3.5" height="300" rx="2" fill="#ffffff" opacity="0.2" />

        {/* meniscus marker */}
        <g>
          <path d={`M-30 ${yTop} H44`} stroke="#ffd23f" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.9" />
          <text x="-28" y={yTop - 8} fill="#ffd23f" fontSize="11" fontFamily="Inter, sans-serif">
            meniscus
          </text>
        </g>
      </g>

      {/* draggable eye-level guide */}
      <g
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 1 || !onGuideChange) return;
          const svg = (e.currentTarget as SVGElement).ownerSVGElement;
          if (!svg) return;
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const ctm = svg.getScreenCTM();
          if (!ctm) return;
          const local = pt.matrixTransform(ctm.inverse());
          const v = Math.max(0, Math.min(50, (local.y - 10) / PX_PER_ML));
          onGuideChange(Math.round(v * 20) / 20);
        }}
        role="slider"
        aria-label="Eye level guide"
        aria-valuenow={Math.round(guide * 100) / 100}
        aria-valuemin={0}
        aria-valuemax={50}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!onGuideChange) return;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            onGuideChange(Math.max(0, guide - 0.05));
          }
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            onGuideChange(Math.min(50, guide + 0.05));
          }
        }}
        style={{ cursor: "ns-resize" }}
      >
        <rect x="24" y={guideY + 10 - 12} width="272" height="24" rx="12" fill={atMeniscus ? "rgba(53,214,154,0.16)" : "rgba(92,116,244,0.14)"} stroke={atMeniscus ? "#35d69a" : "#8098ff"} strokeWidth="1.4" />
        <path d={`M24 ${guideY + 10} H296`} stroke={atMeniscus ? "#35d69a" : "#8098ff"} strokeWidth="1.6" />
        <circle cx="288" cy={guideY + 10} r="7" fill={atMeniscus ? "#35d69a" : "#8098ff"} />
        <path d={`M285 ${guideY + 7} l6 6 M291 ${guideY + 7} l-6 6`} stroke="#04070e" strokeWidth="1.6" />
        <text x="34" y={guideY + 5} fill={atMeniscus ? "#8ff0c6" : "#cdd8ff"} fontSize="11.5" fontFamily="Inter, sans-serif">
          eye level — {guide.toFixed(2)} mL
        </text>
      </g>

      <text x="160" y="368" textAnchor="middle" fill="#8d9db6" fontSize="11.5" fontFamily="Inter, sans-serif">
        Read the bottom of the meniscus, at eye level
      </text>
      <text x="160" y="392" textAnchor="middle" fill="#5f7290" fontSize="10.5" fontFamily="Inter, sans-serif">
        Drag the guide (or use ↑ ↓) to align with the meniscus
      </text>
    </g>
  );
}
