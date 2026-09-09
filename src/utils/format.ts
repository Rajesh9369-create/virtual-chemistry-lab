export function fmtMass(g: number | null | undefined, dp = 3): string {
  if (g === null || g === undefined) return `0.${"0".repeat(dp)}`;
  return g.toFixed(dp);
}

export function fmtVolume(mL: number | null | undefined, dp = 2): string {
  if (mL === null || mL === undefined) return `0.${"0".repeat(dp)}`;
  return mL.toFixed(dp);
}

export function fmtConc(c: number, dp = 4): string {
  return c.toFixed(dp);
}

export function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function sigma(input: string): string {
  // unicode subscripts for common formulas
  return input
    .replace(/₂/g, "\u2082")
    .replace(/₃/g, "\u2083")
    .replace(/₄/g, "\u2084")
    .replace(/₅/g, "\u2085");
}
