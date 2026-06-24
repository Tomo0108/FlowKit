"use client";

import { Fragment, type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateFlowPackage,
  summarizeFlow,
} from "@/lib/power-automate/generate-package";
import { downloadBlob } from "@/lib/utils";
import {
  defaultFlowConfig,
  flowConfigSchema,
  type FlowConfig,
} from "@/lib/validators";

type StepId = "source" | "sheet" | "output" | "schedule" | "review";

const STEPS: { id: StepId; label: string; title: string; subtitle: string }[] = [
  {
    id: "source",
    label: "ソース",
    title: "データソース",
    subtitle: "Excel ファイルが置かれている場所を指定します",
  },
  {
    id: "sheet",
    label: "シート",
    title: "対象シート",
    subtitle: "CSV 化する Excel シートを指定します",
  },
  {
    id: "output",
    label: "出力先",
    title: "出力先と名前",
    subtitle: "CSV の配置先とフロー名を設定します",
  },
  {
    id: "schedule",
    label: "スケジュール",
    title: "実行スケジュール",
    subtitle: "自動バッチを実行する時刻を指定します",
  },
  {
    id: "review",
    label: "確認",
    title: "内容を確認して出力",
    subtitle: "設定を確認し、インポート用 zip を生成します",
  },
];

function fieldsForStep(
  step: StepId,
  source: FlowConfig["dataSourceType"],
): (keyof FlowConfig)[] {
  switch (step) {
    case "source":
      return source === "box"
        ? ["sourceBoxFolderId"]
        : ["sourceSharePointSiteUrl", "sourceSharePointFolderPath"];
    case "sheet":
      return ["sheetName"];
    case "output":
      return ["destinationBoxFolderId", "flowName"];
    case "schedule":
      return ["scheduleHour", "scheduleMinute", "timeZone"];
    default:
      return [];
  }
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

const reviewSteps = [
  { icon: Box, label: "ソースから Excel を取得" },
  { icon: FileSpreadsheet, label: "指定シートをコピーして CSV 化" },
  { icon: FileText, label: "CSV を Box フォルダへ配置" },
  { icon: Clock, label: "毎日定刻に自動実行" },
];

export function FlowWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFile, setExportedFile] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const form = useForm<FlowConfig>({
    resolver: zodResolver(flowConfigSchema),
    defaultValues: defaultFlowConfig,
    mode: "onChange",
  });

  const values = form.watch();
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  function fieldError(name: keyof FlowConfig) {
    const message = form.formState.errors[name]?.message;
    return message ? String(message) : null;
  }

  async function goNext() {
    const valid = await form.trigger(
      fieldsForStep(step.id, values.dataSourceType),
    );
    if (!valid) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setExportError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function onExport() {
    setExportError(null);
    const valid = await form.trigger();
    if (!valid) return;

    setIsExporting(true);
    try {
      const { blob, fileName } = await generateFlowPackage(form.getValues());
      downloadBlob(blob, fileName);
      setExportedFile(fileName);
    } catch {
      setExportError("zip の生成に失敗しました。入力内容をご確認ください。");
    } finally {
      setIsExporting(false);
    }
  }

  function restart() {
    form.reset(defaultFlowConfig);
    setExportedFile(null);
    setExportError(null);
    setStepIndex(0);
  }

  return (
    <div className="space-y-7">
      {/* Stepper */}
      <ol className="flex items-start">
        {STEPS.map((s, index) => {
          const state =
            index < stepIndex ? "done" : index === stepIndex ? "active" : "todo";
          return (
            <Fragment key={s.id}>
              <li className="flex flex-col items-center gap-2">
                <span className="step-bubble" data-state={state}>
                  {state === "done" ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className="step-caption hidden sm:block"
                  data-state={state}
                >
                  {s.label}
                </span>
              </li>
              {index < STEPS.length - 1 && (
                <span
                  className="step-line mt-[1.0625rem]"
                  data-state={index < stepIndex ? "done" : "todo"}
                  aria-hidden
                />
              )}
            </Fragment>
          );
        })}
      </ol>

      {/* Step card */}
      <div className="surface p-6 sm:p-8">
        <header className="mb-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
            Step {stepIndex + 1} / {STEPS.length}
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
            {step.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{step.subtitle}</p>
        </header>

        <div key={step.id} className="animate-step-in">
          {step.id === "source" && (
            <div className="space-y-6">
              <Field label="Excel ファイルの場所">
                <div className="segment">
                  <button
                    type="button"
                    data-active={values.dataSourceType === "box"}
                    className="segment-item"
                    onClick={() =>
                      form.setValue("dataSourceType", "box", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <Box className="h-4 w-4" aria-hidden />
                    Box
                  </button>
                  <button
                    type="button"
                    data-active={values.dataSourceType === "sharepoint"}
                    className="segment-item"
                    onClick={() =>
                      form.setValue("dataSourceType", "sharepoint", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                    SharePoint
                  </button>
                </div>
              </Field>

              {values.dataSourceType === "box" ? (
                <Field
                  label="Box フォルダ ID"
                  htmlFor="sourceBoxFolderId"
                  hint="Excel ファイルが格納されているフォルダの ID"
                  error={fieldError("sourceBoxFolderId")}
                >
                  <Input
                    id="sourceBoxFolderId"
                    className="mono"
                    placeholder="1234567890"
                    {...form.register("sourceBoxFolderId")}
                  />
                </Field>
              ) : (
                <>
                  <Field
                    label="SharePoint サイト URL"
                    htmlFor="sourceSharePointSiteUrl"
                    error={fieldError("sourceSharePointSiteUrl")}
                  >
                    <Input
                      id="sourceSharePointSiteUrl"
                      className="mono"
                      placeholder="https://contoso.sharepoint.com/sites/example"
                      {...form.register("sourceSharePointSiteUrl")}
                    />
                  </Field>
                  <Field
                    label="フォルダパス"
                    htmlFor="sourceSharePointFolderPath"
                    error={fieldError("sourceSharePointFolderPath")}
                  >
                    <Input
                      id="sourceSharePointFolderPath"
                      className="mono"
                      placeholder="Shared Documents/Reports"
                      {...form.register("sourceSharePointFolderPath")}
                    />
                  </Field>
                </>
              )}
            </div>
          )}

          {step.id === "sheet" && (
            <Field
              label="コピーするシート名"
              htmlFor="sheetName"
              hint="この Excel シートを CSV に変換します"
              error={fieldError("sheetName")}
            >
              <Input
                id="sheetName"
                placeholder="Sheet1"
                {...form.register("sheetName")}
              />
            </Field>
          )}

          {step.id === "output" && (
            <div className="space-y-6">
              <Field
                label="CSV 出力先 Box フォルダ ID"
                htmlFor="destinationBoxFolderId"
                hint="生成した CSV を配置する Box フォルダ"
                error={fieldError("destinationBoxFolderId")}
              >
                <Input
                  id="destinationBoxFolderId"
                  className="mono"
                  placeholder="9876543210"
                  {...form.register("destinationBoxFolderId")}
                />
              </Field>
              <Field
                label="ファイル名プレフィックス"
                htmlFor="csvFileNamePrefix"
                hint="例: export → export_20260624.csv"
              >
                <Input
                  id="csvFileNamePrefix"
                  className="mono"
                  placeholder="export"
                  {...form.register("csvFileNamePrefix")}
                />
              </Field>
              {values.dataSourceType === "box" && (
                <Field
                  label="OneDrive 一時フォルダ"
                  htmlFor="oneDriveTempFolder"
                  hint="Box ソース時の Excel 処理に使用します"
                >
                  <Input
                    id="oneDriveTempFolder"
                    className="mono"
                    placeholder="/FlowKit/temp"
                    {...form.register("oneDriveTempFolder")}
                  />
                </Field>
              )}
              <Field
                label="Power Automate フロー名"
                htmlFor="flowName"
                error={fieldError("flowName")}
              >
                <Input id="flowName" {...form.register("flowName")} />
              </Field>
            </div>
          )}

          {step.id === "schedule" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--brand-ring)] bg-[var(--brand-softer)] px-6 py-5">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">
                  自動バッチ
                </p>
                <div className="time-display mt-3">
                  <span className="time-display-value">
                    {String(values.scheduleHour).padStart(2, "0")}
                  </span>
                  <span className="time-display-value">:</span>
                  <span className="time-display-value">
                    {String(values.scheduleMinute).padStart(2, "0")}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    毎日実行
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="時" htmlFor="scheduleHour" error={fieldError("scheduleHour")}>
                  <Input
                    id="scheduleHour"
                    className="mono"
                    type="number"
                    min={0}
                    max={23}
                    {...form.register("scheduleHour")}
                  />
                </Field>
                <Field
                  label="分"
                  htmlFor="scheduleMinute"
                  error={fieldError("scheduleMinute")}
                >
                  <Input
                    id="scheduleMinute"
                    className="mono"
                    type="number"
                    min={0}
                    max={59}
                    {...form.register("scheduleMinute")}
                  />
                </Field>
              </div>
              <Field
                label="タイムゾーン"
                htmlFor="timeZone"
                error={fieldError("timeZone")}
              >
                <Input id="timeZone" {...form.register("timeZone")} />
              </Field>
            </div>
          )}

          {step.id === "review" &&
            (exportedFile ? (
              <div className="flex flex-col items-center gap-5 py-6 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                  <CheckCircle2 className="h-7 w-7" aria-hidden />
                </span>
                <div className="space-y-1.5">
                  <p className="text-base font-semibold text-foreground">
                    zip を出力しました
                  </p>
                  <p className="mono text-sm text-muted-foreground">
                    {exportedFile}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Button onClick={onExport} variant="outline">
                    <Download className="h-4 w-4" aria-hidden />
                    もう一度ダウンロード
                  </Button>
                  <Button onClick={restart} variant="ghost">
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    新しいフローを作成
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-7">
                <dl className="overflow-hidden rounded-xl border border-border">
                  {summarizeFlow(values).map((line, index) => {
                    const [term, ...rest] = line.split(": ");
                    const value = rest.join(": ");
                    return (
                      <div
                        key={line}
                        className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3"
                        style={{
                          borderTop:
                            index === 0 ? undefined : "1px solid var(--border)",
                        }}
                      >
                        <dt className="summary-key">{term}</dt>
                        <dd className="summary-value mono">{value}</dd>
                      </div>
                    );
                  })}
                </dl>

                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    生成される処理
                  </p>
                  <ol className="mt-4 space-y-3">
                    {reviewSteps.map((rs, index) => {
                      const Icon = rs.icon;
                      const label =
                        index === reviewSteps.length - 1
                          ? `毎日 ${String(values.scheduleHour).padStart(2, "0")}:${String(values.scheduleMinute).padStart(2, "0")} に自動実行`
                          : rs.label;
                      return (
                        <li key={rs.label} className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-[var(--brand)]">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="text-sm text-foreground/80">
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {exportError && (
                  <p className="field-error !mt-0">{exportError}</p>
                )}
              </div>
            ))}
        </div>

        {/* Footer navigation */}
        {!(isLast && exportedFile) && (
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={stepIndex === 0 || isExporting}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              戻る
            </Button>

            {isLast ? (
              <Button onClick={onExport} disabled={isExporting} size="lg">
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                zip を出力
              </Button>
            ) : (
              <Button onClick={goNext} size="lg">
                次へ
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
