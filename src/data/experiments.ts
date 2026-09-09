import type { ApparatusItem, Category, CategoryId, Experiment, PhaseId, Reagent, SimConfig } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "acid-base",
    name: "Acid–Base",
    short: "AB",
    blurb: "Neutralisation reactions with pH indicators — the foundation of volumetric analysis.",
    accent: "#5c74f4",
  },
  {
    id: "redox",
    name: "Redox",
    short: "RX",
    blurb: "Electron-transfer titrations: permanganate, iodine and thiosulphate chemistry.",
    accent: "#a865d8",
  },
  {
    id: "complexometric",
    name: "Complexometric",
    short: "CX",
    blurb: "Chelometric titrations of metal ions with EDTA and selective metallochromic indicators.",
    accent: "#35d69a",
  },
  {
    id: "precipitation",
    name: "Precipitation",
    short: "PC",
    blurb: "Argentometric titrations in which the endpoint is signalled by a coloured precipitate.",
    accent: "#f7b03c",
  },
  {
    id: "non-aqueous",
    name: "Non-aqueous",
    short: "NA",
    blurb: "Titrations of weak acids and bases in glacial acetic acid with perchloric acid.",
    accent: "#58a6ff",
  },
];

const ap = (name: string, spec: string): ApparatusItem => ({ name, spec });
const rg = (name: string, role: Reagent["role"], detail: string, formula?: string): Reagent => ({
  name,
  role,
  detail,
  formula,
});

const BASE_APPARATUS: ApparatusItem[] = [
  ap("Analytical balance", "4-figure, ±0.0001 g, with draught shield"),
  ap("Weighing paper / watch glass", "non-absorbent, dust-free"),
  ap("Spatula", "clean, dry stainless steel"),
  ap("Conical flask", "250 mL, borosilicate"),
  ap("Burette", "50 mL, class A, ±0.05 mL"),
  ap("Retort stand & burette clamp", "with white tile"),
  ap("Wash bottle", "distilled water"),
];

const BASE_SAFETY = [
  "Wear safety spectacles and a laboratory coat throughout the procedure.",
  "Handle all acids and bases with care — rinse splashes immediately with plenty of water.",
  "Never pipette by mouth; use a mechanical filler.",
];

interface Definition
  extends Omit<Experiment, "apparatus" | "safety" | "phases" | "available" | "code"> {
  extraApparatus?: ApparatusItem[];
  extraSafety?: string[];
}

function buildPhases(sim: SimConfig): PhaseId[] {
  const dilution = sim.prep.vessel === "volumetric";
  const phases: PhaseId[] = ["PREPARE", "WEIGH", "TRANSFER", "ADD_WATER", "DISSOLVE"];
  if (dilution) phases.push("MAKEUP", "ALIQUOT");
  if (sim.indicator) phases.push("ADD_INDICATOR");
  phases.push(
    "PREPARE_BURETTE",
    "INITIAL_READING",
    "TITRATION",
    "FINAL_READING",
    "CALCULATION",
    "RESULT",
  );
  return phases;
}

function build(def: Definition, code: string): Experiment {
  return {
    ...def,
    code,
    phases: buildPhases(def.sim),
    apparatus: [...BASE_APPARATUS, ...(def.extraApparatus ?? [])],
    safety: [...BASE_SAFETY, ...(def.extraSafety ?? [])],
    available: true,
  };
}

const WATER = "Distilled water";

/* ══════════════════════════════════════════════════════════════════════════
   ACID–BASE
   ══════════════════════════════════════════════════════════════════════════*/

