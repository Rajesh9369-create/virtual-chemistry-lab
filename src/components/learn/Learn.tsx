import { Shell } from "@/components/layout/TopNav";
import { Badge, Disclosure, Eyebrow, SectionTitle } from "@/components/ui/primitives";
import { EXPERIMENTS } from "@/data/experiments";

const STANDARDS = [
  { name: "Anhydrous sodium carbonate", formula: "Na₂CO₃", m: "105.99", why: "Stable after drying at 270–300 °C, high molar mass, cheap. Standard for acids." },
  { name: "Potassium hydrogen phthalate", formula: "KHC₈H₄O₄", m: "204.22", why: "Monoprotic, non-hygroscopic, 99.95 % obtainable. Standard for bases." },
  { name: "Oxalic acid dihydrate", formula: "H₂C₂O₄·2H₂O", m: "126.07", why: "Diprotic, standard for permanganate; must be titrated hot." },
  { name: "Arsenic trioxide", formula: "As₂O₃", m: "197.84", why: "Standard for iodine; toxic and requires careful handling." },
  { name: "Calcium carbonate", formula: "CaCO₃", m: "100.09", why: "Standard for EDTA; dissolved in the minimum dilute acid." },
  { name: "Sodium chloride", formula: "NaCl", m: "58.44", why: "Standard for silver nitrate (Mohr method)." },
];

const INDICATORS = [
  { name: "Methyl orange", range: "pH 3.1 – 4.4", change: "yellow → orange-red", use: "Weak base / strong acid titrations (carbonate, borax)" },
  { name: "Methyl red", range: "pH 4.2 – 6.3", change: "yellow → red", use: "Borax, ammonium salts" },
  { name: "Phenolphthalein", range: "pH 8.2 – 10.0", change: "colourless → pink", use: "Weak acid / strong base (KHP, organic acids)" },
  { name: "Starch mucilage", range: "trace I₂", change: "colourless → blue-black", use: "Iodine and iodometric titrations" },
  { name: "Potassium permanganate", range: "self", change: "colourless → permanent pink", use: "Oxalic acid, iron(II), peroxide" },
  { name: "Murexide", range: "pH ≈ 12", change: "pink → violet-blue", use: "Calcium with EDTA" },
  { name: "Eriochrome Black T", range: "pH 10 (buffer)", change: "wine-red → blue", use: "Magnesium and calcium with EDTA" },
  { name: "Potassium chromate", range: "pH 6.5 – 10.5", change: "yellow → brick-red", use: "Chloride by the Mohr method" },
  { name: "Crystal violet", range: "non-aqueous", change: "violet → blue-green", use: "Perchloric acid titrations in acetic acid" },
];

const GLASSWARE = [
  { item: "Burette, 50 mL class A", tol: "±0.05 mL", note: "Read the bottom of the meniscus; estimate to 0.01 mL" },
  { item: "Bulb pipette, 25 mL class A", tol: "±0.03 mL", note: "Drain vertically and touch the tip to the wall for 15 s" },
  { item: "Volumetric flask, 100 mL class A", tol: "±0.08 mL", note: "Make up to the mark, invert 10 times to mix" },
  { item: "Analytical balance", tol: "±0.0001 g", note: "Close the draught shield; wait for the stability indicator" },
];

const ERRORS = [
  { error: "Burette reading taken from above or below", effect: "Titre too large or too small by up to 0.1 mL", fix: "Eye level with the meniscus" },
  { error: "Burette not rinsed with the titrant", effect: "Titrant diluted — titre too large", fix: "Rinse three times with small portions" },
  { error: "Air bubble in the jet", effect: "Volume delivered but not recorded", fix: "Open the stopcock fully to expel it" },
  { error: "Volumetric flask filled above the mark", effect: "Standard solution too dilute — result too high", fix: "Discard and re-prepare" },
  { error: "Weighed portion not transferred quantitatively", effect: "Less analyte titrated — result too low", fix: "Rinse the paper and flask neck" },
  { error: "Endpoint overshot", effect: "Titre too large — result too low", fix: "Add dropwise near the endpoint and repeat" },
  { error: "Flask walls not rinsed during titration", effect: "Unreacted titrant clinging above the liquid", fix: "Wash down the walls with distilled water" },
];

