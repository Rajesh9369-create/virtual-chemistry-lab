import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   Shared SVG definitions — lab glass, metal and shadow materials.
   Rendered once per scene; referenced by every apparatus component.
   ══════════════════════════════════════════════════════════════════════════*/

export function GlassDefs() {
  return (
    <defs>
      <linearGradient id="glassBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="26%" stopColor="#ffffff" stopOpacity="0.045" />
        <stop offset="72%" stopColor="#ffffff" stopOpacity="0.02" />
        <stop offset="100%" stopColor="#cfe4ff" stopOpacity="0.13" />
      </linearGradient>
      <linearGradient id="glassEdge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#dbeaff" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#a9c4e8" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="metalBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#6d7a8e" />
        <stop offset="34%" stopColor="#c3ceda" />
        <stop offset="62%" stopColor="#8593a6" />
        <stop offset="100%" stopColor="#4d5766" />
      </linearGradient>
      <linearGradient id="steelBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8e9aab" />
        <stop offset="40%" stopColor="#e7edf4" />
        <stop offset="100%" stopColor="#6f7b8c" />
      </linearGradient>
      <radialGradient id="benchGlow" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#58a6ff" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#58a6ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="shadowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </linearGradient>
      <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
  );
}

const GLASS_STROKE = { stroke: "url(#glassEdge)", strokeWidth: 2 } as const;

/* ══════════════════════════════════════════════════════════════════════════
   Conical (Erlenmeyer) flask — 200 × 210 local units
   ══════════════════════════════════════════════════════════════════════════*/

const CONICAL_PATH =
  "M72 0 L128 0 L128 68 L188 188 Q194 206 176 206 L24 206 Q6 206 12 188 L72 68 Z";

function coneHalfWidth(y: number) {
  if (y <= 68) return 28;
  return 28 + 60 * ((y - 68) / 120);
}

