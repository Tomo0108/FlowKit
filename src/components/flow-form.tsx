"use client";

import type { UseFormReturn } from "react-hook-form";
import { Download, Loader2 } from "lucide-react";
import { WorkflowPipeline } from "@/components/workflow-pipeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    if (!message) return null;
    return <p className="text-xs text-red-600">{String(message)}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkflowPipeline />

      <Tabs value={formTab} onValueChange={onFormTabChange}>
        <TabsList className="grid h-auto w-full grid-cols-4 p-1">
          <TabsTrigger value="source" className="text-xs sm:text-sm">
            ソース
          </TabsTrigger>
          <TabsTrigger value="sheet" className="text-xs sm:text-sm">
            シート
          </TabsTrigger>
          <TabsTrigger value="output" className="text-xs sm:text-sm">
            出力先
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm">
            10:00 実行
          </TabsTrigger>
        </TabsList>

        <TabsContent value="source" className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Excel ファイルの場所</Label>
            <RadioGroup
              value={values.dataSourceType}
              onValueChange={(value) =>
                form.setValue(
                  "dataSourceType",
                  value as FlowConfig["dataSourceType"],
                  { shouldValidate: true },
                )
              }
              className="grid grid-cols-2 gap-2"
            >
              <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value="box" id="source-box" />
                <span className="text-sm">Box フォルダ</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value="sharepoint" id="source-sp" />
                <span className="text-sm">SharePoint</span>
              </label>
            </RadioGroup>
          </div>

          {values.dataSourceType === "box" ? (
            <div className="space-y-2">
              <Label htmlFor="sourceBoxFolderId">
                Excel がある Box フォルダ ID
              </Label>
              <Input
                id="sourceBoxFolderId"
                placeholder="1234567890"
                {...form.register("sourceBoxFolderId")}
              />
              {fieldError("sourceBoxFolderId")}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="sourceSharePointSiteUrl">SharePoint サイト URL</Label>
                <Input
                  id="sourceSharePointSiteUrl"
                  placeholder="https://contoso.sharepoint.com/sites/example"
                  {...form.register("sourceSharePointSiteUrl")}
                />
                {fieldError("sourceSharePointSiteUrl")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceSharePointFolderPath">フォルダパス</Label>
                <Input
                  id="sourceSharePointFolderPath"
                  placeholder="Shared Documents/Reports"
                  {...form.register("sourceSharePointFolderPath")}
                />
                {fieldError("sourceSharePointFolderPath")}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="sheet" className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheetName">コピーするシート名</Label>
            <Input
              id="sheetName"
              placeholder="Sheet1"
              {...form.register("sheetName")}
            />
            {fieldError("sheetName")}
          </div>
        </TabsContent>

        <TabsContent value="output" className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destinationBoxFolderId">
              CSV を配置する Box フォルダ ID
            </Label>
            <Input
              id="destinationBoxFolderId"
              placeholder="9876543210"
              {...form.register("destinationBoxFolderId")}
            />
            {fieldError("destinationBoxFolderId")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="csvFileNamePrefix">CSV ファイル名プレフィックス</Label>
            <Input
              id="csvFileNamePrefix"
              placeholder="export"
              {...form.register("csvFileNamePrefix")}
            />
          </div>
          {values.dataSourceType === "box" && (
            <div className="space-y-2">
              <Label htmlFor="oneDriveTempFolder">OneDrive 一時フォルダ</Label>
              <Input
                id="oneDriveTempFolder"
                placeholder="/FlowKit/temp"
                {...form.register("oneDriveTempFolder")}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="flowName">Power Automate フロー名</Label>
            <Input id="flowName" {...form.register("flowName")} />
            {fieldError("flowName")}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6 space-y-4">
          <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm">
            毎日{" "}
            <span className="font-semibold tabular-nums">
              {String(values.scheduleHour).padStart(2, "0")}:
              {String(values.scheduleMinute).padStart(2, "0")}
            </span>{" "}
            に自動バッチ実行
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleHour">時</Label>
              <Input
                id="scheduleHour"
                type="number"
                min={0}
                max={23}
                {...form.register("scheduleHour")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleMinute">分</Label>
              <Input
                id="scheduleMinute"
                type="number"
                min={0}
                max={59}
                {...form.register("scheduleMinute")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeZone">タイムゾーン</Label>
            <Input id="timeZone" {...form.register("timeZone")} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4">
        {exportMessage && (
          <p className="mb-3 text-xs text-muted-foreground">{exportMessage}</p>
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
            <Download className="h-4 w-4" aria-hidden />
          )}
          Power Automate 用 zip を出力
        </Button>
      </div>
    </div>
  );
}
