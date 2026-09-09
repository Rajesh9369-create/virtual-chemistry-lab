import type { CalculationStep, Experiment, SimConfig } from "@/types";

export interface Measurements {
  sampleMass: number; // g
  flaskVolume: number | null; // mL
  aliquot: number | null; // mL
  initialReading: number; // mL
  finalReading: number; // mL
}

export interface ComputedResult {
  titre: number;
  purityFactor: number;
  molesSample: number;
  aliquotFactor: number;
  molesInFlask: number;
  molesTitrant: number;
  value: number;
  steps: CalculationStep[];
}

const round = (v: number, dp = 4) => Math.round(v * 10 ** dp) / 10 ** dp;

export function titre(m: Measurements): number {
  return round(m.finalReading - m.initialReading, 2);
}

/** moles of analyte delivered into the titration flask */
export function analyteMoles(cfg: SimConfig, m: Measurements) {
  const molesSample = (m.sampleMass * cfg.sample.truePurity) / cfg.sample.molarMass;
  const usesDilution = cfg.prep.vessel === "volumetric" && !!cfg.prep.flaskVolume && !!cfg.prep.aliquot;
  const aliquotFactor = usesDilution ? (m.aliquot ?? 0) / (m.flaskVolume ?? 1) : 1;
  return { molesSample, aliquotFactor, molesInFlask: molesSample * aliquotFactor };
}

/**
 * Hidden equivalence volume — derived from the mass actually weighed by the
 * student, so the endpoint always matches the real simulated chemistry.
 */
export function equivalenceVolume(cfg: SimConfig, sampleMass: number): number {
  const { molesSample, aliquotFactor } = analyteMoles(cfg, {
    sampleMass,
    flaskVolume: cfg.prep.flaskVolume ?? null,
    aliquot: cfg.prep.aliquot ?? null,
    initialReading: 0,
    finalReading: 0,
  });
  const molesInFlask = molesSample * aliquotFactor;
  return (molesInFlask * cfg.stoichRatio * 1000) / cfg.titrant.trueMolarity;
}

export function computeResult(exp: Experiment, m: Measurements): ComputedResult {
  const cfg = exp.sim;
  const t = titre(m);
  const { molesSample, aliquotFactor, molesInFlask } = analyteMoles(cfg, m);
  const molesTitrant = molesInFlask * cfg.stoichRatio;
  const litres = t / 1000;

  let value: number;
  if (cfg.calculation.mode === "standardize") {
    value = litres > 0 ? molesTitrant / litres : 0;
  } else {
    // assay: titrant molarity is known, sample content is the unknown
    const totalMoles = (litres * cfg.titrant.trueMolarity) / cfg.stoichRatio / (aliquotFactor || 1);
    const massOfAnalyte = totalMoles * cfg.sample.molarMass;
    value = m.sampleMass > 0 ? (massOfAnalyte / m.sampleMass) * 100 : 0;
  }

  const massStr = `${m.sampleMass.toFixed(4)} g`;
  const nSample = `${molesSample.toFixed(5)} mol`;
  const steps: CalculationStep[] = [];

  steps.push({
    label: "Titre volume",
    formula: "V = final reading − initial reading",
    substitution: `V = ${m.finalReading.toFixed(2)} mL − ${m.initialReading.toFixed(2)} mL`,
    result: `${t.toFixed(2)} mL`,
  });

  if (aliquotFactor !== 1) {
    steps.push({
      label: "Moles of standard in the stock solution",
      formula: `n = m / M`,
      substitution: `n = ${massStr} / ${cfg.sample.molarMass.toFixed(2)} g·mol⁻¹`,
      result: nSample,
    });
    steps.push({
      label: `Moles in the ${m.aliquot?.toFixed(1)} mL aliquot`,
      formula: "n(aliquot) = n(stock) × V(pipette) / V(flask)",
      substitution: `n = ${molesSample.toFixed(5)} × ${m.aliquot?.toFixed(1)} / ${m.flaskVolume?.toFixed(0)}`,
      result: `${molesInFlask.toFixed(5)} mol`,
    });
  } else {
    steps.push({
      label: "Moles of standard weighed",
      formula: "n = m / M",
      substitution: `n = ${massStr} / ${cfg.sample.molarMass.toFixed(2)} g·mol⁻¹`,
      result: nSample,
    });
  }

  steps.push({
    label: "Moles of titrant reacted",
    formula: `n(titrant) = n(analyte) × ${cfg.stoichRatio}`,
    substitution: `n = ${molesInFlask.toFixed(5)} mol × ${cfg.stoichRatio}`,
    result: `${molesTitrant.toFixed(5)} mol`,
  });

  if (cfg.calculation.mode === "standardize") {
    steps.push({
      label: cfg.calculation.unknown,
      formula: "M = n(titrant) / V(titre in L)",
      substitution: `M = ${molesTitrant.toFixed(5)} / ${(t / 1000).toFixed(4)} L`,
      result: `${round(value, 4).toFixed(4)} mol/L`,
    });
  } else {
    steps.push({
      label: cfg.calculation.unknown,
      formula: "content = n(analyte) × M × 100 / m(sample)",
      substitution: `= ${((litres * cfg.titrant.trueMolarity) / cfg.stoichRatio).toFixed(5)} mol × ${cfg.sample.molarMass.toFixed(2)} × 100 / ${m.sampleMass.toFixed(4)} g`,
      result: `${round(value, 2).toFixed(2)} % w/w`,
    });
  }

  return {
    titre: t,
    purityFactor: cfg.sample.truePurity,
    molesSample,
    aliquotFactor,
    molesInFlask,
    molesTitrant,
    value: cfg.calculation.mode === "standardize" ? round(value, 4) : round(value, 2),
    steps,
  };
}

export function accuracyBand(value: number, expected: number) {
  const err = Math.abs(value - expected) / (expected || 1);
  const pct = err * 100;
  if (pct <= 0.3) return { grade: "Excellent", tone: "ok" as const, pct };
  if (pct <= 0.8) return { grade: "Very good", tone: "ok" as const, pct };
  if (pct <= 2) return { grade: "Good", tone: "info" as const, pct };
  if (pct <= 5) return { grade: "Acceptable", tone: "warn" as const, pct };
  return { grade: "Needs review", tone: "bad" as const, pct };
}