const hclNa2co3 = build(
  {
    id: "hcl-na2co3",
    title: "Standardization of Hydrochloric Acid using Sodium Carbonate",
    category: "acid-base",
    technique: "Acid–base titration · primary standard",
    tagline: "Determine the exact molarity of ~0.1 M HCl against anhydrous sodium carbonate.",
    description:
      "Anhydrous sodium carbonate is dried, accurately weighed and dissolved to prepare a standard stock solution. A measured aliquot is titrated with hydrochloric acid using methyl orange, and the exact molarity of the acid is calculated from the titre.",
    difficulty: "Introductory",
    duration: "25 min",
    principle:
      "Sodium carbonate is a true primary standard: it can be obtained at high purity, is stable on drying, and has a reasonably large molar mass (105.99 g·mol⁻¹) so that weighing errors are small. When an accurately weighed portion is titrated with hydrochloric acid, the reaction proceeds in two stages — first to sodium hydrogen carbonate, then to carbonic acid which decomposes to carbon dioxide and water. The complete neutralisation of one mole of carbonate consumes two moles of acid, and the methyl orange endpoint (pH 3.1–4.4) coincides with the second equivalence point.",
    reaction: ["Na₂CO₃  +  2 HCl  →  2 NaCl  +  H₂O  +  CO₂ ↑"],
    endpoint:
      "First permanent orange-red coloration of methyl orange that persists after swirling (pH ≈ 4.0).",
    reagents: [
      rg("Anhydrous sodium carbonate", "primary standard", "Dried at 270–300 °C and cooled in a desiccator", "Na₂CO₃"),
      rg("Hydrochloric acid", "titrant", "Approximately 0.1 M, of unknown exact concentration", "HCl"),
      rg("Methyl orange", "indicator", "0.1 % w/v aqueous solution, 2–3 drops"),
      rg("Distilled water", "solvent", "Freshly boiled and cooled, carbonate-free"),
    ],
    extraApparatus: [
      ap("Volumetric flask", "100 mL, class A"),
      ap("Bulb pipette", "25 mL, class A, with filler"),
    ],
    procedure: [
      { title: "Dry the primary standard", detail: "Heat anhydrous Na₂CO₃ at 270–300 °C for 1 h and cool in a desiccator." },
      { title: "Weigh the sample", detail: "Accurately weigh about 0.530 g of Na₂CO₃ onto a tared weighing paper." },
      { title: "Prepare the stock solution", detail: "Transfer quantitatively to a 100 mL volumetric flask, dissolve, and make up to the mark." },
      { title: "Take an aliquot", detail: "Pipette 25.0 mL of the standard solution into a conical flask." },
      { title: "Add indicator", detail: "Add 2–3 drops of methyl orange solution." },
      { title: "Fill the burette", detail: "Rinse and fill with HCl; eliminate air from the jet and record the initial reading." },
      { title: "Titrate", detail: "Titrate to the first permanent orange-red coloration, swirling continuously." },
      { title: "Calculate", detail: "Use the mean titre to calculate the exact molarity of the acid." },
    ],
    learning: [
      "Why sodium carbonate is preferred as a primary standard over, for example, sodium hydroxide.",
      "The relationship between the equivalence point and the indicator transition range.",
      "How a dilution factor enters the calculation when an aliquot is taken.",
    ],
    sim: {
      sample: {
        name: "Anhydrous sodium carbonate",
        formula: "Na₂CO₃",
        molarMass: 105.99,
        targetMass: 0.53,
        massTolerance: 0.01,
        truePurity: 0.995,
        powderColor: "#f3f6fa",
      },
      titrant: { name: "Hydrochloric acid", formula: "HCl", nominalMolarity: 0.1, trueMolarity: 0.0988, color: "#dfe9f2" },
      stoichRatio: 2,
      stoichNote: "1 mol Na₂CO₃ ≡ 2 mol HCl",
      prep: { vessel: "volumetric", flaskVolume: 100, dissolveWater: 50, aliquot: 25, solventName: WATER },
      indicator: { name: "Methyl orange", drops: 2, transition: "yellow → orange-red (pH 3.1–4.4)" },
      colors: { initial: "#f2c33d", nearEndpoint: "#f0a83c", endpoint: "#e0662f", overshoot: "#c8391f" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of HCl",
        unit: "mol/L",
        expected: 0.0988,
        expectedLabel: "True molarity of the acid",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "The yellow of methyl orange just changes to a permanent orange-red.",
    },
  },
  "EXP-01",
);

const h2so4Na2co3 = build(
  {
    id: "h2so4-na2co3",
    title: "Standardization of Sulphuric Acid using Sodium Carbonate",
    category: "acid-base",
    technique: "Acid–base titration · primary standard",
    tagline: "Determine the exact molarity of ~0.1 M H₂SO₄ by direct titration of sodium carbonate.",
    description:
      "A small, accurately weighed portion of anhydrous sodium carbonate is dissolved directly in the titration flask and titrated with sulphuric acid using methyl orange. Because the weighed solid is titrated directly, no dilution factor is required.",
    difficulty: "Introductory",
    duration: "20 min",
    principle:
      "Dilute sulphuric acid is a diprotic acid whose exact concentration cannot be established by simple dilution because concentrated acid is hygroscopic and fuming. Sodium carbonate provides a direct reference: one mole of carbonate consumes one mole of sulphuric acid with the liberation of carbon dioxide. Titrating the weighed solid directly in the conical flask removes any uncertainty introduced by volumetric transfer.",
    reaction: ["Na₂CO₃  +  H₂SO₄  →  Na₂SO₄  +  H₂O  +  CO₂ ↑"],
    endpoint: "First permanent orange-red of methyl orange that survives swirling.",
    reagents: [
      rg("Anhydrous sodium carbonate", "primary standard", "Dried and cooled in a desiccator", "Na₂CO₃"),
      rg("Sulphuric acid", "titrant", "Approximately 0.1 M", "H₂SO₄"),
      rg("Methyl orange", "indicator", "0.1 % w/v, 2–3 drops"),
      rg("Distilled water", "solvent", "Carbonate-free"),
    ],
    procedure: [
      { title: "Weigh the standard", detail: "Accurately weigh about 0.265 g of Na₂CO₃." },
      { title: "Transfer", detail: "Transfer completely to a 250 mL conical flask." },
      { title: "Dissolve", detail: "Add about 50 mL of distilled water and swirl until a clear solution is obtained." },
      { title: "Add indicator", detail: "Add 2–3 drops of methyl orange." },
      { title: "Titrate", detail: "Titrate with sulphuric acid to the first permanent orange-red." },
      { title: "Calculate", detail: "Compute the exact molarity of the acid from the titre." },
    ],
    learning: [
      "Why a direct titration of a weighed solid avoids dilution errors.",
      "The 1:1 stoichiometry of carbonate with diprotic sulphuric acid.",
      "Reading a meniscus correctly to ±0.02 mL.",
    ],
    sim: {
      sample: {
        name: "Anhydrous sodium carbonate",
        formula: "Na₂CO₃",
        molarMass: 105.99,
        targetMass: 0.265,
        massTolerance: 0.008,
        truePurity: 0.998,
        powderColor: "#f3f6fa",
      },
      titrant: { name: "Sulphuric acid", formula: "H₂SO₄", nominalMolarity: 0.1, trueMolarity: 0.0992, color: "#dfe9f2" },
      stoichRatio: 1,
      stoichNote: "1 mol Na₂CO₃ ≡ 1 mol H₂SO₄",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER },
      indicator: { name: "Methyl orange", drops: 2, transition: "yellow → orange-red" },
      colors: { initial: "#f2c33d", nearEndpoint: "#f0a83c", endpoint: "#e0662f", overshoot: "#c8391f" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of H₂SO₄",
        unit: "mol/L",
        expected: 0.0992,
        expectedLabel: "True molarity of the acid",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "A permanent orange-red replaces the yellow on swirling.",
    },
  },
  "EXP-02",
);

const boraxAssay = build(
  {
    id: "borax-assay",
    title: "Assay of Borax",
    category: "acid-base",
    technique: "Acid–base assay · methyl red",
    tagline: "Determine the percentage content of sodium tetraborate in a borax sample.",
    description:
      "Borax is a mild alkali that reacts with hydrochloric acid in a 1:2 ratio, liberating boric acid. The weighed sample is dissolved and titrated with standard acid using methyl red; the percentage of Na₂B₄O₇·10H₂O is then calculated.",
    difficulty: "Intermediate",
    duration: "25 min",
    principle:
      "Sodium tetraborate decahydrate behaves as a dibasic base in aqueous solution. Reaction with a strong acid converts the tetraborate ion to boric acid, which is so weak that it does not interfere with the endpoint. Each mole of borax therefore consumes two moles of acid, and the methyl red transition (pH 4.2–6.3) brackets the equivalence point closely.",
    reaction: ["Na₂B₄O₇·10H₂O  +  2 HCl  →  2 NaCl  +  4 H₃BO₃  +  5 H₂O"],
    endpoint: "Sharp change from yellow to orange-red with methyl red.",
    reagents: [
      rg("Borax (sample)", "sample", "Sodium tetraborate decahydrate, previously powdered", "Na₂B₄O₇·10H₂O"),
      rg("Hydrochloric acid", "titrant", "0.1 M, standardized", "HCl"),
      rg("Methyl red", "indicator", "0.1 % ethanolic, 2–3 drops"),
      rg("Distilled water", "solvent", "Recently boiled and cooled"),
    ],
    procedure: [
      { title: "Weigh the sample", detail: "Accurately weigh about 0.475 g of borax." },
      { title: "Dissolve", detail: "Add 50 mL of warm distilled water and swirl until fully dissolved." },
      { title: "Add indicator", detail: "Add 2–3 drops of methyl red." },
      { title: "Titrate", detail: "Titrate with 0.1 M HCl to the first permanent orange-red." },
      { title: "Calculate", detail: "Express the result as % w/w Na₂B₄O₇·10H₂O." },
    ],
    learning: [
      "Why boric acid does not disturb the titration of borax.",
      "Converting a titre into a percentage content.",
      "The influence of hydrate water on molar mass.",
    ],
    sim: {
      sample: {
        name: "Borax",
        formula: "Na₂B₄O₇·10H₂O",
        molarMass: 381.37,
        targetMass: 0.475,
        massTolerance: 0.01,
        truePurity: 0.994,
        powderColor: "#f6f8fb",
      },
      titrant: { name: "Hydrochloric acid", formula: "HCl", nominalMolarity: 0.1, trueMolarity: 0.0995, color: "#dfe9f2" },
      stoichRatio: 2,
      stoichNote: "1 mol borax ≡ 2 mol HCl",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER, note: "Warm water dissolves borax faster — swirl gently." },
      indicator: { name: "Methyl red", drops: 2, transition: "yellow → orange-red (pH 4.2–6.3)" },
      colors: { initial: "#efc94a", nearEndpoint: "#ea9d52", endpoint: "#d94f4f", overshoot: "#b52d3a" },
      calculation: {
        mode: "assay",
        unknown: "Content of Na₂B₄O₇·10H₂O",
        unit: "% w/w",
        expected: 99.4,
        expectedLabel: "Reference assay",
        toleranceHint: "Pharmacopoeial limits are typically 99.0–103.0 %.",
      },
      endpointHint: "The yellow solution turns sharply orange-red.",
    },
  },
  "EXP-03",
);

