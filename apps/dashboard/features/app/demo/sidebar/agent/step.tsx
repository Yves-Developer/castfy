import { Badge } from "@castfy/ui/components/badge";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Globe,
  Keyboard,
  Loader2,
  MousePointer,
  Move,
  ShieldCheck,
  Type,
} from "lucide-react";
import type { AgentStep } from "@/types";

function getStepIcon(action: string) {
  switch (action.toLowerCase()) {
    case "navigate":
    case "snapshot":
      return <Globe className="size-5 text-blue-500" />;
    case "click":
      return <MousePointer className="size-5 text-indigo-500" />;
    case "fill":
      return <Keyboard className="size-5 text-amber-500" />;
    case "select":
      return <ChevronDown className="size-5 text-emerald-500" />;
    case "hover":
      return <Move className="size-5 text-pink-500" />;
    case "press_key":
      return <Type className="size-5 text-cyan-500" />;
    case "scroll":
      return <ArrowUpDown className="size-5 text-purple-500" />;
    case "assert":
      return <ShieldCheck className="size-5 text-teal-500" />;
    case "submit_journey":
      return <CheckCircle2 className="size-5 text-green-500" />;
    default:
      return <Globe className="size-5 text-slate-500" />;
  }
}

function StepItem({ step, index }: { step: AgentStep; index: number }) {
  return (
    <div className="group relative">
      <span className="absolute top-0 -left-9.25 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm ring-4 ring-white">
        {getStepIcon(step.action)}
      </span>
      <div className="flex flex-col gap-1 rounded-lg border bg-white p-3 shadow-sm transition-colors group-hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
            Step {index + 1}: {step.action}
          </span>
          {step.status === "error" ? (
            <Badge className="px-1.5 py-0 text-[10px]" variant="destructive">
              Error
            </Badge>
          ) : (
            <Badge
              className="border-slate-200 bg-slate-100 px-1.5 py-0 text-[10px] text-slate-600"
              variant="secondary"
            >
              Success
            </Badge>
          )}
        </div>
        <p className="font-medium text-slate-700 text-sm leading-relaxed">
          {step.description}
        </p>
        {(step.ref || step.value) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5 rounded border border-slate-100 bg-slate-50 p-1.5 font-mono text-[11px] text-slate-500">
            {step.ref && (
              <span>
                <strong className="font-semibold text-slate-600">Ref:</strong>{" "}
                {step.ref}
              </span>
            )}
            {step.value && (
              <span>
                <strong className="font-semibold text-slate-600">Val:</strong>{" "}
                {step.value}
              </span>
            )}
          </div>
        )}
        {step.error && (
          <p className="mt-1 rounded border border-red-100 bg-red-50/50 p-2 font-mono text-red-500 text-xs">
            Error: {step.error}
          </p>
        )}
      </div>
    </div>
  );
}

export function StepsTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wide">
        Agent Actions
      </h3>
      {steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50/30 p-8">
          <Loader2 className="mb-2 h-6 w-6 animate-spin text-slate-400" />
          <span className="font-medium text-slate-500 text-sm">
            Waiting for first action...
          </span>
        </div>
      ) : (
        <div className="relative ml-3 space-y-4 border-slate-200 border-l pl-6">
          {steps.map((step, idx) => (
            <StepItem index={idx} key={`${step.action}-${idx}`} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}
