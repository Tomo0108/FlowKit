import { Fragment } from "react";
import { Box, FileSpreadsheet, FileText, Clock, type LucideIcon } from "lucide-react";

type PipeStep = {
  id: number;
  label: string;
  icon: LucideIcon;
};

const steps: PipeStep[] = [
  { id: 1, label: "Excel 取得", icon: Box },
  { id: 2, label: "シート CSV 化", icon: FileSpreadsheet },
  { id: 3, label: "Box へ配置", icon: FileText },
  { id: 4, label: "毎日 10:00", icon: Clock },
];

export function WorkflowPipeline() {
  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-b from-[var(--accent-softer)] to-card p-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        Workflow
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Fragment key={step.id}>
              <div className="pipe-node flex shrink-0 items-center gap-3 sm:w-20 sm:flex-col sm:gap-2.5">
                <span className="pipe-node-icon">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-[0.75rem] font-medium text-foreground/80 sm:text-center">
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span
                  className="pipe-connector ml-[1.375rem] h-4 w-px shrink-0 sm:ml-0 sm:mt-[1.375rem] sm:h-px sm:w-auto sm:flex-1"
                  aria-hidden
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
