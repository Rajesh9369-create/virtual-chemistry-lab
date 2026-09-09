import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ExperimentOverview } from "@/components/overview/ExperimentOverview";
import { Landing } from "@/components/landing/Landing";
import { Library } from "@/components/library/Library";
import { Learn } from "@/components/learn/Learn";
import { TopNav, type View } from "@/components/layout/TopNav";
import { VirtualLab } from "@/components/lab/VirtualLab";
import { EXPERIMENTS, FLAGSHIP_ID, getExperiment } from "@/data/experiments";
import { LabProvider } from "@/state/LabProvider";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [experimentId, setExperimentId] = useState<string>(FLAGSHIP_ID);
  const [labKey, setLabKey] = useState(0);

  const experiment = getExperiment(experimentId);

  const openExperiment = useCallback((id: string) => {
    setExperimentId(id);
    setView("overview");
    window.scrollTo({ top: 0 });
  }, []);

  const navigate = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const beginExperiment = useCallback(() => {
    setLabKey((k) => k + 1);
    setView("lab");
    window.scrollTo({ top: 0 });
  }, []);

  const nextExperiment = useCallback(() => {
    const i = EXPERIMENTS.findIndex((e) => e.id === experimentId);
    const next = EXPERIMENTS[(i + 1) % EXPERIMENTS.length];
    setExperimentId(next.id);
    setView("overview");
    window.scrollTo({ top: 0 });
  }, [experimentId]);

  useEffect(() => {
    document.title =
      view === "lab"
        ? `${experiment.code} — Virtual Chemistry Laboratory`
        : "Virtual Chemistry Laboratory — Volumetric Analysis";
  }, [view, experiment.code]);

  const showNav = view !== "lab";

  return (
    <div className="min-h-screen bg-ink-950">
      {showNav && <TopNav view={view} onNavigate={navigate} />}

      <AnimatePresence mode="wait">
        <motion.main
          key={view === "lab" ? `lab-${labKey}` : view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 0.8, 0.28, 1] }}
        >
          {view === "landing" && <Landing onNavigate={navigate} onStart={openExperiment} />}
          {view === "library" && <Library onOpen={openExperiment} onNavigate={navigate} />}
          {view === "learn" && <Learn />}
          {view === "overview" && (
            <ExperimentOverview
              exp={experiment}
              onBegin={beginExperiment}
              onBack={() => navigate("library")}
              onNavigate={navigate}
            />
          )}
          {view === "lab" && (
            <LabProvider key={labKey} experimentId={experimentId}>
              <VirtualLab
                onExit={() => navigate("library")}
                onOverview={() => setView("overview")}
                onNextExperiment={nextExperiment}
              />
            </LabProvider>
          )}
        </motion.main>
      </AnimatePresence>

      {showNav && (
        <footer className="border-t border-white/[0.06] px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 text-[11.5px] text-mist-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Virtual Chemistry Laboratory · interactive volumetric analysis for pharmaceutical and
              chemical education
            </span>
            <span className="num">
              {EXPERIMENTS.length} experiments · 5 techniques · simulated at class A tolerance
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}
