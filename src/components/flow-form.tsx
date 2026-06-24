"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowPreview } from "@/components/flow-preview";
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

export function FlowForm() {
  const [activeTab, setActiveTab] = useState("settings");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const form = useForm<FlowConfig>({
    resolver: zodResolver(flowConfigSchema),
    defaultValues: defaultFlowConfig,
    mode: "onChange",
  });

  const values = form.watch();
  const summary = summarizeFlow(values);

  async function onExport() {
    setExportMessage(null);
    const valid = await form.trigger();
    if (!valid) {
      setActiveTab("settings");
      return;
    }

    setIsExporting(true);
    try {
      const config = form.getValues();
      const { blob, fileName } = await generateFlowPackage(config);
      downloadBlob(blob, fileName);
      setExportMessage(`${fileName} をダウンロードしました。`);
      setActiveTab("preview");
    } catch {
      setExportMessage("zip の生成に失敗しました。設定を確認してください。");
    } finally {
      setIsExporting(false);
    }
  }

  function fieldError(name: keyof FlowConfig) {
    const message = form.formState.errors[name]?.message;
    if (!message) return null;
    return <p className="text-xs text-red-600">{String(message)}</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>フロー設定</CardTitle>
          <CardDescription>
            ユースケースに必要な項目だけを入力し、Power Automate
            インポート用 zip を生成します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">設定</TabsTrigger>
              <TabsTrigger value="preview">確認</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6">
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flowName">フロー名</Label>
                  <Input
                    id="flowName"
                    placeholder="例: 日次 Excel CSV エクスポート"
                    {...form.register("flowName")}
                  />
                  {fieldError("flowName")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">説明（任意）</Label>
                  <Input
                    id="description"
                    placeholder="フローの用途メモ"
                    {...form.register("description")}
                  />
                </div>
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <Label className="mb-3 block">データ元</Label>
                  <RadioGroup
                    value={values.dataSourceType}
                    onValueChange={(value) =>
                      form.setValue(
                        "dataSourceType",
                        value as FlowConfig["dataSourceType"],
                        { shouldValidate: true },
                      )
                    }
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value="box" id="source-box" />
                      <div>
                        <p className="text-sm font-medium">Box</p>
                        <p className="text-xs text-muted-foreground">
                          Box フォルダ内の Excel
                        </p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value="sharepoint" id="source-sp" />
                      <div>
                        <p className="text-sm font-medium">SharePoint</p>
                        <p className="text-xs text-muted-foreground">
                          SharePoint ライブラリ内の Excel
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                {values.dataSourceType === "box" ? (
                  <div className="space-y-2">
                    <Label htmlFor="sourceBoxFolderId">
                      ソース Box フォルダ ID
                    </Label>
                    <Input
                      id="sourceBoxFolderId"
                      placeholder="例: 1234567890"
                      {...form.register("sourceBoxFolderId")}
                    />
                    {fieldError("sourceBoxFolderId")}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sourceSharePointSiteUrl">
                        SharePoint サイト URL
                      </Label>
                      <Input
                        id="sourceSharePointSiteUrl"
                        placeholder="https://contoso.sharepoint.com/sites/example"
                        {...form.register("sourceSharePointSiteUrl")}
                      />
                      {fieldError("sourceSharePointSiteUrl")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sourceSharePointFolderPath">
                        SharePoint フォルダパス
                      </Label>
                      <Input
                        id="sourceSharePointFolderPath"
                        placeholder="Shared Documents/Reports"
                        {...form.register("sourceSharePointFolderPath")}
                      />
                      {fieldError("sourceSharePointFolderPath")}
                    </div>
                  </>
                )}
              </section>

              <Separator />

              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sheetName">対象シート名</Label>
                  <Input
                    id="sheetName"
                    placeholder="例: Sheet1"
                    {...form.register("sheetName")}
                  />
                  {fieldError("sheetName")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationBoxFolderId">
                    CSV 出力先 Box フォルダ ID
                  </Label>
                  <Input
                    id="destinationBoxFolderId"
                    placeholder="例: 9876543210"
                    {...form.register("destinationBoxFolderId")}
                  />
                  {fieldError("destinationBoxFolderId")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csvFileNamePrefix">
                    CSV ファイル名プレフィックス（任意）
                  </Label>
                  <Input
                    id="csvFileNamePrefix"
                    placeholder="export"
                    {...form.register("csvFileNamePrefix")}
                  />
                </div>
              </section>

              <Separator />

              <section className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="scheduleHour">実行時刻（時）</Label>
                  <Input
                    id="scheduleHour"
                    type="number"
                    min={0}
                    max={23}
                    {...form.register("scheduleHour")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleMinute">実行時刻（分）</Label>
                  <Input
                    id="scheduleMinute"
                    type="number"
                    min={0}
                    max={59}
                    {...form.register("scheduleMinute")}
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="timeZone">タイムゾーン</Label>
                  <Input
                    id="timeZone"
                    {...form.register("timeZone")}
                  />
                </div>
              </section>
            </TabsContent>

            <TabsContent value="preview">
              <FlowPreview config={values} summary={summary} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              すべての処理はブラウザ内で完結します。AI は使用しません。
            </p>
            <Button onClick={onExport} disabled={isExporting} size="lg">
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              zip を出力
            </Button>
          </div>

          {exportMessage && (
            <p className="mt-3 text-sm text-muted-foreground">{exportMessage}</p>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>プレビュー</CardTitle>
          <CardDescription>
            入力内容に基づくフロー構成の確認
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlowPreview config={values} summary={summary} />
        </CardContent>
      </Card>
    </div>
  );
}
