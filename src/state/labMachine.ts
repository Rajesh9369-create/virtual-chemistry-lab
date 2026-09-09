import { equivalenceVolume } from "@/utils/chemistry";
import { mix } from "@/utils/color";
import type { Deviation, Experiment, FlowMode, LabState, PhaseId, PhaseInfo } from "@/types";

/* ══════════════════════════════════════════════════════════════════════════
   Physical constants of the simulation
   ══════════════════════════════════════════════════════════════════════════*/

export const PHYS = {
  scoopRate: 0.14, // g·s⁻¹ collected on the spatula
  spatulaMax: 0.17, // g held by one spatula-full
  dispenseRate: 0.085, // g·s⁻¹ released over the paper
  pourRate: 9.5, // mL·s⁻¹ from the wash bottle
  fillRate: 8, // mL·s⁻¹ filling the burette
  drawRate: 3.4, // mL·s⁻¹ pipette aspiration
  fastDropVolume: 0.1,
  fastDropEvery: 120, // ms
  dropwiseVolume: 0.05,
  dropwiseEvery: 600, // ms
  precisionVolume: 0.05,
  precisionEvery: 1800, // ms
  overshootWindow: 0.3, // mL past equivalence counted as an overshoot
  buretteCapacity: 50,
  fillMax: 50.6,
  pipetteMax: 27.4,
} as const;

export const SOLVENT_COLOR = "#dfe9f0";

export const PHASE_LABEL: Record<PhaseId, string> = {
  PREPARE: "Preparation",
  WEIGH: "Weighing",
  TRANSFER: "Transfer",
  ADD_WATER: "Add solvent",
  DISSOLVE: "Dissolution",
  MAKEUP: "Make up to volume",
  ALIQUOT: "Aliquot",
  ADD_INDICATOR: "Indicator",
  PREPARE_BURETTE: "Burette",
  INITIAL_READING: "Initial reading",
  TITRATION: "Titration",
  FINAL_READING: "Final reading",
  CALCULATION: "Calculation",
  RESULT: "Result",
};

/* ══════════════════════════════════════════════════════════════════════════
   State factory
   ══════════════════════════════════════════════════════════════════════════*/