const naohKhp = build(
  {
    id: "naoh-khp",
    title: "Standardization of Sodium Hydroxide using Potassium Hydrogen Phthalate",
    category: "acid-base",
    technique: "Acid–base titration · primary standard",
    tagline: "Determine the exact molarity of ~0.1 M NaOH against potassium hydrogen phthalate.",
    description:
      "Potassium hydrogen phthalate (KHP) is the classical primary standard for alkali solutions. An accurately weighed portion is titrated with sodium hydroxide using phenolphthalein, and the exact molarity of the base is calculated from the titre.",
    difficulty: "Introductory",
    duration: "22 min",
    principle:
      "Sodium hydroxide absorbs carbon dioxide and water from the atmosphere, so its solutions can never be prepared to an exact concentration directly. Potassium hydrogen phthalate is a monoprotic acid of high molar mass (204.22 g·mol⁻¹), available at 99.95 % purity, non-hygroscopic and stable on drying — the ideal reference. The reaction with hydroxide is 1:1 and the phenolphthalein endpoint (pH 8.2–10.0) is very sharp because the phthalate ion is only very weakly basic.",
    reaction: ["KHC₈H₄O₄  +  NaOH  →  KNaC₈H₄O₄  +  H₂O"],
    endpoint: "First permanent faint pink of phenolphthalein lasting 30 s.",
    reagents: [
      rg("Potassium hydrogen phthalate", "primary standard", "Dried at 120 °C for 2 h", "KHC₈H₄O₄"),
      rg("Sodium hydroxide", "titrant", "Approximately 0.1 M, carbonate-free if possible", "NaOH"),
      rg("Phenolphthalein", "indicator", "1 % ethanolic, 2–3 drops"),
      rg("Distilled water", "solvent", "Boiled to expel dissolved CO₂"),
    ],
    procedure: [
      { title: "Weigh the standard", detail: "Accurately weigh about 0.510 g of KHP." },
      { title: "Transfer and dissolve", detail: "Transfer to a conical flask, add 50 mL water and swirl to dissolve." },
      { title: "Add indicator", detail: "Add 2–3 drops of phenolphthalein." },
      { title: "Titrate", detail: "Titrate with NaOH to the first permanent pale pink." },
      { title: "Calculate", detail: "Compute the exact molarity of the alkali." },
    ],
    learning: [
      "Why NaOH cannot be used as a primary standard.",
      "Choosing an indicator whose transition range contains the equivalence pH.",
      "Recognising a permanent versus a transient endpoint.",
    ],
    sim: {
      sample: {
        name: "Potassium hydrogen phthalate",
        formula: "KHC₈H₄O₄",
        molarMass: 204.22,
        targetMass: 0.51,
        massTolerance: 0.01,
        truePurity: 0.9993,
        powderColor: "#f5f7fa",
      },
      titrant: { name: "Sodium hydroxide", formula: "NaOH", nominalMolarity: 0.1, trueMolarity: 0.09955, color: "#e8eef4" },
      stoichRatio: 1,
      stoichNote: "1 mol KHP ≡ 1 mol NaOH",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER },
      indicator: { name: "Phenolphthalein", drops: 2, transition: "colourless → pink (pH 8.2–10.0)" },
      colors: { initial: "#eef1f5", nearEndpoint: "#f6c9d8", endpoint: "#ec7fae", overshoot: "#d5458b" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of NaOH",
        unit: "mol/L",
        expected: 0.09955,
        expectedLabel: "True molarity of the alkali",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "A pale pink appears where the drop enters and no longer disappears on swirling.",
    },
  },
  "EXP-04",
);

/* ══════════════════════════════════════════════════════════════════════════
   REDOX
   ══════════════════════════════════════════════════════════════════════════*/

