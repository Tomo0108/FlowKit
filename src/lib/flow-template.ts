export const FLOW_TEMPLATE = {
  id: "box-excel-sheet-csv-batch",
  title: "Box Excel シート CSV 日次バッチ",
  description:
    "Box フォルダ内の Excel から指定シートを CSV 化し、別の Box フォルダへ毎日定時出力",
  defaultFlowName: "Box Excel CSV 日次バッチ",
  defaultSchedule: { hour: 10, minute: 0, timeZone: "Tokyo Standard Time" },
} as const;

export const WORKFLOW_STEPS = [
  { id: 1, label: "毎日 10:00 に自動実行" },
  { id: 2, label: "Box フォルダから Excel 取得" },
  { id: 3, label: "指定シートをコピーして CSV 化" },
  { id: 4, label: "CSV を Box フォルダへ配置" },
] as const;
