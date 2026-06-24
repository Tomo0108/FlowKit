import { ArrowRight } from "lucide-react";
import { FLOW_TEMPLATE, WORKFLOW_STEPS } from "@/lib/flow-template";

export function WorkflowPipeline() {
  return (
    <div className="rounded-lg border bg-muted/20 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">
        {FLOW_TEMPLATE.title}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {WORKFLOW_STEPS.map((step, index) => (
          <span key={step.id} className="flex items-center gap-1.5">
            <span className="rounded-md bg-background px-2 py-1 border">
              {step.label}
            </span>
            {index < WORKFLOW_STEPS.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