const kmno4Oxalic = build(
  {
    id: "kmno4-oxalic",
    title: "Standardization of Potassium Permanganate using Oxalic Acid",
    category: "redox",
    technique: "Redox titration · self-indicator",
    tagline: "Determine the exact molarity of KMnO₄ with oxalic acid in hot acid medium.",
    description:
      "Potassium permanganate is standardized against oxalic acid dihydrate at 60–70 °C in dilute sulphuric acid. The permanganate acts as its own indicator: the endpoint is the first permanent pale pink.",
    difficulty: "Intermediate",
    duration: "28 min",
    principle:
      "In hot acid solution oxalate is oxidised quantitatively to carbon dioxide while permanganate is reduced to the nearly colourless Mn²⁺ ion. Two moles of permanganate consume five moles of oxalate, so 0.4 mol of KMnO₄ corresponds to 1 mol of oxalic acid. The reaction is slow at room temperature but rapid at 60–70 °C; the first excess drop of permanganate imparts a permanent pink colour, so no separate indicator is required.",
    reaction: [
      "2 MnO₄⁻  +  5 C₂O₄²⁻  +  16 H⁺  →  2 Mn²⁺  +  10 CO₂ ↑  +  8 H₂O",
    ],
    endpoint: "First permanent pale pink persisting for 30 s — no indicator is added.",
    reagents: [
      rg("Oxalic acid dihydrate", "primary standard", "Dried at 110 °C, kept in a desiccator", "H₂C₂O₄·2H₂O"),
      rg("Potassium permanganate", "titrant", "Approximately 0.1 M", "KMnO₄"),
      rg("Dilute sulphuric acid", "auxiliary", "1 M, ~10 mL, provides the acidic medium"),
      rg("Distilled water", "solvent", "Warm, 60–70 °C"),
    ],
    procedure: [
      { title: "Weigh the standard", detail: "Accurately weigh about 0.630 g of oxalic acid dihydrate." },
      { title: "Dissolve", detail: "Add 50 mL of warm water and 10 mL of dilute H₂SO₄; warm to 60–70 °C." },
      { title: "Titrate", detail: "Add the first mL of KMnO₄ and wait until it is decolourised before continuing." },
      { title: "Endpoint", detail: "Titrate to the first permanent pale pink." },
      { title: "Calculate", detail: "Compute the exact molarity of the permanganate." },
    ],
    learning: [
      "Balancing the 2:5 electron-transfer stoichiometry.",
      "Why the reaction medium must be acidic and warm.",
      "Self-indication and the autocatalytic start of the reaction.",
    ],
    sim: {
      sample: {
        name: "Oxalic acid dihydrate",
        formula: "H₂C₂O₄·2H₂O",
        molarMass: 126.07,
        targetMass: 0.63,
        massTolerance: 0.012,
        truePurity: 0.998,
        powderColor: "#f4f7fa",
      },
      titrant: { name: "Potassium permanganate", formula: "KMnO₄", nominalMolarity: 0.1, trueMolarity: 0.09945, color: "#6d2a9a" },
      stoichRatio: 0.4,
      stoichNote: "2 mol MnO₄⁻ ≡ 5 mol C₂O₄²⁻",
      prep: {
        vessel: "conical",
        dissolveWater: 50,
        solventName: "Warm distilled water",
        note: "The solution must be warmed to 60–70 °C with dilute H₂SO₄ before titrating.",
      },
      colors: { initial: "#eef2f6", nearEndpoint: "#f2d4e0", endpoint: "#e8a2bb", overshoot: "#8f3f86" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of KMnO₄",
        unit: "mol/L",
        expected: 0.09945,
        expectedLabel: "True molarity of the oxidant",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "A single drop leaves a permanent pale pink in the colourless solution.",
    },
  },
  "EXP-05",
);

const feso4Assay = build(
  {
    id: "feso4-assay",
    title: "Assay of Ferrous Sulphate",
    category: "redox",
    technique: "Redox assay · permanganate",
    tagline: "Determine the content of FeSO₄·7H₂O by titration with potassium permanganate.",
    description:
      "A weighed portion of ferrous sulphate is dissolved in dilute sulphuric acid — the acid prevents hydrolysis and premature aerial oxidation — and titrated with standard permanganate to the first permanent pink.",
    difficulty: "Intermediate",
    duration: "25 min",
    principle:
      "Iron(II) is oxidised to iron(III) by permanganate in acid medium; one mole of MnO₄⁻ accepts five electrons and therefore oxidises five moles of Fe²⁺. Only one fifth of a mole of permanganate is required per mole of ferrous sulphate. Dilute sulphuric acid supplies the hydrogen ions and, unlike hydrochloric acid, is not itself oxidised by permanganate. The pale green of the Fe²⁺ solution is masked as the reaction proceeds, and the endpoint is self-indicated.",
    reaction: ["5 Fe²⁺  +  MnO₄⁻  +  8 H⁺  →  5 Fe³⁺  +  Mn²⁺  +  4 H₂O"],
    endpoint: "First permanent pale pink after the green colour has been discharged.",
    reagents: [
      rg("Ferrous sulphate (sample)", "sample", "FeSO₄·7H₂O, protected from light and air", "FeSO₄·7H₂O"),
      rg("Potassium permanganate", "titrant", "0.02 M, standardized", "KMnO₄"),
      rg("Dilute sulphuric acid", "auxiliary", "1 M, ~10 mL"),
      rg("Distilled water", "solvent", "Freshly boiled and cooled"),
    ],
    procedure: [
      { title: "Weigh the sample", detail: "Accurately weigh about 0.695 g of ferrous sulphate." },
      { title: "Dissolve", detail: "Add 50 mL water and 10 mL dilute H₂SO₄; swirl until clear." },
      { title: "Titrate immediately", detail: "Titrate without delay to avoid aerial oxidation of Fe²⁺." },
      { title: "Endpoint", detail: "Stop at the first permanent pale pink." },
      { title: "Calculate", detail: "Express the content as % w/w FeSO₄·7H₂O." },
    ],
    learning: [
      "The 5:1 electron ratio between Fe²⁺ and MnO₄⁻.",
      "Why sulphuric rather than hydrochloric acid is used.",
      "Sources of error from aerial oxidation during the assay.",
    ],
    sim: {
      sample: {
        name: "Ferrous sulphate",
        formula: "FeSO₄·7H₂O",
        molarMass: 278.01,
        targetMass: 0.695,
        massTolerance: 0.012,
        truePurity: 0.993,
        powderColor: "#c8e3d4",
      },
      titrant: { name: "Potassium permanganate", formula: "KMnO₄", nominalMolarity: 0.02, trueMolarity: 0.01988, color: "#6d2a9a" },
      stoichRatio: 0.2,
      stoichNote: "1 mol MnO₄⁻ ≡ 5 mol Fe²⁺",
      prep: {
        vessel: "conical",
        dissolveWater: 50,
        solventName: WATER,
        note: "Dilute sulphuric acid (10 mL) is added to prevent hydrolysis of Fe²⁺.",
      },
      colors: { initial: "#cfe6d6", nearEndpoint: "#edd8e2", endpoint: "#e2a0b6", overshoot: "#7d3a80" },
      calculation: {
        mode: "assay",
        unknown: "Content of FeSO₄·7H₂O",
        unit: "% w/w",
        expected: 99.3,
        expectedLabel: "Reference assay",
        toleranceHint: "Pharmacopoeial limits are typically 98.0–105.0 %.",
      },
      endpointHint: "The pale green fades to colourless, then one drop gives a permanent pink.",
    },
  },
  "EXP-06",
);

const iodineStd = build(
  {
    id: "iodine-arsenic",
    title: "Standardization of Iodine Solution using Arsenic Trioxide",
    category: "redox",
    technique: "Iodimetric titration · starch indicator",
    tagline: "Determine the exact molarity of iodine solution against arsenic trioxide.",
    description:
      "Arsenic trioxide is dissolved in sodium hydroxide, neutralised and buffered with sodium bicarbonate, then titrated with iodine using starch as indicator. The endpoint is the first permanent blue-black.",
    difficulty: "Advanced",
    duration: "30 min",
    principle:
      "Arsenic trioxide dissolves in alkali to give arsenite, which is oxidised quantitatively to arsenate by iodine. The reaction is reversible and is driven to completion by maintaining the pH near 8 with sodium bicarbonate: in more alkaline solution iodine disproportionates, while in acid the reaction becomes slow. Each mole of arsenic trioxide yields two moles of arsenite, each consuming one mole of iodine. Starch forms an intensely coloured blue adsorption complex with trace iodine, giving a very sharp endpoint.",
    reaction: [
      "As₂O₃  +  2 I₂  +  2 H₂O  →  2 AsO₄³⁻(as H₃AsO₄)  +  4 I⁻  +  4 H⁺",
    ],
    endpoint: "First permanent blue-black with starch, persisting for 30 s.",
    reagents: [
      rg("Arsenic trioxide", "primary standard", "Toxic — dried at 105 °C and cooled in a desiccator", "As₂O₃"),
      rg("Iodine solution", "titrant", "Approximately 0.1 M in potassium iodide", "I₂"),
      rg("Sodium bicarbonate", "auxiliary", "2 g, to buffer the solution at pH ≈ 8"),
      rg("Starch mucilage", "indicator", "Freshly prepared, added near the endpoint"),
      rg("Distilled water", "solvent", "Carbonate-free"),
    ],
    procedure: [
      { title: "Weigh the standard", detail: "Accurately weigh about 0.247 g of arsenic trioxide." },
      { title: "Dissolve", detail: "Dissolve in 50 mL warm water with sodium bicarbonate." },
      { title: "Add starch", detail: "Add starch indicator close to the expected endpoint." },
      { title: "Titrate", detail: "Titrate with iodine to the first permanent blue-black." },
      { title: "Calculate", detail: "Compute the exact molarity of the iodine solution." },
    ],
    learning: [
      "How pH governs the direction of the iodine–arsenite equilibrium.",
      "Why starch must be added late in the titration.",
      "Handling toxic primary standards safely.",
    ],
    sim: {
      sample: {
        name: "Arsenic trioxide",
        formula: "As₂O₃",
        molarMass: 197.84,
        targetMass: 0.2473,
        massTolerance: 0.008,
        truePurity: 0.998,
        powderColor: "#f2f5f9",
      },
      titrant: { name: "Iodine solution", formula: "I₂", nominalMolarity: 0.1, trueMolarity: 0.0996, color: "#a8621c" },
      stoichRatio: 2,
      stoichNote: "1 mol As₂O₃ ≡ 2 mol I₂",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER, note: "Sodium bicarbonate is added to keep the pH near 8." },
      indicator: { name: "Starch mucilage", drops: 2, transition: "colourless → blue-black" },
      colors: { initial: "#eff3f8", nearEndpoint: "#c8d2e6", endpoint: "#2c3f8e", overshoot: "#16204f" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of iodine",
        unit: "mol/L",
        expected: 0.0996,
        expectedLabel: "True molarity of the iodine",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "A single drop produces an intense permanent blue-black.",
    },
  },
  "EXP-07",
);

const cuso4Assay = build(
  {
    id: "cuso4-assay",
    title: "Assay of Copper Sulphate by Iodometry",
    category: "redox",
    technique: "Iodometric assay · displacement",
    tagline: "Determine the CuSO₄·5H₂O content by titrating liberated iodine with thiosulphate.",
    description:
      "Copper(II) oxidises iodide to iodine, precipitating copper(I) iodide. The iodine liberated — exactly one mole per mole of copper — is titrated with standard sodium thiosulphate using starch. The blue-black is discharged at the endpoint.",
    difficulty: "Advanced",
    duration: "32 min",
    principle:
      "This is an indirect (displacement) titration. Excess iodide reduces Cu²⁺ to the insoluble CuI, and the iodine set free is equivalent to the copper present. The liberated iodine is then titrated with standard thiosulphate, which reduces iodine back to iodide forming tetrathionate. Because the stoichiometry is 1:1 throughout, one mole of thiosulphate corresponds to one mole of copper. Starch is added only when the brown iodine colour has faded to a pale straw, otherwise the iodine–starch complex is slow to react.",
    reaction: [
      "2 Cu²⁺  +  4 I⁻  →  2 CuI ↓  +  I₂",
      "I₂  +  2 S₂O₃²⁻  →  2 I⁻  +  S₄O₆²⁻",
    ],
    endpoint: "Disappearance of the blue-black; the suspension remains cream-white.",
    reagents: [
      rg("Copper sulphate (sample)", "sample", "CuSO₄·5H₂O, efflorescent — keep stoppered", "CuSO₄·5H₂O"),
      rg("Sodium thiosulphate", "titrant", "0.1 M, standardized", "Na₂S₂O₃"),
      rg("Potassium iodide", "auxiliary", "≈2 g, dissolved in 10 mL water"),
      rg("Starch mucilage", "indicator", "Added when the brown colour fades"),
      rg("Distilled water", "solvent", "—"),
    ],
    procedure: [
      { title: "Weigh the sample", detail: "Accurately weigh about 0.624 g of copper sulphate." },
      { title: "Dissolve", detail: "Dissolve in 50 mL distilled water." },
      { title: "Add iodide", detail: "Add the potassium iodide solution; iodine is liberated at once." },
      { title: "Titrate", detail: "Titrate the liberated iodine with thiosulphate until pale straw." },
      { title: "Add starch and finish", detail: "Add starch and continue dropwise to the disappearance of the blue." },
      { title: "Calculate", detail: "Express the content as % w/w CuSO₄·5H₂O." },
    ],
    learning: [
      "Indirect titration: measuring a metal through a liberated reagent.",
      "Why starch is added late in iodometric work.",
      "The 1:1 relationship between thiosulphate and copper.",
    ],
    sim: {
      sample: {
        name: "Copper sulphate",
        formula: "CuSO₄·5H₂O",
        molarMass: 249.68,
        targetMass: 0.6242,
        massTolerance: 0.012,
        truePurity: 0.992,
        powderColor: "#3f8fd8",
      },
      titrant: { name: "Sodium thiosulphate", formula: "Na₂S₂O₃", nominalMolarity: 0.1, trueMolarity: 0.09915, color: "#e6edf4" },
      stoichRatio: 1,
      stoichNote: "1 mol Cu²⁺ ≡ 1 mol I₂ ≡ 2 mol S₂O₃²⁻",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER, note: "Potassium iodide is added to liberate iodine before titrating." },
      indicator: { name: "Starch mucilage", drops: 2, transition: "blue-black → cream" },
      colors: { initial: "#8a5220", nearEndpoint: "#b98b52", endpoint: "#ece2cd", overshoot: "#c9d0d8" },
      calculation: {
        mode: "assay",
        unknown: "Content of CuSO₄·5H₂O",
        unit: "% w/w",
        expected: 99.2,
        expectedLabel: "Reference assay",
        toleranceHint: "Pharmacopoeial limits are typically 99.0–104.5 %.",
      },
      endpointHint: "The blue-black is just discharged, leaving a cream suspension.",
    },
  },
  "EXP-08",
);