export function Learn() {
  return (
    <div className="relative min-h-screen pb-24">
      <div className="lab-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-[radial-gradient(50%_100%_at_80%_0%,rgba(92,116,244,0.14),transparent_70%)]" />

      <Shell className="pt-10 lg:pt-14">
        <SectionTitle eyebrow="Learning" title="Principles of volumetric analysis" />
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-mist-300">
          Volumetric analysis determines how much of a substance is present by measuring the exact
          volume of a standard solution that reacts with it. The whole method rests on four ideas:
          a pure reference substance, a stoichiometric reaction, a sharp endpoint and accurate
          glassware.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="glass-strong rounded-3xl p-6">
            <Eyebrow>01 · Equivalence point vs endpoint</Eyebrow>
            <p className="mt-3 text-[14px] leading-relaxed text-mist-300">
              The <span className="font-semibold text-mist-100">equivalence point</span> is the
              theoretical moment at which exactly the stoichiometric amount of titrant has been
              added. The <span className="font-semibold text-mist-100">endpoint</span> is what you
              observe — the first permanent colour change of an indicator. A good method chooses an
              indicator whose transition range brackets the equivalence point, so that the
              difference between the two (the titration error) is smaller than the reading error.
            </p>
          </div>
          <div className="glass-strong rounded-3xl p-6">
            <Eyebrow>02 · Why primary standards matter</Eyebrow>
            <p className="mt-3 text-[14px] leading-relaxed text-mist-300">
              A primary standard must be obtainable at high purity, stable in air, non-hygroscopic
              and soluble, and it should have a high molar mass so that weighing errors are small.
              Substances such as sodium hydroxide absorb carbon dioxide and water, so they can never
              be weighed accurately — they must be standardized against a primary standard first.
            </p>
          </div>
        </div>

        {/* standards */}
        <div className="mt-10">
          <SectionTitle eyebrow="Reference substances" title="Common primary standards" className="mb-4" />
          <div className="glass overflow-hidden rounded-3xl">
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-mist-400">
                    <th className="px-4 py-3 font-semibold">Substance</th>
                    <th className="px-4 py-3 font-semibold">Formula</th>
                    <th className="px-4 py-3 font-semibold">M (g·mol⁻¹)</th>
                    <th className="px-4 py-3 font-semibold">Used for</th>
                  </tr>
                </thead>
                <tbody>
                  {STANDARDS.map((s, i) => (
                    <tr key={s.formula} className={i % 2 ? "bg-white/[0.02]" : ""}>
                      <td className="px-4 py-3 font-medium text-mist-100">{s.name}</td>
                      <td className="num px-4 py-3 text-accent-200">{s.formula}</td>
                      <td className="num px-4 py-3 text-mist-300">{s.m}</td>
                      <td className="px-4 py-3 text-mist-300">{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* indicators */}
        <div className="mt-10">
          <SectionTitle eyebrow="Visual detection" title="Choosing the right indicator" className="mb-4" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INDICATORS.map((i) => (
              <div key={i.name} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-mist-50">{i.name}</span>
                  <span className="num text-[11px] text-mist-400">{i.range}</span>
                </div>
                <div className="mt-2 text-[12.5px] text-mist-300">{i.change}</div>
                <div className="mt-2 border-t border-white/[0.07] pt-2 text-[12px] leading-snug text-mist-400">
                  {i.use}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* glassware */}
        <div className="mt-10">
          <SectionTitle eyebrow="Measurement" title="Glassware and tolerances" className="mb-4" />
          <div className="glass overflow-hidden rounded-3xl">
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-mist-400">
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Tolerance</th>
                    <th className="px-4 py-3 font-semibold">Good practice</th>
                  </tr>
                </thead>
                <tbody>
                  {GLASSWARE.map((g, i) => (
                    <tr key={g.item} className={i % 2 ? "bg-white/[0.02]" : ""}>
                      <td className="px-4 py-3 font-medium text-mist-100">{g.item}</td>
                      <td className="num px-4 py-3 text-ok-400">{g.tol}</td>
                      <td className="px-4 py-3 text-mist-300">{g.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* calculations */}
        <div className="mt-10">
          <SectionTitle eyebrow="Working up results" title="The calculation in four moves" className="mb-4" />
          <div className="grid gap-3 lg:grid-cols-2">
            {[
              {
                t: "Moles of standard",
                f: "n = m / M",
                d: "Divide the mass you weighed by the molar mass of the primary standard.",
              },
              {
                t: "Take the aliquot into account",
                f: "n(aliquot) = n(stock) × V(pipette) / V(flask)",
                d: "Only this fraction of what you weighed is actually titrated.",
              },
              {
                t: "Moles of titrant",
                f: "n(titrant) = n(analyte) × r",
                d: "r is the number of moles of titrant that react with one mole of analyte.",
              },
              {
                t: "Concentration or content",
                f: "M = n(titrant) / V(titre in L)",
                d: "For assays, rearrange to give the percentage content of the sample.",
              },
            ].map((c) => (
              <div key={c.t} className="glass-strong rounded-2xl p-5">
                <div className="text-[13.5px] font-semibold text-mist-50">{c.t}</div>
                <div className="num mt-2 rounded-xl border border-white/10 bg-ink-900/70 px-3 py-2 text-[13px] text-accent-200">
                  {c.f}
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-mist-300">{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* errors */}
        <div className="mt-10">
          <SectionTitle eyebrow="Troubleshooting" title="Where the errors come from" className="mb-4" />
          <div className="space-y-2">
            {ERRORS.map((e) => (
              <Disclosure key={e.error} title={e.error}>
                <span className="text-warn-400">Effect on the result:</span> {e.effect}
                <br />
                <span className="text-ok-400">Correction:</span> {e.fix}
              </Disclosure>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="label-eyebrow mr-1">Apply it</span>
          {EXPERIMENTS.slice(0, 4).map((e) => (
            <Badge key={e.id} tone="accent">
              {e.code}
            </Badge>
          ))}
          <span className="text-[12.5px] text-mist-400">
            — every experiment in the library uses the same measurement chain.
          </span>
        </div>
      </Shell>
    </div>
  );
}
