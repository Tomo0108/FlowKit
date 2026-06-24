"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { ArrowRight, Box, Loader2, Share2 } from "lucide-react";
import { WorkflowPipeline } from "@/components/workflow-pipeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FlowConfig } from "@/lib/validators";

type FlowFormProps = {
  form: UseFormReturn<FlowConfig>;
  formTab: string;
  onFormTabChange: (tab: string) => void;
  isExporting: boolean;
  exportMessage: string | null;
  onExport: () => void;
};

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

export function FlowForm({
  form,
  formTab,
  onFormTabChange,
  isExporting,
  exportMessage,
  onExport,
}: FlowFormProps) {
  const values = form.watch();

  function fieldError(name: keyof FlowConfig) {
    const message = form.formState.errors[name]?.message;
    return message ? String(message) : null;
  }

  return (
    <div className="space-y-8">
      <WorkflowPipeline />

      <Tabs value={formTab} onValueChange={onFormTabChange}>
        <TabsList>
          <TabsTrigger value="source">ソース</TabsTrigger>
          <TabsTrigger value="sheet">シート</TabsTrigger>
          <TabsTrigger value="output">出力先</TabsTrigger>
          <TabsTrigger value="schedule">スケジュール</TabsTrigger>
        </TabsList>

        <TabsContent value="source" className="space-y-6">
          <Field label="Excel ファイルの場所">
            <div className="segment">
              <button
                type="button"
                data-active={values.dataSourceType === "box"}
                className="segment-item"
                onClick={() =>
                  form.setValue("dataSourceType", "box", { shouldValidate: true })
                }
              >
                <Box className="h-3.5 w-3.5" aria-hidden />
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
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                SharePoint
              </button>
            </div>
          </Field>

          {values.dataSourceType === "box" ? (
            <Field
              label="Box フォルダ ID"
              htmlFor="sourceBoxFolderId"
              hint="Excel ファイルが格納されているフォルダ"
              error={fieldError("sourceBoxFolderId")}
            >
              <Input
                id="sourceBoxFolderId"
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
                  placeholder="Shared Documents/Reports"
                  {...form.register("sourceSharePointFolderPath")}
                />
              </Field>
            </>
          )}
        </TabsContent>

        <TabsContent value="sheet">
          <Field
            label="コピーするシート名"
            htmlFor="sheetName"
            hint="CSV 化する Excel シート"
            error={fieldError("sheetName")}
          >
            <Input
              id="sheetName"
              placeholder="Sheet1"
              {...form.register("sheetName")}
            />
          </Field>
        </TabsContent>

        <TabsContent value="output" className="space-y-6">
          <Field
            label="CSV 出力先 Box フォルダ ID"
            htmlFor="destinationBoxFolderId"
            error={fieldError("destinationBoxFolderId")}
          >
            <Input
              id="destinationBoxFolderId"
              placeholder="9876543210"
              {...form.register("destinationBoxFolderId")}
            />
          </Field>
          <Field label="ファイル名プレフィックス" htmlFor="csvFileNamePrefix">
            <Input
              id="csvFileNamePrefix"
              placeholder="export"
              {...form.register("csvFileNamePrefix")}
            />
          </Field>
          {values.dataSourceType === "box" && (
            <Field
              label="OneDrive 一時フォルダ"
              htmlFor="oneDriveTempFolder"
              hint="Box ソース時の Excel 処理用"
            >
              <Input
                id="oneDriveTempFolder"
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
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="rounded-2xl border border-[var(--accent-ring)] bg-[var(--accent-softer)] px-6 py-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
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
              <span className="ml-2 text-sm text-muted-foreground">毎日実行</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="時" htmlFor="scheduleHour">
              <Input
                id="scheduleHour"
                type="number"
                min={0}
                max={23}
                {...form.register("scheduleHour")}
              />
            </Field>
            <Field label="分" htmlFor="scheduleMinute">
              <Input
                id="scheduleMinute"
                type="number"
                min={0}
                max={59}
                {...form.register("scheduleMinute")}
              />
            </Field>
          </div>
          <Field label="タイムゾーン" htmlFor="timeZone">
            <Input id="timeZone" {...form.register("timeZone")} />
          </Field>
        </TabsContent>
      </Tabs>

      <div className="space-y-3 border-t border-border pt-6">
        {exportMessage && (
          <p className="text-xs text-muted-foreground">{exportMessage}</p>
        )}
        <Button
          onClick={onExport}
          disabled={isExporting}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden />
          )}
          zip を出力
        </Button>
      </div>
    </div>
  );
}
