import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BuretteScale } from "@/components/lab/instruments/Burette";
import { GlassDefs } from "@/components/lab/parts";
import { BenchStation } from "@/components/lab/stations/BenchStation";
import { TitrationStation } from "@/components/lab/stations/TitrationStation";
import { WeighingStation } from "@/components/lab/stations/WeighingStation";
import { useLab } from "@/state/LabProvider";
import { buretteReading } from "@/state/labMachine";
import { Button, Eyebrow } from "@/components/ui/primitives";

const BENCH_PHASES = ["ADD_WATER", "DISSOLVE", "MAKEUP", "ALIQUOT", "ADD_INDICATOR"];
const TITRATION_PHASES = ["PREPARE_BURETTE", "INITIAL_READING", "FINAL_READING", "TITRATION"];

export function LabScene() {
  const { state, phase, exp } = useLab();
  const titrantColor = exp.sim.titrant.color;
  const isReading = phase === "INITIAL_READING" || phase === "FINAL_READING";
  const [guide, setGuide] = useState(0);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (!isReading) return;
    const actual = Math.max(0, buretteReading(state));
    setGuide(Math.max(0, Math.min(50, actual + (phase === "INITIAL_READING" ? 0.7 : -0.9))));
    setShowFull(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const station = BENCH_PHASES.includes(phase) ? (
    <BenchStation />
  ) : TITRATION_PHASES.includes(phase) ? (
    <TitrationStation />
  ) : (
    <WeighingStation />
  );

  return (
    <div className="lab-bg relative h-full w-full overflow-hidden rounded-3xl border border-white/[0.08]">
      {/* soft vignette so the glassware always reads clearly */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,255,255,0.045),transparent_45%)]" />

      <AnimatePresence mode="wait" initial={false}>
        {isReading && !showFull ? (
          <motion.div
            key="reader"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-0 grid place-items-center overflow-auto p-4"
          >
            <div className="glass-strong w-full max-w-[420px] rounded-3xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <Eyebrow>Focused burette reading</Eyebrow>
                <span className="num text-[11px] text-mist-400">
                  {phase === "INITIAL_READING" ? "initial" : "final"} reading
                </span>
              </div>
              <svg viewBox="0 0 320 560" className="mx-auto mt-3 w-full max-w-[290px]">
                <GlassDefs />
                <BuretteScale
                  reading={Math.max(0, buretteReading(state))}
                  color={titrantColor}
                  guide={guide}
                  onGuideChange={setGuide}
                />
              </svg>
              <Button variant="ghost" size="sm" full onClick={() => setShowFull(true)} className="mt-3">
                Show the full assembly
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="station"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {station}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


