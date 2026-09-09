/* ============================================================================
 * Domain types for the virtual chemistry laboratory
 * ==========================================================================*/

export type CategoryId = "acid-base" | "redox" | "complexometric" | "precipitation" | "non-aqueous";

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  blurb: string;
  /** Chemistry accent used for category coding in the UI */
  accent: string;
}

export type Difficulty = "Introductory" | "Intermediate" | "Advanced";

export type PhaseId =
  | "PREPARE"
  | "WEIGH"
  | "TRANSFER"
  | "ADD_WATER"
  | "DISSOLVE"
  | "MAKEUP"
  | "ALIQUOT"
  | "ADD_INDICATOR"
  | "PREPARE_BURETTE"
  | "INITIAL_READING"
  | "TITRATION"
  | "FINAL_READING"
  | "CALCULATION"
  | "RESULT";

export type FocusTarget =
  | "reagent"
  | "spatula"
  | "balance"
  | "weighingPaper"
  | "prepVessel"
  | "washBottle"
  | "pipette"
  | "indicator"
  | "burette"
  | "funnel"
  | "stopcock"
  | "titrationFlask"
  | "none";

export interface Reagent {
  name: string;
  formula?: string;
  role: "primary standard" | "sample" | "titrant" | "indicator" | "solvent" | "auxiliary";
  detail: string;
  highlighted?: boolean;
}

export interface ApparatusItem {
  name: string;
  spec: string;
}

export interface CalculationStep {
  label: string;
  formula: string;
  substitution: string;
  result: string;
}

export interface SimConfig {
  /** Solid that is weighed out */
  sample: {
    name: string;
    formula: string;
    molarMass: number;
    /** g that the student should aim for */
    targetMass: number;
    /** ± g accepted as "accurately weighed" */
    massTolerance: number;
    /** true fraction of active content (drives the hidden equivalence volume) */
    truePurity: number;
    powderColor: string;
  };
  titrant: {
    name: string;
    formula: string;
    nominalMolarity: number;
    /** hidden true molarity — the answer the student should find */
    trueMolarity: number;
    color: string;
  };
  /** mol titrant per mol analyte */
  stoichRatio: number;
  stoichNote: string;
  prep: {
    /** vessel receiving the weighed solid */
    vessel: "volumetric" | "conical";
    /** mL of the volumetric flask, if used */
    flaskVolume?: number;
    /** mL of solvent added for dissolution */
    dissolveWater: number;
    /** mL pipetted into the titration flask (volumetric flow only) */
    aliquot?: number;
    /** name of the dissolving solvent (distilled water for most) */
    solventName?: string;
    /** extra technique note shown during dissolution (e.g. warming) */
    note?: string;
  };
  indicator?: {
    name: string;
    drops: number;
    transition: string;
  };
  colors: {
    /** solution in the titration flask before titration */
    initial: string;
    nearEndpoint: string;
    endpoint: string;
    overshoot: string;
  };
  calculation: {
    mode: "standardize" | "assay";
    unknown: string;
    unit: string;
    /** reference (true) value */
    expected: number;
    expectedLabel: string;
    toleranceHint: string;
  };
  endpointHint: string;
}

export interface Experiment {
  id: string;
  code: string;
  title: string;
  category: CategoryId;
  technique: string;
  tagline: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
  principle: string;
  reaction: string[];
  reagents: Reagent[];
  apparatus: ApparatusItem[];
  endpoint: string;
  safety: string[];
  procedure: { title: string; detail: string }[];
  learning: string[];
  available: boolean;
  /** ordered list of laboratory phases that make up this experiment */
  phases: PhaseId[];
  sim: SimConfig;
}

/* ── Runtime laboratory state ─────────────────────────────────────────────*/

export type FlowMode = "closed" | "fast" | "dropwise" | "precision";

export interface Deviation {
  id: string;
  phase: PhaseId;
  title: string;
  what: string;
  why: string;
  fix: string;
  severity: "info" | "warning" | "error";
}

export interface ObservationRow {
  label: string;
  value: string;
}

export interface LabState {
  expId: string;
  phases: PhaseId[];
  index: number;
  attempt: number;

  /* weighing */
  reagentSelected: boolean;
  spatulaAt: "bottle" | "paper";
  spatulaLoad: number;
  scooping: boolean;
  dispensing: boolean;
  powderOnPaper: number;
  tared: boolean;
  balanceStableTimer: number;
  confirmedMass: number | null;

  /* prep vessel (volumetric flask or conical flask) */
  solidInVessel: number;
  liquidInVessel: number;
  dissolved: number;
  swirling: number;
  pouring: boolean;
  pipetteVolume: number;
  drawing: boolean;
  aliquotConfirmed: boolean;
  aliquotDispensed: number;

  /* titration flask */
  flaskLiquid: number;
  indicatorDrops: number;
  dropFlash: { id: number; color: string; born: number }[];

  /* burette */
  buretteLevel: number;
  filling: boolean;
  stopcock: FlowMode;
  delivered: number;
  initialReading: number | null;
  finalReading: number | null;
  readingDraft: string;
  endpointConfirmed: boolean;
  overshot: boolean;
  endpointDetected: boolean;

  /* bookkeeping */
  deviations: Deviation[];
  observations: ObservationRow[];
  lastActionId: number;
  timestamp: number;
}

export interface PhaseInfo {
  id: PhaseId;
  step: string;
  title: string;
  instruction: string;
  focus: FocusTarget;
  why: string;
  technique: string;
  safety: string;
  target?: { label: string; value: string; unit: string };
}
