import { FLOW_TEMPLATE, WORKFLOW_STEPS } from "@/lib/flow-template";

export function WorkflowPipeline() {
  return (
    <div>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Workflow
      </p>
      <p className="mt-1 text-sm font-medium tracking-tight text-foreground">
        {FLOW_TEMPLATE.title}
      </p>
      <div className="step-rail mt-4">
        {WORKFLOW_STEPS.map((step) => (
          <div key={step.id} className="step-node">
            <span className="step-node-index">{step.id}</span>
            <span className="step-node-label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