/* ══════════════════════════════════════════════════════════════════════════
   COMPLEXOMETRIC
   ══════════════════════════════════════════════════════════════════════════*/

const edtaStd = build(
  {
    id: "edta-std",
    title: "Standardization of EDTA using Calcium Carbonate",
    category: "complexometric",
    technique: "Complexometric titration · murexide",
    tagline: "Determine the exact molarity of disodium EDTA against a calcium standard.",
    description:
      "A stock calcium solution is prepared from an accurately weighed portion of calcium carbonate, and an aliquot is titrated with EDTA at pH 12 using murexide. The metal–indicator complex is released at the endpoint, changing the colour from pink to violet-blue.",
    difficulty: "Intermediate",
    duration: "30 min",
    principle:
      "Ethylenediaminetetraacetic acid forms a very stable 1:1 chelate with calcium. Because the free acid is almost insoluble, the disodium salt is used; its solutions nevertheless require standardization since the dihydrate is slightly efflorescent. Murexide forms a pink complex with calcium that is less stable than the EDTA chelate, so as EDTA is added the calcium is withdrawn from the indicator and the free indicator colour — violet-blue — appears at the endpoint. The pH is held at about 12 with sodium hydroxide so that magnesium, if present, is precipitated as hydroxide and does not interfere.",
    reaction: ["Ca²⁺  +  Na₂H₂Y  →  CaY²⁻  +  2 Na⁺  +  2 H⁺"],
    endpoint: "Pink to violet-blue with murexide at pH ≈ 12.",
    reagents: [
      rg("Calcium carbonate", "primary standard", "Dried at 110 °C, high purity", "CaCO₃"),
      rg("Disodium EDTA", "titrant", "Approximately 0.1 M", "Na₂H₂Y·2H₂O"),
      rg("Murexide", "indicator", "0.1 % — solid mixture with NaCl, a few mg"),
      rg("Sodium hydroxide", "auxiliary", "1 M, 2 mL, to give pH ≈ 12"),
      rg("Dilute hydrochloric acid", "auxiliary", "Minimum volume to dissolve the carbonate"),
    ],
    procedure: [
      { title: "Weigh the standard", detail: "Accurately weigh about 1.001 g of calcium carbonate." },
      { title: "Prepare the stock", detail: "Dissolve in the minimum dilute HCl, then make up to 100 mL." },
      { title: "Take an aliquot", detail: "Pipette 25.0 mL into a conical flask and add NaOH to pH 12." },
      { title: "Add indicator", detail: "Add murexide indicator — a pink colour develops." },
      { title: "Titrate", detail: "Titrate with EDTA to the violet-blue endpoint." },
      { title: "Calculate", detail: "Compute the exact molarity of the EDTA." },
    ],
    learning: [
      "The 1:1 chelometry of EDTA regardless of metal charge.",
      "How a metallochromic indicator works.",
      "Why pH control is essential in complexometric titrations.",
    ],
    sim: {
      sample: {
        name: "Calcium carbonate",
        formula: "CaCO₃",
        molarMass: 100.09,
        targetMass: 1.001,
        massTolerance: 0.02,
        truePurity: 0.999,
        powderColor: "#f6f8fa",
      },
      titrant: { name: "Disodium EDTA", formula: "Na₂H₂Y", nominalMolarity: 0.1, trueMolarity: 0.09925, color: "#e4ecf4" },
      stoichRatio: 1,
      stoichNote: "1 mol Ca²⁺ ≡ 1 mol EDTA",
      prep: {
        vessel: "volumetric",
        flaskVolume: 100,
        dissolveWater: 40,
        aliquot: 25,
        solventName: "Dilute hydrochloric acid (minimum) then water",
        note: "The carbonate is dissolved in the minimum of dilute HCl before making up.",
      },
      indicator: { name: "Murexide", drops: 2, transition: "pink → violet-blue (pH 12)" },
      colors: { initial: "#cf6a92", nearEndpoint: "#9a6fb0", endpoint: "#6a6ee0", overshoot: "#4a52c8" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of EDTA",
        unit: "mol/L",
        expected: 0.09925,
        expectedLabel: "True molarity of the EDTA",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "The pink of the calcium–murexide complex becomes violet-blue.",
    },
  },
  "EXP-09",
);

const calciumAssay = build(
  {
    id: "calcium-assay",
    title: "Assay of a Calcium-containing Sample",
    category: "complexometric",
    technique: "Complexometric assay · back-titration free",
    tagline: "Determine the calcium content of a sample by direct EDTA titration.",
    description:
      "A weighed portion of a calcium salt is dissolved and titrated directly with standard EDTA at pH 12 using murexide as metallochromic indicator. The result is expressed as percentage content of the calcium salt.",
    difficulty: "Intermediate",
    duration: "25 min",
    principle:
      "Direct complexometric titration is the method of choice for calcium salts because the EDTA chelate is far more stable than the calcium–indicator complex, giving a clean, rapid endpoint. Working at pH 12 with sodium hydroxide both ensures complete chelation and masks magnesium. One mole of EDTA corresponds to one mole of calcium, so the titre converts directly into the calcium content of the sample.",
    reaction: ["Ca²⁺  +  H₂Y²⁻  →  CaY²⁻  +  2 H⁺"],
    endpoint: "Pink to violet-blue with murexide.",
    reagents: [
      rg("Calcium lactate (sample)", "sample", "Calcium lactate pentahydrate, dried sample", "C₆H₁₀CaO₆·5H₂O"),
      rg("Disodium EDTA", "titrant", "0.05 M, standardized", "Na₂H₂Y"),
      rg("Murexide", "indicator", "Solid mixture with NaCl"),
      rg("Sodium hydroxide", "auxiliary", "1 M, 2 mL, pH ≈ 12"),
      rg("Distilled water", "solvent", "—"),
    ],
    procedure: [
      { title: "Weigh the sample", detail: "Accurately weigh about 0.386 g of the calcium sample." },
      { title: "Dissolve", detail: "Dissolve in 50 mL of distilled water with gentle swirling." },
      { title: "Adjust pH", detail: "Add sodium hydroxide solution to pH ≈ 12." },
      { title: "Add indicator", detail: "Add murexide — a pink colour develops." },
      { title: "Titrate", detail: "Titrate with EDTA to the violet-blue endpoint." },
      { title: "Calculate", detail: "Express the result as % w/w calcium lactate." },
    ],
    learning: [
      "Direct complexometric assay of a metal salt.",
      "Masking interfering metals by pH adjustment.",
      "Converting a titre into a percentage content.",
    ],
    sim: {
      sample: {
        name: "Calcium lactate pentahydrate",
        formula: "C₆H₁₀CaO₆·5H₂O",
        molarMass: 308.3,
        targetMass: 0.3855,
        massTolerance: 0.008,
        truePurity: 0.9915,
        powderColor: "#f5f7f9",
      },
      titrant: { name: "Disodium EDTA", formula: "Na₂H₂Y", nominalMolarity: 0.05, trueMolarity: 0.04962, color: "#e4ecf4" },
      stoichRatio: 1,
      stoichNote: "1 mol Ca²⁺ ≡ 1 mol EDTA",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER, note: "Add 2 mL of 1 M NaOH to bring the solution to pH ≈ 12." },
      indicator: { name: "Murexide", drops: 2, transition: "pink → violet-blue" },
      colors: { initial: "#cf6a92", nearEndpoint: "#9a6fb0", endpoint: "#6a6ee0", overshoot: "#4a52c8" },
      calculation: {
        mode: "assay",
        unknown: "Content of calcium lactate",
        unit: "% w/w",
        expected: 99.15,
        expectedLabel: "Reference assay",
        toleranceHint: "Typical acceptance limits are 98.0–102.0 %.",
      },
      endpointHint: "The pink changes to a clear violet-blue.",
    },
  },
  "EXP-10",
);

