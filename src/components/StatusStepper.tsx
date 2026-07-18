import { Check, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { OrderStatus } from "@/lib/types";

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

function stageIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return STAGES.findIndex((s) => s.key === status);
}

export function StatusStepper({ status, updatedAt }: { status: OrderStatus; updatedAt: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-5 py-4">
        <XCircle className="h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="font-medium text-danger">Order cancelled</p>
          <p className="text-sm text-danger/80">
            Contact support on WhatsApp if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  const current = stageIndex(status);
  const time = new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-start">
      {STAGES.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === STAGES.length - 1;
        return (
          <div key={stage.key} className={clsx("flex flex-1 flex-col items-center text-center", !isLast && "relative")}>
            {!isLast && (
              <div
                className={clsx(
                  "absolute left-1/2 top-4 h-[2px] w-full",
                  done ? "bg-signal" : "bg-line"
                )}
              />
            )}
            <div
              className={clsx(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                done && "border-signal bg-signal text-white",
                active && "border-accent bg-accent text-white",
                !done && !active && "border-line bg-canvas-raised text-ink-faint"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : active ? <span className="pulse-dot h-2 w-2 rounded-full bg-white" /> : i + 1}
            </div>
            <p className={clsx("mt-2 text-sm font-medium", (done || active) ? "text-ink" : "text-ink-faint")}>
              {stage.label}
            </p>
            {active && <p className="font-data text-xs text-ink-faint">{time}</p>}
          </div>
        );
      })}
    </div>
  );
}