export function createInitialState(exp: Experiment): LabState {
  return {
    expId: exp.id,
    phases: exp.phases,
    index: 0,
    attempt: 1,

    reagentSelected: false,
    spatulaAt: "bottle",
    spatulaLoad: 0,
    scooping: false,
    dispensing: false,
    powderOnPaper: 0,
    tared: false,
    balanceStableTimer: 1.2,
    confirmedMass: null,

    solidInVessel: 0,
    liquidInVessel: 0,
    dissolved: 0,
    swirling: 0,
    pouring: false,
    pipetteVolume: 0,
    drawing: false,
    aliquotConfirmed: false,
    aliquotDispensed: 0,

    flaskLiquid: 0,
    indicatorDrops: 0,
    dropFlash: [],

    buretteLevel: 0,
    filling: false,
    stopcock: "closed",
    delivered: 0,
    initialReading: null,
    finalReading: null,
    readingDraft: "",
    endpointConfirmed: false,
    overshot: false,
    endpointDetected: false,

    deviations: [],
    observations: [],
    lastActionId: 1,
    timestamp: 0,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   Actions
   ══════════════════════════════════════════════════════════════════════════*/

export type LabAction =
  | { type: "TICK"; dt: number }
  | { type: "SELECT_REAGENT" }
  | { type: "TARE" }
  | { type: "SPATULA_TO"; at: "bottle" | "paper" }
  | { type: "SCOOP"; on: boolean }
  | { type: "DISPENSE"; on: boolean }
  | { type: "TAP_PAPER" }
  | { type: "CONFIRM_MASS" }
  | { type: "TRANSFER" }
  | { type: "POUR"; on: boolean }
  | { type: "SWIRL" }
  | { type: "DRAW"; on: boolean }
  | { type: "ADJUST_PIPETTE" }
  | { type: "CONFIRM_ALIQUOT" }
  | { type: "DISPENSE_ALIQUOT" }
  | { type: "ADD_DROP" }
  | { type: "FILL_BURETTE"; on: boolean }
  | { type: "DRAIN_BURETTE" }
  | { type: "SET_STOPCOCK"; mode: FlowMode }
  | { type: "DELIVER"; volume: number }
  | { type: "SET_READING_DRAFT"; value: string }
  | { type: "SUBMIT_READING" }
  | { type: "CONFIRM_ENDPOINT" }
  | { type: "REPEAT_TITRATION" }
  | { type: "ACCEPT_OVERSHOOT" }
  | { type: "NEXT_PHASE" }
  | { type: "RESTART_PREP" }
  | { type: "RESTART" };

/* ══════════════════════════════════════════════════════════════════════════
   Reducer
   ══════════════════════════════════════════════════════════════════════════*/

let devCounter = 0;
let flashCounter = 0;

function logDev(
  s: LabState,
  phase: PhaseId,
  title: string,
  what: string,
  why: string,
  fix: string,
  severity: Deviation["severity"] = "warning",
): LabState {
  const d: Deviation = { id: `d${++devCounter}`, phase, title, what, why, fix, severity };
  return { ...s, deviations: [...s.deviations, d] };
}

function observe(s: LabState, label: string, value: string): LabState {
  return { ...s, observations: [...s.observations.filter((o) => o.label !== label), { label, value }] };
}

export function labReducer(state: LabState, action: LabAction, exp: Experiment): LabState {
  const phase = state.phases[state.index];
  const sim = exp.sim;

  switch (action.type) {
    /* ── continuous simulation ───────────────────────────────────────────*/
    case "TICK": {
      const dt = Math.min(0.12, action.dt);
      let n = { ...state };

      if (n.scooping && n.spatulaAt === "bottle") {
        n.spatulaLoad = Math.min(PHYS.spatulaMax, n.spatulaLoad + PHYS.scoopRate * dt);
        if (n.spatulaLoad >= PHYS.spatulaMax) n.scooping = false;
      }
      if (n.dispensing && n.spatulaAt === "paper") {
        const amt = Math.min(n.spatulaLoad, PHYS.dispenseRate * dt * (0.75 + Math.random() * 0.6));
        n.spatulaLoad -= amt;
        n.powderOnPaper += amt;
        if (n.spatulaLoad <= 0.0006) {
          n.spatulaLoad = 0;
          n.dispensing = false;
        }
        n.balanceStableTimer = 0;
      }

      const busy = n.scooping || n.dispensing;
      n.balanceStableTimer = busy ? 0 : Math.min(1.4, n.balanceStableTimer + dt);

      if (n.pouring) {
        const target = phase === "MAKEUP" ? (sim.prep.flaskVolume ?? 100) : sim.prep.dissolveWater;
        const left = target - n.liquidInVessel;
        const rate =
          phase === "MAKEUP" && left < 5 ? (left < 1.5 ? 0.9 : 2.6) : PHYS.pourRate;
        const cap = phase === "MAKEUP" ? target + 2.6 : target + 30;
        n.liquidInVessel = Math.min(cap, n.liquidInVessel + rate * dt);
        n.lastActionId += 1;
        if (n.liquidInVessel >= cap) n.pouring = false;
      }

      n.swirling = Math.max(0, n.swirling - dt * 0.35);
      if (n.solidInVessel > 0 && n.liquidInVessel >= 8 && n.dissolved < 1) {
        const remaining = 1 - n.dissolved;
        n.dissolved = Math.min(1, n.dissolved + remaining * (0.14 + n.swirling * 0.9) * dt * 2.2);
      }

      if (n.drawing) {
        const target = sim.prep.aliquot ?? 25;
        const left = target - n.pipetteVolume;
        const rate = left < 0.5 ? 0.45 : left < 2 ? 1.2 : PHYS.drawRate;
        const step = Math.min(PHYS.pipetteMax - n.pipetteVolume, rate * dt);
        n.pipetteVolume += step;
        n.liquidInVessel = Math.max(0, n.liquidInVessel - step);
        if (n.pipetteVolume >= PHYS.pipetteMax) n.drawing = false;
      }

      if (n.filling) {
        const left = PHYS.buretteCapacity - n.buretteLevel;
        const rate = left < 0.5 ? 0.5 : left < 3 ? 2.4 : PHYS.fillRate;
        n.buretteLevel = Math.min(PHYS.fillMax, n.buretteLevel + rate * dt);
        if (n.buretteLevel >= PHYS.fillMax) n.filling = false;
      }

      n.timestamp += dt;
      return n;
    }

    /* ── preparation ─────────────────────────────────────────────────────*/
    case "SELECT_REAGENT":
      if (phase !== "PREPARE" || state.reagentSelected) return state;
      return { ...state, reagentSelected: true, lastActionId: state.lastActionId + 1 };

    case "TARE":
      return { ...state, tared: true, lastActionId: state.lastActionId + 1 };

    case "SPATULA_TO":
      return {
        ...state,
        spatulaAt: action.at,
        scooping: false,
        dispensing: false,
      };

    case "SCOOP":
      if (phase !== "WEIGH") return state;
      return { ...state, scooping: action.on && state.spatulaAt === "bottle", dispensing: false };

    case "DISPENSE":
      if (phase !== "WEIGH") return state;
      return { ...state, dispensing: action.on && state.spatulaAt === "paper", scooping: false };

    case "TAP_PAPER":
      if (phase !== "WEIGH") return state;
      return {
        ...state,
        powderOnPaper: Math.max(0, state.powderOnPaper - (0.012 + Math.random() * 0.02)),
      };

    case "CONFIRM_MASS": {
      if (phase !== "WEIGH") return state;
      const m = state.powderOnPaper;
      const target = sim.sample.targetMass;
      let s: LabState = { ...state, confirmedMass: m, scooping: false, dispensing: false };
      s = observe(s, `Mass of ${sim.sample.formula}`, `${m.toFixed(4)} g`);
      if (m > target + sim.sample.massTolerance) {
        s = logDev(
          s,
          "WEIGH",
          "Target mass exceeded",
          `The paper holds ${m.toFixed(4)} g, which is above the target of ${target.toFixed(3)} g.`,
          "A larger portion consumes more titrant than expected and can push the titre outside the burette range.",
          "Tap the weighing paper gently to remove excess powder before confirming the mass.",
          "error",
        );
      } else if (m < target - sim.sample.massTolerance) {
        s = logDev(
          s,
          "WEIGH",
          "Insufficient mass weighed",
          `Only ${m.toFixed(4)} g was weighed; about ${target.toFixed(3)} g is required.`,
          "A smaller portion gives a very small titre, so the relative reading error becomes large.",
          "Collect more powder with the spatula and dispense it onto the paper.",
          "warning",
        );
      }
      return s;
    }

    /* ── transfer & solution preparation ────────────────────────────────*/
    case "TRANSFER": {
      if (phase !== "TRANSFER" || state.powderOnPaper <= 0) return state;
      const mass = state.confirmedMass ?? state.powderOnPaper;
      return {
        ...state,
        powderOnPaper: 0,
        solidInVessel: mass,
        lastActionId: state.lastActionId + 1,
      };
    }

    case "POUR":
      if (phase !== "ADD_WATER" && phase !== "MAKEUP") return state;
      return { ...state, pouring: action.on, lastActionId: state.lastActionId + 1 };

    case "SWIRL": {
      if (!["DISSOLVE", "ADD_WATER", "MAKEUP", "TITRATION", "ADD_INDICATOR", "ALIQUOT"].includes(phase))
        return state;
      return { ...state, swirling: Math.min(1.15, state.swirling + 0.62), lastActionId: state.lastActionId + 1 };
    }

    case "DRAW":
      if (phase !== "ALIQUOT") return state;
      return { ...state, drawing: action.on && state.pipetteVolume < PHYS.pipetteMax };

    case "ADJUST_PIPETTE":
      if (phase !== "ALIQUOT") return state;
      return {
        ...state,
        pipetteVolume: Math.max(0, state.pipetteVolume - 0.06),
        lastActionId: state.lastActionId + 1,
      };

    case "CONFIRM_ALIQUOT": {
      if (phase !== "ALIQUOT") return state;
      const target = sim.prep.aliquot ?? 25;
      const v = state.pipetteVolume;
      let s = { ...state, aliquotConfirmed: true };
      if (Math.abs(v - target) > 0.15) {
        s = logDev(
          s,
          "ALIQUOT",
          "Aliquot volume incorrect",
          `The pipette was set to ${v.toFixed(2)} mL instead of ${target.toFixed(2)} mL.`,
          "The aliquot factor enters the calculation directly, so an error here changes the final result.",
          "Adjust the meniscus to the graduation mark before dispensing.",
          "error",
        );
      }
      s = observe(s, "Volume of aliquot", `${v.toFixed(2)} mL`);
      return s;
    }

    case "DISPENSE_ALIQUOT": {
      if (phase !== "ALIQUOT" || !state.aliquotConfirmed) return state;
      const v = state.pipetteVolume;
      return {
        ...state,
        pipetteVolume: 0,
        aliquotDispensed: v,
        flaskLiquid: v,
        lastActionId: state.lastActionId + 1,
      };
    }

    case "ADD_DROP": {
      if (phase !== "ADD_INDICATOR") return state;
      const drops = state.indicatorDrops + 1;
      let s = { ...state, indicatorDrops: drops, lastActionId: state.lastActionId + 1 };
      if (drops > (sim.indicator?.drops ?? 2) + 3) {
        s = logDev(
          s,
          "ADD_INDICATOR",
          "Excess indicator added",
          `${drops} drops of ${sim.indicator?.name} have been added.`,
          "Too much indicator can shift the observed endpoint and mask the colour change.",
          "Two or three drops are normally sufficient.",
        );
      }
      return s;
    }

    /* ── burette ────────────────────────────────────────────────────────*/
    case "FILL_BURETTE":
      if (phase !== "PREPARE_BURETTE") return state;
      return { ...state, filling: action.on && state.buretteLevel < PHYS.fillMax };

    case "DRAIN_BURETTE": {
      if (phase !== "PREPARE_BURETTE") return state;
      return {
        ...state,
        buretteLevel: Math.max(0, Math.round((state.buretteLevel - 0.1) * 100) / 100),
        lastActionId: state.lastActionId + 1,
      };
    }

    case "SET_STOPCOCK": {
      if (phase !== "TITRATION" && phase !== "PREPARE_BURETTE") return state;
      if (state.overshot && action.mode !== "closed") return state;
      return { ...state, stopcock: action.mode };
    }

    case "DELIVER": {
      if (phase !== "TITRATION" || state.stopcock === "closed" || state.endpointConfirmed) return state;
      const available = state.buretteLevel;
      if (available <= 0) return { ...state, stopcock: "closed" };
      const v = Math.min(action.volume, available);
      const delivered = state.delivered + v;
      const level = available - v;
      const vEq = equivalenceVolume(sim, state.confirmedMass ?? sim.sample.targetMass);
      const detected = delivered >= vEq;
      const overshot = delivered > vEq + PHYS.overshootWindow;
      const f = vEq > 0 ? Math.min(delivered / vEq, 1.35) : 0;
      const plume = f >= 0.93 ? mix(sim.colors.endpoint, sim.colors.overshoot, 0.35) : sim.titrant.color;
      const flash = [
        ...state.dropFlash.slice(-4),
        { id: ++flashCounter, color: plume, born: state.timestamp },
      ];
      let s: LabState = {
        ...state,
        buretteLevel: level,
        delivered,
        endpointDetected: detected,
        dropFlash: flash,
        lastActionId: state.lastActionId + 1,
        stopcock: overshot ? "closed" : state.stopcock,
        overshot,
      };
      if (overshot && !state.overshot) {
        s = logDev(
          s,
          "TITRATION",
          "Endpoint overshot",
          `The titration was continued past the endpoint; ${(delivered - vEq).toFixed(2)} mL of excess titrant was delivered.`,
          "Excess titrant increases the titre volume, so the calculated concentration is too low.",
          "Repeat the titration and add the titrant drop by drop once the colour begins to persist.",
          "error",
        );
      }
      return s;
    }

    case "SET_READING_DRAFT":
      return { ...state, readingDraft: action.value };

    case "SUBMIT_READING": {
      const raw = state.readingDraft.replace(",", ".").trim();
      const entered = Number.parseFloat(raw);
      if (!Number.isFinite(entered)) return state;
      let s = { ...state };
      if (phase === "INITIAL_READING") {
        const actual = Math.round((PHYS.buretteCapacity - state.buretteLevel) * 100) / 100;
        if (actual < -0.05) {
          return logDev(
            s,
            "INITIAL_READING",
            "Burette filled above the zero mark",
            "The liquid level stands above the 0.00 mL graduation, so no initial reading can be taken.",
            "Readings above zero are outside the calibrated scale of the burette.",
            "Open the stopcock briefly to lower the level, then read the meniscus again.",
            "error",
          );
        }
        if (Math.abs(entered - actual) > 0.03) {
          return logDev(
            s,
            "INITIAL_READING",
            "Initial reading not consistent",
            `You recorded ${entered.toFixed(2)} mL, but the bottom of the meniscus lies at ${actual.toFixed(2)} mL.`,
            "An incorrect burette reading is carried through the whole calculation.",
            "Align your eye with the meniscus and read the bottom of the curve to 0.01 mL.",
            "error",
          );
        }
        s = { ...s, initialReading: actual };
        s = observe(s, "Initial burette reading", `${actual.toFixed(2)} mL`);
        return s;
      }
      if (phase === "FINAL_READING") {
        const actual = Math.round(((state.initialReading ?? 0) + state.delivered) * 100) / 100;
        if (Math.abs(entered - actual) > 0.03) {
          return logDev(
            s,
            "FINAL_READING",
            "Final reading not consistent",
            `You recorded ${entered.toFixed(2)} mL, but the meniscus now lies at ${actual.toFixed(2)} mL.`,
            "The titre volume — and therefore the result — depends on both burette readings.",
            "Read the bottom of the meniscus at eye level, estimating the second decimal place.",
            "error",
          );
        }
        s = { ...s, finalReading: actual };
        s = observe(s, "Final burette reading", `${actual.toFixed(2)} mL`);
        s = observe(s, "Titre volume", `${(actual - (state.initialReading ?? 0)).toFixed(2)} mL`);
        return s;
      }
      return s;
    }

    case "CONFIRM_ENDPOINT": {
      if (phase !== "TITRATION" || !state.endpointDetected) return state;
      return { ...state, endpointConfirmed: true, stopcock: "closed" };
    }

    case "REPEAT_TITRATION":
      return {
        ...state,
        attempt: state.attempt + 1,
        buretteLevel: 0,
        filling: false,
        stopcock: "closed",
        delivered: 0,
        overshot: false,
        endpointDetected: false,
        endpointConfirmed: false,
        initialReading: null,
        finalReading: null,
        readingDraft: "",
        dropFlash: [],
        index: state.phases.indexOf("PREPARE_BURETTE"),
      };

    case "ACCEPT_OVERSHOOT":
      return { ...state, endpointConfirmed: true, stopcock: "closed" };

    case "NEXT_PHASE":
      if (state.index >= state.phases.length - 1) return state;
      return {
        ...state,
        index: state.index + 1,
        pouring: false,
        scooping: false,
        dispensing: false,
        filling: false,
        drawing: false,
        stopcock: "closed",
        readingDraft: "",
        swirling: 0,
      };

    case "RESTART_PREP":
      return {
        ...createInitialState(exp),
        deviations: state.deviations,
        attempt: state.attempt,
      };

    case "RESTART":
      return createInitialState(exp);

    default:
      return state;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   Derived / selectors
   ══════════════════════════════════════════════════════════════════════════*/

export function currentPhase(s: LabState): PhaseId {
  return s.phases[s.index];
}

export function buretteReading(s: LabState): number {
  return Math.round((PHYS.buretteCapacity - s.buretteLevel) * 100) / 100;
}

export function massOnBalance(s: LabState): number {
  return s.powderOnPaper;
}

export function titrationFlaskLiquid(s: LabState, exp: Experiment): number {
  return exp.sim.prep.vessel === "conical" ? s.liquidInVessel : s.aliquotDispensed;
}

export function titrationFlaskSolid(s: LabState, exp: Experiment): number {
  if (exp.sim.prep.vessel === "conical") return s.solidInVessel * (1 - s.dissolved);
  return 0;
}

export function equivalence(s: LabState, exp: Experiment): number {
  return equivalenceVolume(exp.sim, s.confirmedMass ?? exp.sim.sample.targetMass);
}

export function titreFraction(s: LabState, exp: Experiment): number {
  const v = equivalence(s, exp);
  return v > 0 ? s.delivered / v : 0;
}

/** Colour of the liquid in the titration flask, derived from the chemical state. */
export function flaskColor(s: LabState, exp: Experiment): string {
  const c = exp.sim.colors;
  if (exp.sim.indicator && s.indicatorDrops === 0) return SOLVENT_COLOR;
  const f = titreFraction(s, exp);
  if (s.overshot) return c.overshoot;
  if (f >= 1) return c.endpoint;
  if (f >= 0.955) return mix(c.nearEndpoint, c.endpoint, (f - 0.955) / 0.045);
  if (f >= 0.86) return mix(c.initial, c.nearEndpoint, (f - 0.86) / 0.095);
  return c.initial;
}

export function isNearEndpoint(s: LabState, exp: Experiment): boolean {
  const f = titreFraction(s, exp);
  return f >= 0.93 && f < 1;
}

export function isPhaseComplete(s: LabState, exp: Experiment): boolean {
  const sim = exp.sim;
  switch (currentPhase(s)) {
    case "PREPARE":
      return s.reagentSelected;
    case "WEIGH":
      return s.confirmedMass !== null;
    case "TRANSFER":
      return s.solidInVessel > 0;
    case "ADD_WATER":
      return s.liquidInVessel >= sim.prep.dissolveWater - 2;
    case "DISSOLVE":
      return s.dissolved >= 0.985;
    case "MAKEUP":
      return Math.abs(s.liquidInVessel - (sim.prep.flaskVolume ?? 100)) <= 1;
    case "ALIQUOT":
      return s.aliquotDispensed > 0;
    case "ADD_INDICATOR":
      return s.indicatorDrops >= (sim.indicator?.drops ?? 2);
    case "PREPARE_BURETTE":
      return Math.abs(buretteReading(s)) <= 0.15;
    case "INITIAL_READING":
      return s.initialReading !== null;
    case "TITRATION":
      return s.endpointConfirmed;
    case "FINAL_READING":
      return s.finalReading !== null;
    default:
      return false;
  }
}

/** Phases that advance on their own once the student has completed the action. */
export function autoAdvances(phase: PhaseId): boolean {
  return phase !== "CALCULATION" && phase !== "RESULT";
}

/* ══════════════════════════════════════════════════════════════════════════
   Phase narration
   ══════════════════════════════════════════════════════════════════════════*/

const vesselName = (exp: Experiment) =>
  exp.sim.prep.vessel === "volumetric"
    ? `${exp.sim.prep.flaskVolume} mL volumetric flask`
    : "250 mL conical flask";

export function phaseInfo(exp: Experiment, phase: PhaseId): PhaseInfo {
  const sim = exp.sim;
  const idx = exp.phases.indexOf(phase) + 1;
  const step = `Step ${String(idx).padStart(2, "0")}`;
  const mass = `${sim.sample.targetMass.toFixed(3)} g`;

  const table: Record<PhaseId, PhaseInfo> = {
    PREPARE: {
      id: "PREPARE",
      step,
      title: "Prepare the primary standard",
      instruction: `Take the bottle of ${sim.sample.name} (${sim.sample.formula}) from the desiccator and place it on the bench.`,
      focus: "reagent",
      why: "A primary standard must be dried and cooled in a desiccator: absorbed moisture would lower the amount of active compound in the weighed portion and so bias the result.",
      technique: "Never return unused solid to the stock bottle — you would contaminate the whole reagent.",
      safety: "Avoid raising dust; wear gloves when handling any toxic primary standard.",
      target: { label: "Quantity required", value: sim.sample.targetMass.toFixed(3), unit: "g" },
    },
    WEIGH: {
      id: "WEIGH",
      step,
      title: "Weigh the sample",
      instruction: `Accurately weigh approximately ${mass} of ${sim.sample.formula}. Hold the spatula in the reagent bottle to collect powder, then hold it over the weighing paper to release it.`,
      focus: "spatula",
      why: "The mass enters the calculation directly. Weighing to ±0.001 g on a four-figure balance keeps the weighing error below 0.2 %.",
      technique: "Tare the balance with the paper in place, add powder in small portions and read the display only once the stability indicator is lit.",
      safety: "Keep the draught shield closed while reading — air movement changes the last digit.",
      target: { label: "Target mass", value: sim.sample.targetMass.toFixed(3), unit: "g" },
    },
    TRANSFER: {
      id: "TRANSFER",
      step,
      title: "Transfer the sample",
      instruction: `Transfer the accurately weighed ${sim.sample.formula} quantitatively into the ${vesselName(exp)}.`,
      focus: "weighingPaper",
      why: "Every particle of the weighed portion must reach the flask; material left on the paper is material the titration never sees.",
      technique: "Fold the paper lengthways and wash the neck of the flask with a little solvent from the wash bottle.",
      safety: "Do not touch the powder with your fingers.",
    },
    ADD_WATER: {
      id: "ADD_WATER",
      step,
      title: "Add solvent",
      instruction: `Add ${sim.prep.dissolveWater} mL of ${sim.prep.solventName ?? "distilled water"} to the flask.`,
      focus: "washBottle",
      why: "Enough solvent must be present for the solid to dissolve completely; too little leaves undissolved material that reacts only slowly.",
      technique: "Direct the stream down the wall of the flask so that any solid clinging to the neck is washed down.",
      safety: "Glacial acetic acid is corrosive and flammable — use a fume cupboard.",
      target: {
        label: "Solvent to add",
        value: sim.prep.dissolveWater.toFixed(0),
        unit: "mL",
      },
    },
    DISSOLVE: {
      id: "DISSOLVE",
      step,
      title: "Dissolve the solid",
      instruction: "Swirl the flask until the solid has completely dissolved and the solution is clear.",
      focus: "prepVessel",
      why: "Undissolved solid reacts slowly and erratically, which makes the endpoint drift and the titre unreliable.",
      technique: "Use a gentle circular motion — the liquid should rotate without splashing the neck.",
      safety: sim.prep.note ?? "Never stopper a flask and shake it violently; solvent can be forced out.",
    },
    MAKEUP: {
      id: "MAKEUP",
      step,
      title: "Make up to the mark",
      instruction: `Add ${sim.prep.solventName ?? "solvent"} dropwise until the bottom of the meniscus rests exactly on the ${sim.prep.flaskVolume} mL graduation mark.`,
      focus: "prepVessel",
      why: "The flask volume defines the concentration of the standard solution. Above the mark the solution is too dilute; below it, too concentrated.",
      technique: "For the last millilitre use a dropper, and read the meniscus at eye level against a pale background.",
      safety: "Once the volume has been made up, the solution cannot be corrected — the preparation must be repeated.",
      target: { label: "Final volume", value: (sim.prep.flaskVolume ?? 100).toFixed(1), unit: "mL" },
    },
    ALIQUOT: {
      id: "ALIQUOT",
      step,
      title: "Pipette an aliquot",
      instruction: `Pipette ${sim.prep.aliquot?.toFixed(1)} mL of the standard solution into the conical flask.`,
      focus: "pipette",
      why: "The aliquot fraction (pipette volume ÷ flask volume) is what links the total amount weighed to the amount actually titrated.",
      technique: "Draw liquid above the mark, then let it out until the bottom of the meniscus sits on the mark before transferring.",
      safety: "Never pipette by mouth.",
      target: { label: "Aliquot volume", value: (sim.prep.aliquot ?? 25).toFixed(1), unit: "mL" },
    },
    ADD_INDICATOR: {
      id: "ADD_INDICATOR",
      step,
      title: "Add the indicator",
      instruction: `Add ${sim.indicator?.drops ?? 2} drops of ${sim.indicator?.name} to the flask.`,
      focus: "indicator",
      why: `The indicator signals the endpoint: ${sim.indicator?.transition ?? "a colour change"}.`,
      technique: "Hold the dropper vertically so that all drops are the same size, and swirl after each addition.",
      safety: "Indicator solutions are usually dissolved in ethanol — keep them away from flames.",
    },
    PREPARE_BURETTE: {
      id: "PREPARE_BURETTE",
      step,
      title: "Fill the burette",
      instruction: `Fill the burette with ${sim.titrant.name} to just above the zero mark, then adjust the level to 0.00 mL.`,
      focus: "burette",
      why: "Starting near zero uses the full length of the calibrated column and keeps the titre within the burette's range.",
      technique: "Rinse the burette with the titrant first, then fill it with the funnel and remove the funnel before reading.",
      safety: "Clamp the burette firmly and check that the jet is free of air bubbles.",
    },
    INITIAL_READING: {
      id: "INITIAL_READING",
      step,
      title: "Record the initial reading",
      instruction: "Read the bottom of the meniscus at eye level and record the initial burette reading to 0.01 mL.",
      focus: "burette",
      why: "Both burette readings are needed for the titre; a mistake here is repeated in the final result.",
      technique: "Place a dark line behind the meniscus to sharpen the reading, and estimate the second decimal place.",
      safety: "Do not read the burette from above or below — parallax is the commonest source of error.",
      target: { label: "Reading resolution", value: "0.01", unit: "mL" },
    },
    TITRATION: {
      id: "TITRATION",
      step,
      title: "Titrate to the endpoint",
      instruction: `Titrate with ${sim.titrant.name}. Add rapidly at first, then drop by drop as the colour begins to persist. ${sim.endpointHint}`,
      focus: "stopcock",
      why: `The endpoint corresponds to complete reaction: ${sim.stoichNote}. Stopping too early or too late biases the titre in opposite directions.`,
      technique: "Swirl continuously with the left hand while controlling the stopcock with the right, and rinse the flask walls with distilled water.",
      safety: "Keep the burette tip inside the neck of the flask so that no drop is lost.",
      target: { label: "Equivalent volume", value: equivalenceVolume(sim, sim.sample.targetMass).toFixed(2), unit: "mL" },
    },
    FINAL_READING: {
      id: "FINAL_READING",
      step,
      title: "Record the final reading",
      instruction: "Read the bottom of the meniscus at eye level and record the final burette reading.",
      focus: "burette",
      why: "The titre is the difference between the two readings, so this measurement carries the same weight as the first.",
      technique: "Wait a few seconds after closing the stopcock so that liquid clinging to the wall drains down.",
      safety: "Record the value immediately — do not rely on memory.",
    },
    CALCULATION: {
      id: "CALCULATION",
      step,
      title: "Calculate the result",
      instruction: `Work through the calculation using your own measurements and determine the ${sim.calculation.unknown.toLowerCase()}.`,
      focus: "none",
      why: "Every number in the calculation comes from an observation you made in this laboratory.",
      technique: "Carry all decimal places through and round only the final answer.",
      safety: "",
    },
    RESULT: {
      id: "RESULT",
      step,
      title: "Experiment complete",
      instruction: "Compare your result with the reference value and review any deviations.",
      focus: "none",
      why: "",
      technique: "",
      safety: "",
    },
  };

  return table[phase];
}

export function phaseStatus(s: LabState, phase: PhaseId): "done" | "active" | "todo" {
  const i = s.phases.indexOf(phase);
  if (i < 0) return "todo";
  if (i < s.index) return "done";
  if (i === s.index) return "active";
  return "todo";
}