/* ══════════════════════════════════════════════════════════════════════════
   PRECIPITATION
   ══════════════════════════════════════════════════════════════════════════*/

const agno3Std = build(
  {
    id: "agno3-std",
    title: "Standardization of Silver Nitrate using Sodium Chloride",
    category: "precipitation",
    technique: "Argentometric titration · Mohr method",
    tagline: "Determine the exact molarity of AgNO₃ by the Mohr endpoint with potassium chromate.",
    description:
      "Sodium chloride, a primary standard, is titrated with silver nitrate in neutral solution. Silver chloride precipitates first; once all chloride has been consumed, silver chromate forms and the suspension turns brick-red.",
    difficulty: "Intermediate",
    duration: "24 min",
    principle:
      "Silver nitrate is a secondary standard: it is slightly hygroscopic and photolabile, so its solutions must be standardized. In the Mohr method, chloride is precipitated as white silver chloride while a small amount of chromate acts as the indicator. Silver chromate is more soluble than silver chloride, so it only begins to precipitate when the chloride ion concentration has fallen virtually to zero. The first excess of silver therefore produces the red-brown Ag₂CrO₄ that signals the endpoint. The pH must be between 6.5 and 10.5: in acid the chromate converts to dichromate and the endpoint is delayed, in alkali silver oxide precipitates.",
    reaction: [
      "Ag⁺  +  Cl⁻  →  AgCl ↓  (white)",
      "2 Ag⁺  +  CrO₄²⁻  →  Ag₂CrO₄ ↓  (brick-red)",
    ],
    endpoint: "First permanent brick-red tinge over the white precipitate.",
    reagents: [
      rg("Sodium chloride", "primary standard", "Dried at 110 °C to constant weight", "NaCl"),
      rg("Silver nitrate", "titrant", "Approximately 0.1 M, stored in an amber bottle", "AgNO₃"),
      rg("Potassium chromate", "indicator", "5 % w/v solution, 1 mL"),
      rg("Distilled water", "solvent", "—"),
    ],
    procedure: [
      { title: "Weigh the standard", detail: "Accurately weigh about 0.146 g of sodium chloride." },
      { title: "Dissolve", detail: "Dissolve in 50 mL of distilled water." },
      { title: "Add indicator", detail: "Add 1 mL of potassium chromate solution — a clear yellow." },
      { title: "Titrate", detail: "Titrate with silver nitrate, swirling constantly." },
      { title: "Endpoint", detail: "Stop at the first permanent brick-red tinge." },
      { title: "Calculate", detail: "Compute the exact molarity of the silver nitrate." },
    ],
    learning: [
      "Fractional precipitation and why the indicator response is delayed.",
      "The narrow pH window required by the Mohr method.",
      "Photosensitivity of silver salts and how to store them.",
    ],
    sim: {
      sample: {
        name: "Sodium chloride",
        formula: "NaCl",
        molarMass: 58.44,
        targetMass: 0.1461,
        massTolerance: 0.005,
        truePurity: 0.9995,
        powderColor: "#f7f9fb",
      },
      titrant: { name: "Silver nitrate", formula: "AgNO₃", nominalMolarity: 0.1, trueMolarity: 0.09925, color: "#e9eef4" },
      stoichRatio: 1,
      stoichNote: "1 mol Cl⁻ ≡ 1 mol Ag⁺",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER },
      indicator: { name: "Potassium chromate", drops: 3, transition: "yellow → brick-red" },
      colors: { initial: "#e8d24f", nearEndpoint: "#dda23f", endpoint: "#b6512c", overshoot: "#8d3a20" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of AgNO₃",
        unit: "mol/L",
        expected: 0.09925,
        expectedLabel: "True molarity of the silver nitrate",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "A brick-red tinge appears in the yellow suspension.",
    },
  },
  "EXP-11",
);