export function ConicalFlask({
  uid,
  liquid,
  color,
  solid = 0,
  solidColor = "#f3f6fa",
  swirl = 0,
  flashes = [],
  dissolving = 0,
  clickable,
  onClick,
  ariaLabel,
  focus,
}: {
  uid: string;
  liquid: number;
  color: string;
  solid?: number;
  solidColor?: string;
  swirl?: number;
  flashes?: { id: number; color: string }[];
  dissolving?: number;
  clickable?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  focus?: boolean;
}) {
  const clip = `conical-${uid}`;
  const maxLiquid = 70;
  const h = Math.min(maxLiquid, liquid) * 1.55;
  const surfaceY = 206 - h;
  const rx = coneHalfWidth(Math.min(204, Math.max(68, surfaceY)));
  const spinning = swirl > 0.06;

  return (
    <g
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      aria-label={ariaLabel}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{ cursor: clickable ? "pointer" : "default" }}
    >
      <clipPath id={clip}>
        <path d={CONICAL_PATH} />
      </clipPath>

      <motion.g
        className={focus ? "focus-halo" : undefined}
        animate={spinning ? { rotate: [-1.1, 1.1, -1.1] } : { rotate: 0 }}
        transition={spinning ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        style={{ originX: "100px", originY: "206px" }}
      >
        {/* liquid */}
        {h > 0.5 && (
          <g clipPath={`url(#${clip})`}>
            <rect x="0" y={surfaceY} width="200" height={h} fill={color} opacity={0.92} />
            <motion.ellipse
              cx="100"
              cy={surfaceY}
              ry={5}
              fill="#ffffff"
              opacity={0.22}
              animate={spinning ? { rx: [rx * 0.9, rx, rx * 0.9] } : { rx }}
              transition={{ duration: 0.9, repeat: spinning ? Infinity : 0, ease: "easeInOut" }}
            />
            {/* vortex */}
            {spinning && (
              <motion.ellipse
                cx="100"
                cy={surfaceY + 18}
                fill="#000000"
                opacity={0.1}
                animate={{ rx: [rx * 0.18, rx * 0.3, rx * 0.18], ry: [7, 12, 7] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {/* glass shading over the liquid */}
            <rect x="0" y={surfaceY} width="200" height={h} fill="url(#glassBody)" />
          </g>
        )}

        {/* undissolved solid */}
        <AnimatePresence>
          {solid > 0.0005 && (
            <motion.g
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.6 }}
              style={{ originX: "100px", originY: "196px" }}
            >
              <ellipse
                cx="100"
                cy="197"
                rx={Math.min(70, 26 + solid * 90)}
                ry={Math.min(15, 7 + solid * 18)}
                fill={solidColor}
                opacity={0.95 * (1 - dissolving * 0.55)}
              />
              {PARTICLES.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={100 + p.x * (16 + solid * 60)}
                  cy={192 - p.y * 8}
                  r={1.4 + p.r}
                  fill={solidColor}
                  animate={
                    swirl > 0.1
                      ? { y: [-2, -14 * swirl, -2], x: [0, p.dx * 12 * swirl, 0], opacity: [0.9, 0.6, 0.9] }
                      : { y: 0, x: 0, opacity: 0.9 }
                  }
                  transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* drop impact plumes */}
        <AnimatePresence>
          {flashes.map((f) => (
            <motion.g key={f.id} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}>
              <motion.circle
                cx="100"
                cy={Math.max(surfaceY + 6, 150)}
                r={4}
                fill={f.color}
                animate={{ r: 34, opacity: 0.55 }}
                transition={{ duration: 1.05, ease: "easeOut" }}
              />
              <motion.path
                d={`M100 ${Math.max(surfaceY + 6, 150) - 6} l0 0`}
                stroke={f.color}
                strokeWidth={2}
                animate={{
                  d: `M100 ${Math.max(surfaceY + 6, 150)} l-12 -16 M100 ${Math.max(
                    surfaceY + 6,
                    150,
                  )} l12 -16 M100 ${Math.max(surfaceY + 6, 150)} l0 -22`,
                }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                opacity={0.6}
              />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* glass body */}
        <path d={CONICAL_PATH} fill="url(#glassBody)" {...GLASS_STROKE} />
        <path d="M74 6 L80 6 L82 66" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2.5" fill="none" />
        <path d="M118 8 L124 8 L126 70 L150 150" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" fill="none" />
        <ellipse cx="100" cy="2" rx="27" ry="5" fill="none" stroke="#eaf3ff" strokeOpacity="0.5" strokeWidth="2" />
      </motion.g>
    </g>
  );
}

const PARTICLES = [
  { x: -0.7, y: 0.4, r: 1.1, dx: -1 },
  { x: 0.5, y: 0.2, r: 0.9, dx: 1 },
  { x: 0.1, y: 0.8, r: 1.2, dx: 0.5 },
  { x: -0.3, y: 0.1, r: 0.8, dx: -0.6 },
  { x: 0.8, y: 0.6, r: 1.0, dx: 0.9 },
  { x: -0.9, y: 0.5, r: 0.7, dx: -0.9 },
  { x: 0.35, y: 0.9, r: 1.3, dx: 0.3 },
  { x: 0.0, y: 0.5, r: 0.9, dx: -0.2 },
];

/* ══════════════════════════════════════════════════════════════════════════
   Volumetric flask — 200 × 220 local units
   ══════════════════════════════════════════════════════════════════════════*/

const VOLUMETRIC_PATH =
  "M83 6 L117 6 L117 104 Q168 126 168 160 Q168 210 100 210 Q32 210 32 160 Q32 126 83 104 Z";

export function VolumetricFlask({
  uid,
  volume,
  capacity = 100,
  color,
  mark = true,
  swirl = 0,
  solid = 0,
  solidColor = "#f3f6fa",
  dissolving = 0,
  clickable,
  onClick,
  ariaLabel,
  focus,
}: {
  uid: string;
  volume: number;
  capacity?: number;
  color: string;
  mark?: boolean;
  swirl?: number;
  solid?: number;
  solidColor?: string;
  dissolving?: number;
  clickable?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  focus?: boolean;
}) {
  const clip = `vol-${uid}`;
  const bottom = 210;
  const markY = 52;
  const frac = Math.min(1, volume / capacity);
  const surfaceY = bottom - frac * (bottom - markY);
  const spinning = swirl > 0.06;

  return (
    <g
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      aria-label={ariaLabel}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{ cursor: clickable ? "pointer" : "default" }}
    >
      <clipPath id={clip}>
        <path d={VOLUMETRIC_PATH} />
      </clipPath>

      <motion.g
        className={focus ? "focus-halo" : undefined}
        animate={spinning ? { rotate: [-1, 1, -1] } : { rotate: 0 }}
        transition={spinning ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        style={{ originX: "100px", originY: "210px" }}
      >
        {volume > 0.5 && (
          <g clipPath={`url(#${clip})`}>
            <rect x="0" y={surfaceY} width="200" height={bottom - surfaceY} fill={color} opacity={0.92} />
            <motion.ellipse
              cx="100"
              cy={surfaceY}
              rx={surfaceY > 110 ? 62 : 17}
              ry={5}
              fill="#ffffff"
              opacity={0.24}
              animate={
                spinning
                  ? { rx: [surfaceY > 110 ? 54 : 15, surfaceY > 110 ? 62 : 17, surfaceY > 110 ? 54 : 15] }
                  : {}
              }
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
            <rect x="0" y={surfaceY} width="200" height={bottom - surfaceY} fill="url(#glassBody)" />
          </g>
        )}

        {solid > 0.0005 && (
          <g opacity={1 - dissolving * 0.6}>
            <ellipse
              cx="100"
              cy="200"
              rx={Math.min(60, 22 + solid * 70)}
              ry={Math.min(14, 6 + solid * 16)}
              fill={solidColor}
              opacity={0.95}
            />
            {PARTICLES.slice(0, 6).map((p, i) => (
              <circle key={i} cx={100 + p.x * (14 + solid * 50)} cy={196 - p.y * 7} r={1.5 + p.r} fill={solidColor} />
            ))}
          </g>
        )}

        <path d={VOLUMETRIC_PATH} fill="url(#glassBody)" {...GLASS_STROKE} />
        <path d="M85 12 L90 12 L92 100" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2.5" fill="none" />
        <path d="M120 110 Q160 128 162 158" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" fill="none" />
        <ellipse cx="100" cy="7" rx="16" ry="3.5" fill="none" stroke="#eaf3ff" strokeOpacity="0.5" strokeWidth="2" />

        {mark && (
          <g>
            <path d="M78 52 L96 52" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2.4" />
            <path d="M104 52 L122 52" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2.4" />
            <text
              x="128"
              y="56"
              fill="#cfe0f5"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              opacity="0.9"
            >
              {capacity}
            </text>
            <text x="128" y="68" fill="#9db2cd" fontSize="8" fontFamily="Inter, sans-serif">
              mL
            </text>
          </g>
        )}
      </motion.g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Reagent bottle (solid standard) — 150 × 190 local units
   ══════════════════════════════════════════════════════════════════════════*/

export function ReagentBottle({
  label,
  formula,
  powderColor = "#f3f6fa",
  open = false,
  focus,
  onClick,
  tag = "PRIMARY STANDARD",
  liquid,
}: {
  label: string;
  formula: string;
  powderColor?: string;
  open?: boolean;
  focus?: boolean;
  onClick?: () => void;
  tag?: string;
  liquid?: string;
}) {
  return (
    <g
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `${label} bottle` : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ cursor: onClick ? "pointer" : "default" }}
      className={focus ? "focus-halo" : undefined}
    >
      <motion.g animate={open ? { y: -3 } : { y: 0 }} transition={{ duration: 0.5 }}>
        {/* body */}
        <path
          d="M22 44 Q22 34 34 32 L44 30 L44 12 L106 12 L106 30 L116 32 Q128 34 128 44 L128 168 Q128 182 114 182 L36 182 Q22 182 22 168 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="url(#glassEdge)"
          strokeWidth="2"
        />
        {/* contents */}
        {liquid ? (
          <>
            <path d="M28 78 L122 78 L122 168 Q122 176 112 176 L38 176 Q28 176 28 168 Z" fill={liquid} opacity="0.42" />
            <path d="M28 78 Q60 72 92 80 Q112 86 122 76" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" fill="none" />
          </>
        ) : (
          <>
            <path d="M28 140 L122 140 L122 168 Q122 176 112 176 L38 176 Q28 176 28 168 Z" fill={powderColor} opacity="0.5" />
            <path d="M28 152 Q60 138 92 152 Q112 160 122 150 L122 168 Q122 176 112 176 L38 176 Q28 176 28 168 Z" fill={powderColor} opacity="0.85" />
          </>
        )}
        {/* cap */}
        <rect x="40" y="2" width="70" height="16" rx="4" fill="url(#metalBody)" stroke="#2c3442" strokeWidth="1" />
        <rect x="44" y="18" width="62" height="12" rx="3" fill="#5d687a" opacity="0.6" />
        {/* label */}
        <rect x="26" y="70" width="98" height="56" rx="6" fill="#eef3fa" opacity="0.95" />
        <text x="75" y="90" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0d1524" fontFamily="Inter, sans-serif">
          {formula}
        </text>
        <text x="75" y="104" textAnchor="middle" fontSize="8.5" fill="#3d4a60" fontFamily="Inter, sans-serif">
          {label.length > 20 ? label.slice(0, 19) + "…" : label}
        </text>
        <text x="75" y="118" textAnchor="middle" fontSize="7.5" fill="#5c6a82" fontFamily="Inter, sans-serif" letterSpacing="1">
          {tag}
        </text>
        <path d="M30 46 L30 66" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="3" />
      </motion.g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Solvent / wash bottle — 150 × 180 local units
   ══════════════════════════════════════════════════════════════════════════*/

export function SolventBottle({
  label,
  color = "#cfe3f5",
  pouring = false,
  focus,
  onHoldStart,
  onHoldEnd,
}: {
  label: string;
  color?: string;
  pouring?: boolean;
  focus?: boolean;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
}) {
  return (
    <g
      onPointerDown={onHoldStart}
      onPointerUp={onHoldEnd}
      onPointerLeave={onHoldEnd}
      onPointerCancel={onHoldEnd}
      role={onHoldStart ? "button" : undefined}
      aria-label={onHoldStart ? `${label} — hold to pour` : undefined}
      tabIndex={onHoldStart ? 0 : undefined}
      onKeyDown={
        onHoldStart
          ? (e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                onHoldStart();
              }
            }
          : undefined
      }
      onKeyUp={onHoldEnd ? () => onHoldEnd() : undefined}
      style={{ cursor: onHoldStart ? "pointer" : "default" }}
      className={focus ? "focus-halo" : undefined}
    >
      <motion.g
        animate={pouring ? { rotate: -32, x: -18, y: -12 } : { rotate: 0, x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
        style={{ originX: "75px", originY: "170px" }}
      >
        {/* body */}
        <path
          d="M30 52 Q30 40 44 38 L106 38 Q120 40 120 52 L120 158 Q120 172 106 172 L44 172 Q30 172 30 158 Z"
          fill="rgba(255,255,255,0.055)"
          stroke="url(#glassEdge)"
          strokeWidth="2"
        />
        <path d="M34 96 L116 96 L116 158 Q116 168 106 168 L44 168 Q34 168 34 158 Z" fill={color} opacity="0.55" />
        <path d="M34 96 Q60 88 84 96 Q104 102 116 92" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
        {/* shoulder + cap */}
        <path d="M52 38 L52 22 L98 22 L98 38" fill="rgba(255,255,255,0.06)" stroke="url(#glassEdge)" strokeWidth="1.6" />
        <rect x="48" y="10" width="54" height="14" rx="4" fill="url(#metalBody)" stroke="#2c3442" strokeWidth="1" />
        {/* delivery tube */}
        <path
          d="M75 12 L75 -34 Q75 -50 100 -50 L120 -50"
          fill="none"
          stroke="url(#steelBody)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M75 12 L75 -34 Q75 -50 100 -50 L118 -50" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.6" />
        {/* label */}
        <rect x="38" y="112" width="74" height="34" rx="5" fill="#eef3fa" opacity="0.95" />
        <text x="75" y="126" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0d1524" fontFamily="Inter, sans-serif">
          {label.split(" ")[0].toUpperCase()}
        </text>
        <text x="75" y="139" textAnchor="middle" fontSize="7.5" fill="#3d4a60" fontFamily="Inter, sans-serif">
          {label.length > 16 ? label.slice(0, 15) + "…" : label}
        </text>
        <path d="M36 52 L36 84" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="3" />
      </motion.g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Indicator dropper bottle — 90 × 130 local units
   ══════════════════════════════════════════════════════════════════════════*/

export function IndicatorBottle({
  label,
  color,
  focus,
  onClick,
  tilt = false,
}: {
  label: string;
  color: string;
  focus?: boolean;
  onClick?: () => void;
  tilt?: boolean;
}) {
  return (
    <g
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `${label} — add one drop` : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ cursor: onClick ? "pointer" : "default" }}
      className={focus ? "focus-halo" : undefined}
    >
      <motion.g
        animate={tilt ? { rotate: -34, x: -10, y: -14 } : { rotate: 0, x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 15 }}
        style={{ originX: "45px", originY: "126px" }}
      >
        <path
          d="M18 40 Q18 30 28 30 L62 30 Q72 30 72 40 L72 114 Q72 126 60 126 L30 126 Q18 126 18 114 Z"
          fill="rgba(214,152,60,0.28)"
          stroke="url(#glassEdge)"
          strokeWidth="2"
        />
        <path d="M22 76 L68 76 L68 114 Q68 122 60 122 L30 122 Q22 122 22 114 Z" fill={color} opacity="0.85" />
        <rect x="26" y="18" width="38" height="14" rx="3" fill="url(#metalBody)" stroke="#2c3442" strokeWidth="1" />
        <path d="M43 18 L43 6 Q43 2 47 2 L51 2 Q55 2 55 6 L55 18 Z" fill="#2f3846" />
        <ellipse cx="49" cy="3" rx="6" ry="3" fill="#414d5e" />
        <path d="M55 8 Q68 10 66 24 Q65 32 58 34" fill="none" stroke="url(#steelBody)" strokeWidth="4" strokeLinecap="round" />
        <rect x="22" y="88" width="46" height="26" rx="4" fill="#eef3fa" opacity="0.92" />
        <text x="45" y="101" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0d1524" fontFamily="Inter, sans-serif">
          {label.length > 11 ? label.slice(0, 10) + "…" : label}
        </text>
        <text x="45" y="111" textAnchor="middle" fontSize="6.5" fill="#3d4a60" fontFamily="Inter, sans-serif">
          INDICATOR
        </text>
        <path d="M22 44 L22 70" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2.5" />
      </motion.g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Bulb pipette — 60 × 300 local units
   ══════════════════════════════════════════════════════════════════════════*/

export function Pipette({
  uid,
  volume,
  target = 25,
  color = "#dfe9f0",
  focus,
}: {
  uid: string;
  volume: number;
  target?: number;
  color?: string;
  focus?: boolean;
}) {
  const clip = `pipette-${uid}`;
  const tipY = 396;
  const markY = 135;
  const surfaceY = tipY - volume * 10.44;
  const atMark = Math.abs(volume - target) <= 0.15;

  return (
    <g className={focus ? "focus-halo" : undefined}>
      <clipPath id={clip}>
        <path d="M22 70 L38 70 L38 250 Q12 258 12 276 Q12 300 30 300 Q48 300 48 276 Q48 258 22 250 L22 70 L38 70 L38 300 L34 300 L34 380 Q34 396 30 396 Q26 396 26 380 L26 300 L38 300 Z" />
      </clipPath>

      {/* liquid column */}
      <g clipPath={`url(#${clip})`}>
        <rect x="6" y={surfaceY} width="48" height={tipY - surfaceY + 10} fill={color} opacity="0.9" />
        <ellipse cx="30" cy={surfaceY} rx="9" ry="2.6" fill="#ffffff" opacity="0.35" />
      </g>

      {/* glass body */}
      <path
        d="M22 70 L38 70 L38 250 Q12 256 12 276 Q12 300 30 300 Q48 300 48 276 Q48 256 22 250 Z"
        fill="url(#glassBody)"
        {...GLASS_STROKE}
      />
      <rect x="22" y="300" width="16" height="80" fill="url(#glassBody)" stroke="url(#glassEdge)" strokeWidth="1.8" />
      <path d="M30 380 Q30 396 30 396 Q30 396 30 396 L34 380 L34 384 Q30 400 26 384 Z" fill="url(#glassBody)" stroke="url(#glassEdge)" strokeWidth="1.6" />
      <path d="M24 74 L24 240" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" />

      {/* graduation mark */}
      <g>
        <path d={`M38 ${markY} L50 ${markY}`} stroke={atMark ? "#35d69a" : "#ffffff"} strokeWidth="2.6" strokeOpacity="0.95" />
        <path d={`M10 ${markY} L22 ${markY}`} stroke={atMark ? "#35d69a" : "#ffffff"} strokeWidth="2.6" strokeOpacity="0.95" />
        <text x="54" y={markY + 4} fontSize="11" fill={atMark ? "#35d69a" : "#c3d2e6"} fontFamily="JetBrains Mono, monospace">
          {target.toFixed(1)}
        </text>
        <text x="54" y={markY + 16} fontSize="8" fill="#8d9db6" fontFamily="Inter, sans-serif">
          mL
        </text>
      </g>

      {/* filler at the top */}
      <g>
        <rect x="27" y="44" width="6" height="28" rx="3" fill="url(#steelBody)" />
        <rect x="12" y="0" width="36" height="46" rx="14" fill="#3a4557" stroke="#5b6779" strokeWidth="1.5" />
        <circle cx="30" cy="23" r="8" fill="#5c74f4" opacity="0.45" />
        <path d="M25 20 L30 27 L35 20" stroke="#dbe4f5" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <text x="30" y="40" textAnchor="middle" fontSize="7" fill="#b6c4d8" fontFamily="Inter, sans-serif">
          FILLER
        </text>
      </g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Weighing paper + spatula
   ══════════════════════════════════════════════════════════════════════════*/

export function WeighingPaper({
  mass,
  max = 0.8,
  color = "#f3f6fa",
  focus,
  onClick,
  tilting = 0,
}: {
  mass: number;
  max?: number;
  color?: string;
  focus?: boolean;
  onClick?: () => void;
  tilting?: number;
}) {
  const pile = Math.min(1, mass / max);
  return (
    <g
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? "Weighing paper" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ cursor: onClick ? "pointer" : "default" }}
      className={focus ? "focus-halo" : undefined}
    >
      <motion.g animate={{ rotate: tilting * -26, x: tilting * 60, y: tilting * -10 }} transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }} style={{ originX: "80px", originY: "60px" }}>
        <path
          d="M4 62 L80 20 L156 62 L80 78 Z"
          fill="#e8eef6"
          stroke="#b9c8dc"
          strokeWidth="1.4"
          opacity="0.97"
        />
        <path d="M4 62 L80 44 L156 62 L80 78 Z" fill="#dbe4ef" opacity="0.9" />
        {pile > 0.01 && (
          <g>
            <ellipse cx="80" cy="52" rx={12 + pile * 44} ry={3 + pile * 9} fill={color} />
            <ellipse cx="80" cy="49" rx={7 + pile * 30} ry={2 + pile * 6} fill="#ffffff" opacity="0.55" />
            {PARTICLES.slice(0, 5).map((p, i) => (
              <circle key={i} cx={80 + p.x * (8 + pile * 34)} cy={50 - p.y * 5} r={1 + p.r} fill={color} />
            ))}
          </g>
        )}
      </motion.g>
    </g>
  );
}

export function Spatula({
  load,
  color = "#f3f6fa",
  at,
}: {
  load: number;
  color?: string;
  at: "bottle" | "paper";
}) {
  const pile = Math.min(1, load / 0.17);
  return (
    <g>
      <motion.g
        animate={{ rotate: at === "paper" ? 42 : -8, y: at === "paper" ? 26 : 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 13 }}
        style={{ originX: "20px", originY: "20px" }}
      >
        {/* blade */}
        <path
          d="M14 6 Q34 -2 58 6 L62 18 Q40 30 18 24 Z"
          fill="url(#steelBody)"
          stroke="#7d8797"
          strokeWidth="1"
        />
        {pile > 0.02 && (
          <g>
            <ellipse cx="38" cy="14" rx={8 + pile * 16} ry={2 + pile * 5} fill={color} opacity="0.95" />
            {PARTICLES.slice(0, 4).map((p, i) => (
              <circle key={i} cx={38 + p.x * (6 + pile * 14)} cy={13 - p.y * 3} r={1 + p.r} fill={color} />
            ))}
          </g>
        )}
        {/* handle */}
        <rect x="60" y="9" width="86" height="10" rx="5" fill="url(#metalBody)" stroke="#59636f" strokeWidth="1" />
        <circle cx="150" cy="14" r="5" fill="#6a7484" />
      </motion.g>
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Bench furniture
   ══════════════════════════════════════════════════════════════════════════*/

export function RetortStand({ height = 440 }: { height?: number }) {
  return (
    <g>
      <rect x="60" y="0" width="250" height="22" rx="8" fill="#1a2434" stroke="#2c3a4f" strokeWidth="1.5" />
      <rect x="66" y="4" width="238" height="6" rx="3" fill="url(#steelBody)" opacity="0.5" />
      <rect x="96" y={-height} width="12" height={height + 4} rx="4" fill="url(#metalBody)" stroke="#39424f" strokeWidth="1" />
      <rect x="98" y={-height} width="3" height={height + 4} fill="#ffffff" opacity="0.28" />
    </g>
  );
}

/** Burette clamp arm joining the stand rod to the burette. */
export function ClampArm({ length = 120 }: { length?: number }) {
  return (
    <g>
      <rect x="0" y="-6" width={length} height="12" rx="4" fill="#26313f" stroke="#414f63" strokeWidth="1" />
      <rect x="0" y="-2" width={length} height="3" fill="#ffffff" opacity="0.16" />
      <rect x={length - 14} y="-16" width="16" height="32" rx="5" fill="#2c3849" stroke="#4a5871" strokeWidth="1.2" />
      <rect x={length - 11} y="-13" width="10" height="26" rx="4" fill="rgba(220,232,246,0.28)" />
    </g>
  );
}

export function WhiteTile() {
  return (
    <g>
      <rect x="0" y="0" width="300" height="16" rx="5" fill="#e7edf5" opacity="0.9" />
      <rect x="6" y="4" width="288" height="5" rx="3" fill="#ffffff" opacity="0.85" />
    </g>
  );
}

export function BenchSurface({ y = 470, children }: { y?: number; children?: ReactNode }) {
  return (
    <g>
      <rect x="-100" y={y} width="1200" height="200" fill="#0a1322" />
      <path d={`M-100 ${y} L1100 ${y}`} stroke="#3d4f6b" strokeWidth="1.6" strokeOpacity="0.7" />
      <rect x="-100" y={y} width="1200" height="10" fill="#ffffff" opacity="0.045" />
      <ellipse cx="500" cy={y + 4} rx="520" ry="34" fill="url(#benchGlow)" />
      {children}
    </g>
  );
}

/** Soft contact shadow used under every piece of apparatus. */
export function ContactShadow({ cx, cy, rx, opacity = 0.55 }: { cx: number; cy: number; rx: number; opacity?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.14} fill="#000000" opacity={opacity} filter="url(#softBlur)" />;
}

/** Falling powder particles. */
export function PowderStream({ active, color, seed = 0 }: { active: boolean; color: string; seed?: number }) {
  return (
    <g>
      <AnimatePresence>
        {active &&
          Array.from({ length: 7 }).map((_, i) => (
            <motion.circle
              key={`${seed}-${i}`}
              cx={0}
              cy={0}
              r={1.6 + ((i * 7) % 3) * 0.5}
              fill={color}
              initial={{ x: (i % 3) * 5 - 5, y: 0, opacity: 0 }}
              animate={{ x: (i % 3) * 5 - 5 + (i - 3) * 3, y: 90 + i * 6, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05, ease: "easeIn" }}
            />
          ))}
      </AnimatePresence>
    </g>
  );
}
