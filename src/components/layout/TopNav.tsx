import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

export type View = "landing" | "library" | "overview" | "lab" | "learn";

interface NavItem {
  id: View;
  label: string;
}

const NAV: NavItem[] = [
  { id: "landing", label: "Home" },
  { id: "library", label: "Experiments" },
  { id: "learn", label: "Learn" },
];

export function TopNav({
  view,
  onNavigate,
  compact,
}: {
  view: View;
  onNavigate: (v: View) => void;
  compact?: boolean;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-white/[0.07] bg-ink-950/70 backdrop-blur-xl",
        compact && "border-b-0 bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => onNavigate("landing")}
          className="group flex items-center gap-3 text-left"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-accent-400/30 to-accent-600/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <g fill="none" stroke="#cdd8ff" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="7" cy="17" r="2.2" />
                <circle cx="17" cy="17" r="2.2" />
                <circle cx="12" cy="7" r="2.2" />
                <path d="M13.9 8.5 15.6 14.8M10.1 8.5 8.4 14.8M9.2 17h5.6" />
              </g>
            </svg>
          </span>
          <span className="hidden sm:block">
            <span className="block text-[13px] font-semibold leading-tight tracking-tight text-mist-50">
              Virtual Chemistry Laboratory
            </span>
            <span className="block text-[10.5px] font-medium uppercase tracking-[0.14em] text-mist-400">
              Volumetric Analysis
            </span>
          </span>
        </button>

        <nav aria-label="Primary" className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          {NAV.map((item) => {
            const active = item.id === view || (view === "overview" && item.id === "library") || (view === "lab" && item.id === "library");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "min-h-9 rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 sm:px-4",
                  active
                    ? "bg-white/[0.12] text-mist-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                    : "text-mist-400 hover:text-mist-100",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}