const chlorideAssay = build(
  {
    id: "chloride-assay",
    title: "Assay of a Chloride-containing Sample",
    category: "precipitation",
    technique: "Argentometric assay · Mohr method",
    tagline: "Determine the chloride content of a sample by Mohr titration.",
    description:
      "A weighed portion of a chloride sample is dissolved and titrated with standardized silver nitrate using potassium chromate as indicator. The result is calculated as percentage chloride content.",
    difficulty: "Intermediate",
    duration: "24 min",
    principle:
      "The Mohr method quantifies chloride by precipitating it as silver chloride and detecting the endpoint through the subsequent formation of red-brown silver chromate. Since one mole of silver nitrate reacts with one mole of chloride, the titre gives the chloride content directly. The titration must be performed in neutral medium with vigorous swirling so that the silver chloride coagulates and the chromate colour is not occluded.",
    reaction: ["Ag⁺  +  Cl⁻  →  AgCl ↓"],
    endpoint: "First permanent brick-red tinge with potassium chromate.",
    reagents: [
      rg("Chloride sample", "sample", "Powdered, dried at 110 °C", "NaCl (matrix)"),
      rg("Silver nitrate", "titrant", "0.1 M, standardized", "AgNO₃"),
      rg("Potassium chromate", "indicator", "5 % w/v, 1 mL"),
      rg("Distilled water", "solvent", "—"),
    ],
    procedure: [
      { title: "Weigh the sample", detail: "Accurately weigh about 0.146 g of the chloride sample." },
      { title: "Dissolve", detail: "Dissolve in 50 mL of distilled water." },
      { title: "Add indicator", detail: "Add 1 mL of potassium chromate." },
      { title: "Titrate", detail: "Titrate with standard silver nitrate to the brick-red endpoint." },
      { title: "Calculate", detail: "Express the result as % w/w chloride content." },
    ],
    learning: [
      "Applying a standardization method to a real assay.",
      "Swirling technique to avoid occluded indicator.",
      "Reliability of the Mohr endpoint in neutral medium.",
    ],
    sim: {
      sample: {
        name: "Sodium chloride sample",
        formula: "NaCl",
        molarMass: 58.44,
        targetMass: 0.1461,
        massTolerance: 0.005,
        truePurity: 0.994,
        powderColor: "#f7f9fb",
      },
      titrant: { name: "Silver nitrate", formula: "AgNO₃", nominalMolarity: 0.1, trueMolarity: 0.09935, color: "#e9eef4" },
      stoichRatio: 1,
      stoichNote: "1 mol Cl⁻ ≡ 1 mol Ag⁺",
      prep: { vessel: "conical", dissolveWater: 50, solventName: WATER },
      indicator: { name: "Potassium chromate", drops: 3, transition: "yellow → brick-red" },
      colors: { initial: "#e8d24f", nearEndpoint: "#dda23f", endpoint: "#b6512c", overshoot: "#8d3a20" },
      calculation: {
        mode: "assay",
        unknown: "Chloride content of the sample",
        unit: "% w/w",
        expected: 99.4,
        expectedLabel: "Reference assay",
        toleranceHint: "Typical acceptance limits are 98.0–100.5 %.",
      },
      endpointHint: "A brick-red tinge appears in the yellow suspension.",
    },
  },
  "EXP-12",
);

/* ══════════════════════════════════════════════════════════════════════════
   NON-AQUEOUS
   ══════════════════════════════════════════════════════════════════════════*/

