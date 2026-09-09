import { AlertTriangle, Check, Droplet, FlaskConical, RotateCcw, Wind } from "lucide-react";
import { useHold, useLab } from "@/state/LabProvider";
import { buretteReading, currentPhase } from "@/state/labMachine";
import { Badge, Button, HoldButton } from "@/components/ui/primitives";
import type { FlowMode } from "@/types";
import { cn } from "@/utils/cn";

export function PhaseControls() {
  const { exp, state, dispatch } = useLab();
  const phase = currentPhase(state);
  const sim = exp.sim;
  const scoopHold = useHold((on) => dispatch({ type: "SCOOP", on }));
  const dispenseHold = useHold((on) => dispatch({ type: "DISPENSE", on }));
  const pourHold = useHold((on) => dispatch({ type: "POUR", on }));
  const fillHold = useHold((on) => dispatch({ type: "FILL_BURETTE", on }));
  const drawHold = useHold((on) => dispatch({ type: "DRAW", on }));

  /* ── PREPARE ───────────────────────────────────────────────────────*/
  if (phase === "PREPARE") {
    return (
      <Button variant="primary" full size="lg" onClick={() => dispatch({ type: "SELECT_REAGENT" })}>
        <FlaskConical size={16} /> Take the primary standard
      </Button>
    );
  }

  /* ── WEIGH ─────────────────────────────────────────────────────────*/
  if (phase === "WEIGH") {
    const atBottle = state.spatulaAt === "bottle";
    return (
      <div className="space-y-2.5">
        <HoldButton
          aria-label={atBottle ? "Hold to collect powder" : "Hold to release powder onto the paper"}
          holdProps={atBottle ? scoopHold : dispenseHold}
          active={atBottle ? state.scooping : state.dispensing}
          tone={atBottle ? "subtle" : "primary"}
          disabled={atBottle ? state.spatulaLoad >= 0.17 : state.spatulaLoad <= 0.0005}
        >
          {atBottle ? "Hold to collect powder" : "Hold to release onto the paper"}
        </HoldButton>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "SPATULA_TO", at: atBottle ? "paper" : "bottle" })}
          >
            {atBottle ? "To the paper →" : "← To the bottle"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TARE" })}>
            Tare balance
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "TAP_PAPER" })}
            disabled={state.powderOnPaper <= 0.0005}
          >
            Tap off excess
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => dispatch({ type: "CONFIRM_MASS" })}
            disabled={state.powderOnPaper <= 0.0005}
          >
            <Check size={14} /> Confirm mass
          </Button>
        </div>
      </div>
    );
  }

  /* ── TRANSFER ──────────────────────────────────────────────────────*/
  if (phase === "TRANSFER") {
    return (
      <Button
        variant="primary"
        full
        size="lg"
        onClick={() => dispatch({ type: "TRANSFER" })}
        disabled={state.powderOnPaper <= 0.0002}
      >
        Transfer the sample to the flask
      </Button>
    );
  }

  /* ── ADD WATER / MAKE UP ───────────────────────────────────────────*/
  if (phase === "ADD_WATER" || phase === "MAKEUP") {
    const over =
      phase === "MAKEUP" && state.liquidInVessel > (sim.prep.flaskVolume ?? 100) + 0.6;
    return (
      <div className="space-y-2.5">
        <HoldButton
          aria-label="Hold to add solvent"
          holdProps={pourHold}
          active={state.pouring}
          tone="primary"
        >
          Hold to add {sim.prep.solventName ?? "solvent"}
        </HoldButton>
        <Button variant="ghost" size="sm" full onClick={() => dispatch({ type: "SWIRL" })}>
          <Wind size={14} /> Swirl the flask
        </Button>
        {over && (
          <div className="rounded-2xl border border-bad-400/30 bg-bad-400/[0.08] p-3">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-bad-400">
              <AlertTriangle size={13} /> Volume above the graduation mark
            </div>
            <p className="mt-1 text-[12px] leading-snug text-mist-300">
              The solution is now too dilute — the calculated concentration would be wrong.
            </p>
            <Button
              variant="danger"
              size="sm"
              full
              className="mt-2.5"
              onClick={() => dispatch({ type: "RESTART_PREP" })}
            >
              <RotateCcw size={13} /> Discard and re-prepare
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* ── DISSOLVE ──────────────────────────────────────────────────────*/
  if (phase === "DISSOLVE") {
    return (
      <div className="space-y-2.5">
        <Button variant="primary" full size="lg" onClick={() => dispatch({ type: "SWIRL" })}>
          <Wind size={16} /> Swirl the flask
        </Button>
        <p className="text-[12px] leading-snug text-mist-400">
          Swirl repeatedly until no solid remains. {sim.prep.note ?? ""}
        </p>
      </div>
    );
  }

  /* ── ALIQUOT ───────────────────────────────────────────────────────*/
  if (phase === "ALIQUOT") {
    const target = sim.prep.aliquot ?? 25;
    const over = state.pipetteVolume > target + 0.15;
    const ready = Math.abs(state.pipetteVolume - target) <= 0.15 && state.pipetteVolume > 0.2;
    return (
      <div className="space-y-2.5">
        <HoldButton
          aria-label="Hold to draw solution into the pipette"
          holdProps={drawHold}
          active={state.drawing}
          disabled={state.aliquotConfirmed || state.pipetteVolume >= 27.4}
        >
          Hold to draw solution
        </HoldButton>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "ADJUST_PIPETTE" })}
            disabled={!over}
          >
            Adjust to mark
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => dispatch({ type: "CONFIRM_ALIQUOT" })}
            disabled={!ready}
          >
            Confirm volume
          </Button>
        </div>
        <Button
          variant="primary"
          full
          onClick={() => dispatch({ type: "DISPENSE_ALIQUOT" })}
          disabled={!state.aliquotConfirmed}
        >
          Dispense into the conical flask
        </Button>
      </div>
    );
  }

  /* ── INDICATOR ─────────────────────────────────────────────────────*/
  if (phase === "ADD_INDICATOR") {
    return (
      <div className="space-y-2.5">
        <Button variant="primary" full size="lg" onClick={() => dispatch({ type: "ADD_DROP" })}>
          <Droplet size={16} /> Add one drop
        </Button>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <span className="text-[12px] text-mist-400">Drops added</span>
          <span className="num text-[13px] font-semibold text-mist-100">
            {state.indicatorDrops} / {sim.indicator?.drops ?? 2}
          </span>
        </div>
      </div>
    );
  }

  /* ── BURETTE ───────────────────────────────────────────────────────*/
  if (phase === "PREPARE_BURETTE") {
    const reading = buretteReading(state);
    return (
      <div className="space-y-2.5">
        <HoldButton
          aria-label="Hold to fill the burette"
          holdProps={fillHold}
          active={state.filling}
          tone="primary"
          disabled={state.buretteLevel >= 50.6}
        >
          Hold to fill the burette
        </HoldButton>
        <Button
          variant="ghost"
          size="sm"
          full
          onClick={() => dispatch({ type: "DRAIN_BURETTE" })}
          disabled={reading >= -0.05}
        >
          Drain to the 0.00 mL mark
        </Button>
        <p className="text-[12px] leading-snug text-mist-400">
          {reading < -0.05
            ? "The level is above the zero graduation — drain a little titrant."
            : `Current level: ${reading.toFixed(2)} mL`}
        </p>
      </div>
    );
  }

  /* ── READINGS ──────────────────────────────────────────────────────*/
  if (phase === "INITIAL_READING" || phase === "FINAL_READING") {
    return (
      <div className="space-y-2.5">
        <label className="block">
          <span className="label-eyebrow">
            {phase === "INITIAL_READING" ? "Initial burette reading" : "Final burette reading"} (mL)
          </span>
          <input
            inputMode="decimal"
            autoComplete="off"
            value={state.readingDraft}
            onChange={(e) => dispatch({ type: "SET_READING_DRAFT", value: e.target.value })}
            placeholder="0.00"
            aria-label="Burette reading in millilitres"
            className="num mt-1.5 w-full rounded-2xl border border-white/12 bg-ink-850 px-4 py-3 text-2xl font-semibold text-mist-50 outline-none transition focus:border-accent-400/70"
          />
        </label>
        <Button
          variant="primary"
          full
          onClick={() => dispatch({ type: "SUBMIT_READING" })}
          disabled={!state.readingDraft.trim()}
        >
          Record reading
        </Button>
      </div>
    );
  }

  /* ── TITRATION ─────────────────────────────────────────────────────*/
  if (phase === "TITRATION") {
    const modes: { id: FlowMode; label: string; hint: string }[] = [
      { id: "closed", label: "Closed", hint: "stop the flow" },
      { id: "fast", label: "Rapid", hint: "≈0.5 mL/s" },
      { id: "dropwise", label: "Dropwise", hint: "≈0.05 mL/s" },
      { id: "precision", label: "Single drop", hint: "0.05 mL" },
    ];
    return (
      <div className="space-y-2.5">
        {state.overshot ? (
          <div className="rounded-2xl border border-bad-400/30 bg-bad-400/[0.09] p-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-bad-400">
              <AlertTriangle size={14} /> Endpoint overshot
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-mist-300">
              Excess titrant was added after the endpoint, so the titre is too large and the
              calculated result would be too low.
            </p>
            <div className="mt-2.5 space-y-2">
              <Button variant="primary" full onClick={() => dispatch({ type: "REPEAT_TITRATION" })}>
                <RotateCcw size={14} /> Repeat the titration
              </Button>
              <Button variant="ghost" full size="sm" onClick={() => dispatch({ type: "ACCEPT_OVERSHOOT" })}>
                Record the result anyway
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <span className="label-eyebrow">Stopcock — titrant flow</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => dispatch({ type: "SET_STOPCOCK", mode: m.id })}
                    aria-pressed={state.stopcock === m.id}
                    className={cn(
                      "neu min-h-11 rounded-2xl px-3 py-2 text-left transition",
                      state.stopcock === m.id && "neu-on",
                    )}
                  >
                    <span className="block text-[13px] font-semibold text-mist-50">{m.label}</span>
                    <span className="num block text-[10.5px] text-mist-400">{m.hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "SWIRL" })}>
                <Wind size={14} /> Swirl
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => dispatch({ type: "CONFIRM_ENDPOINT" })}
                disabled={!state.endpointDetected}
              >
                <Check size={14} /> Endpoint
              </Button>
            </div>
            {!state.endpointDetected && (
              <Badge tone={state.delivered > 0 ? "info" : "neutral"} className="w-full justify-center">
                {state.delivered.toFixed(2)} mL delivered
              </Badge>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
}
