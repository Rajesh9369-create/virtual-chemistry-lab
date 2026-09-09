import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import { CalculationPanel } from "@/components/calculation/CalculationPanel";
import { LabScene } from "@/components/lab/LabScene";
import { Notebook } from "@/components/notebook/Notebook";
import { ResultScreen } from "@/components/result/ResultScreen";
import { useLab } from "@/state/LabProvider";
import { PHASE_LABEL, phaseInfo } from "@/state/labMachine";
import { Badge, Button } from "@/components/ui/primitives";

export function VirtualLab({
  onExit,
  onOverview,
  onNextExperiment,
}: {
  onExit: () => void;
  onOverview: () => void;
  onNextExperiment: () => void;
}) {
  const { exp, state, phase } = useLab();
  const info = phaseInfo(exp, phase);
  const progress = (state.index / (state.phases.length - 1)) * 100;

  if (phase === "RESULT") {
    return (
      <div className="p-3 sm:p-5">
        <ResultScreen onExit={onExit} onNext={onNextExperiment} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── laboratory header ────────────────────────────────────────*/}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onOverview} className="shrink-0 px-2">
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Overview</span>
            </Button>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="num rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-mist-300">
                  {exp.code}
                </span>
                <span className="truncate text-[13px] font-semibold text-mist-50">{exp.title}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="label-eyebrow">
                  {info.step} · {PHASE_LABEL[phase]}
                </span>
                <span className="num text-[10px] text-mist-500">
                  {state.index + 1}/{state.phases.length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {state.deviations.length > 0 && (
              <Badge tone="warn" className="hidden sm:inline-flex">
                {state.deviations.length} deviation{state.deviations.length > 1 ? "s" : ""}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onExit} className="px-2.5">
              <Layers size={15} />
              <span className="hidden sm:inline">Library</span>
            </Button>
          </div>
        </div>
        <div className="h-[3px] w-full bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-accent-400 to-ok-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ── workspace ────────────────────────────────────────────────*/}
      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-3 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-10">
        <div className="order-1 h-[54vh] min-h-[320px] lg:order-none lg:h-[calc(100vh-11.5rem)]">
          {phase === "CALCULATION" ? <CalculationPanel /> : <LabScene />}
        </div>
        <div className="order-2 lg:order-none lg:h-[calc(100vh-11.5rem)]">
          <Notebook />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1500px] items-center gap-2 px-4 pb-6 text-[11.5px] text-mist-500 sm:px-6 lg:px-10">
        <BookOpen size={13} />
        All glassware is simulated at class A tolerance. Values are calculated from the measurements
        you record in this session.
      </div>
    </div>
  );
}