const perchloricStd = build(
  {
    id: "perchloric-std",
    title: "Standardization of Perchloric Acid using Potassium Hydrogen Phthalate",
    category: "non-aqueous",
    technique: "Non-aqueous titration · crystal violet",
    tagline: "Standardize 0.1 M HClO₄ in glacial acetic acid against KHP.",
    description:
      "In glacial acetic acid, perchloric acid behaves as a very strong acid and can titrate very weak bases. The solution is standardized with potassium hydrogen phthalate using crystal violet, which changes from violet through blue to a blue-green endpoint.",
    difficulty: "Advanced",
    duration: "28 min",
    principle:
      "Water, being both a weak acid and a weak base, levels the strengths of acids and bases dissolved in it; in the amphiprotic solvent glacial acetic acid, differences in strength are restored. Perchloric acid becomes a very strong acid and can titrate bases that are far too weak to give a usable endpoint in water. Potassium hydrogen phthalate, though a weak acid in water, acts as a weak base towards perchloric acid in acetic acid and is an excellent primary standard for this titration. Crystal violet is the usual indicator, passing from violet through blue to blue-green at the endpoint.",
    reaction: ["KHC₈H₄O₄  +  HClO₄  →  KClO₄  +  H₂C₈H₄O₄"],
    endpoint: "Violet → blue → blue-green with crystal violet (in acetic acid).",
    reagents: [
      rg("Potassium hydrogen phthalate", "primary standard", "Dried at 120 °C for 2 h", "KHC₈H₄O₄"),
      rg("Perchloric acid", "titrant", "0.1 M in glacial acetic acid", "HClO₄"),
      rg("Glacial acetic acid", "solvent", "Anhydrous"),
      rg("Acetic anhydride", "auxiliary", "Small volume to ensure an anhydrous medium"),
      rg("Crystal violet", "indicator", "0.5 % in glacial acetic acid, 2 drops"),
    ],
    procedure: [
      { title: "Weigh the standard", detail: "Accurately weigh about 0.511 g of KHP." },
      { title: "Dissolve", detail: "Dissolve in 50 mL of warm glacial acetic acid." },
      { title: "Add indicator", detail: "Add 2 drops of crystal violet — a violet solution." },
      { title: "Titrate", detail: "Titrate with perchloric acid to a blue-green endpoint." },
      { title: "Blank correction", detail: "Repeat with the solvent alone and subtract the blank." },
      { title: "Calculate", detail: "Compute the exact molarity of the perchloric acid." },
    ],
    learning: [
      "Levelling and differentiating effects of solvents.",
      "Why very weak bases require non-aqueous media.",
      "Blank correction in non-aqueous titration.",
    ],
    sim: {
      sample: {
        name: "Potassium hydrogen phthalate",
        formula: "KHC₈H₄O₄",
        molarMass: 204.22,
        targetMass: 0.5106,
        massTolerance: 0.01,
        truePurity: 0.999,
        powderColor: "#f5f7fa",
      },
      titrant: { name: "Perchloric acid", formula: "HClO₄", nominalMolarity: 0.1, trueMolarity: 0.09945, color: "#e6e0f0" },
      stoichRatio: 1,
      stoichNote: "1 mol KHP ≡ 1 mol HClO₄",
      prep: {
        vessel: "conical",
        dissolveWater: 50,
        solventName: "Glacial acetic acid",
        note: "The medium must be anhydrous — acetic anhydride is added to remove water.",
      },
      indicator: { name: "Crystal violet", drops: 2, transition: "violet → blue-green" },
      colors: { initial: "#7d54c8", nearEndpoint: "#5f79b8", endpoint: "#2f9e7d", overshoot: "#d3bd46" },
      calculation: {
        mode: "standardize",
        unknown: "Exact molarity of HClO₄",
        unit: "mol/L",
        expected: 0.09945,
        expectedLabel: "True molarity of the perchloric acid",
        toleranceHint: "Within ±1 % of the true value is considered a good result.",
      },
      endpointHint: "Violet passes through blue to a clear blue-green.",
    },
  },
  "EXP-13",
);

const sodiumBenzoateAssay = build(
  {
    id: "benzoate-assay",
    title: "Assay of Sodium Benzoate (Non-aqueous)",
    category: "non-aqueous",
    technique: "Non-aqueous assay · crystal violet",
    tagline: "Determine the sodium benzoate content by titration with perchloric acid.",
    description:
      "Sodium benzoate, the salt of a very weak carboxylic acid, cannot be titrated successfully in water. Dissolved in glacial acetic acid and titrated with standard perchloric acid using crystal violet, it gives a sharp, stoichiometric endpoint.",
    difficulty: "Advanced",
    duration: "26 min",
    principle:
      "In water the benzoate ion is too weak a base for a satisfactory indicator endpoint. Glacial acetic acid, a weak protogenic solvent, differentiates basicity: benzoate becomes a measurably strong base and reacts quantitatively with perchloric acid. The sodium chloride formed is insoluble and precipitates, which helps to drive the reaction to completion. Crystal violet provides the visual endpoint, changing from violet through blue to blue-green. A solvent blank must be run because glacial acetic acid itself consumes a small volume of titrant.",
    reaction: ["C₆H₅COONa  +  HClO₄  →  C₆H₅COOH  +  NaClO₄"],
    endpoint: "Violet → blue → blue-green with crystal violet.",
    reagents: [
      rg("Sodium benzoate (sample)", "sample", "Dried at 105 °C for 3 h", "C₆H₅COONa"),
      rg("Perchloric acid", "titrant", "0.1 M in glacial acetic acid, standardized", "HClO₄"),
      rg("Glacial acetic acid", "solvent", "Anhydrous"),
      rg("Crystal violet", "indicator", "0.5 % solution, 2 drops"),
    ],
    procedure: [
      { title: "Weigh the sample", detail: "Accurately weigh about 0.360 g of sodium benzoate." },
      { title: "Dissolve", detail: "Dissolve in 50 mL of glacial acetic acid, warming gently." },
      { title: "Add indicator", detail: "Add 2 drops of crystal violet." },
      { title: "Titrate", detail: "Titrate with perchloric acid to a blue-green endpoint." },
      { title: "Calculate", detail: "Express the content as % w/w sodium benzoate." },
    ],
    learning: [
      "Why salts of weak acids need non-aqueous titration.",
      "The role of the solvent in sharpening an endpoint.",
      "Performing and applying a blank correction.",
    ],
    sim: {
      sample: {
        name: "Sodium benzoate",
        formula: "C₆H₅COONa",
        molarMass: 144.11,
        targetMass: 0.3603,
        massTolerance: 0.008,
        truePurity: 0.992,
        powderColor: "#f6f8fa",
      },
      titrant: { name: "Perchloric acid", formula: "HClO₄", nominalMolarity: 0.1, trueMolarity: 0.09888, color: "#e6e0f0" },
      stoichRatio: 1,
      stoichNote: "1 mol sodium benzoate ≡ 1 mol HClO₄",
      prep: {
        vessel: "conical",
        dissolveWater: 50,
        solventName: "Glacial acetic acid",
        note: "Glacial acetic acid is used instead of water — the medium must be anhydrous.",
      },
      indicator: { name: "Crystal violet", drops: 2, transition: "violet → blue-green" },
      colors: { initial: "#7d54c8", nearEndpoint: "#5f79b8", endpoint: "#2f9e7d", overshoot: "#d3bd46" },
      calculation: {
        mode: "assay",
        unknown: "Content of sodium benzoate",
        unit: "% w/w",
        expected: 99.2,
        expectedLabel: "Reference assay",
        toleranceHint: "Pharmacopoeial limits are typically 99.0–100.5 %.",
      },
      endpointHint: "The violet solution passes through blue to blue-green.",
    },
  },
  "EXP-14",
);

export const EXPERIMENTS: Experiment[] = [
  hclNa2co3,
  h2so4Na2co3,
  boraxAssay,
  naohKhp,
  kmno4Oxalic,
  feso4Assay,
  iodineStd,
  cuso4Assay,
  edtaStd,
  calciumAssay,
  agno3Std,
  chlorideAssay,
  perchloricStd,
  sodiumBenzoateAssay,
];

export const FLAGSHIP_ID = "hcl-na2co3";

export function getExperiment(id: string | null | undefined): Experiment {
  return EXPERIMENTS.find((e) => e.id === id) ?? EXPERIMENTS[0];
}

export function byCategory(id: CategoryId): Experiment[] {
  return EXPERIMENTS.filter((e) => e.category === id);
}
