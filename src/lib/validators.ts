import { z } from "zod";
import { FLOW_TEMPLATE } from "@/lib/flow-template";

export const dataSourceTypes = ["box", "sharepoint"] as const;

export type DataSourceType = (typeof dataSourceTypes)[number];

export const flowConfigSchema = z
  .object({
    flowName: z
      .string()
      .min(1, "フロー名を入力してください")
      .max(80, "フロー名は80文字以内にしてください"),
    description: z.string().max(500).optional(),
    dataSourceType: z.enum(dataSourceTypes),
    sourceBoxFolderId: z.string().optional(),
    sourceSharePointSiteUrl: z.string().optional(),
    sourceSharePointFolderPath: z.string().optional(),
    sheetName: z
      .string()
      .min(1, "コピーするシート名を入力してください")
      .max(100, "シート名は100文字以内にしてください"),
    destinationBoxFolderId: z
      .string()
      .min(1, "CSV 出力先の Box フォルダ ID を入力してください"),
    csvFileNamePrefix: z.string().max(50).optional(),
    oneDriveTempFolder: z.string().max(200).optional(),
    scheduleHour: z.coerce.number().int().min(0).max(23),
    scheduleMinute: z.coerce.number().int().min(0).max(59),
    timeZone: z.string().min(1, "タイムゾーンを入力してください"),
  })
  .superRefine((value, ctx) => {
    if (value.dataSourceType === "box" && !value.sourceBoxFolderId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Excel ファイルがある Box フォルダ ID を入力してください",
        path: ["sourceBoxFolderId"],
      });
    }

    if (value.dataSourceType === "sharepoint") {
      const siteUrl = value.sourceSharePointSiteUrl?.trim() ?? "";
      if (!siteUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SharePoint サイト URL を入力してください",
          path: ["sourceSharePointSiteUrl"],
        });
      } else if (!z.string().url().safeParse(siteUrl).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "有効な URL を入力してください",
          path: ["sourceSharePointSiteUrl"],
        });
      }
      if (!value.sourceSharePointFolderPath?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "SharePoint フォルダパスを入力してください",
          path: ["sourceSharePointFolderPath"],
        });
      }
    }
  });

export type FlowConfig = z.infer<typeof flowConfigSchema>;

export const defaultFlowConfig: FlowConfig = {
  flowName: FLOW_TEMPLATE.defaultFlowName,
  description: "",
  dataSourceType: "box",
  sourceBoxFolderId: "",
  sourceSharePointSiteUrl: "",
  sourceSharePointFolderPath: "",
  sheetName: "",
  destinationBoxFolderId: "",
  csvFileNamePrefix: "export",
  oneDriveTempFolder: "/FlowKit/temp",
  scheduleHour: FLOW_TEMPLATE.defaultSchedule.hour,
  scheduleMinute: FLOW_TEMPLATE.defaultSchedule.minute,
  timeZone: FLOW_TEMPLATE.defaultSchedule.timeZone,
};
