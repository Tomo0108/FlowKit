"use client";

import { useState } from "react";
import { Box, Clock, FolderOpen, Inbox, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  deleteSavedFlow,
  listSavedFlows,
  type SavedFlow,
} from "@/lib/saved-flows";
import { describeSchedule } from "@/lib/schedule";
import type { FlowConfig } from "@/lib/validators";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SavedFlowsView({
  onLoad,
}: {
  onLoad: (config: FlowConfig) => void;
}) {
  const [flows, setFlows] = useState<SavedFlow[]>(() => listSavedFlows());

  function handleDelete(id: string) {
    setFlows(deleteSavedFlow(id));
  }

  if (flows.length === 0) {
    return (
      <Surface className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="h-6 w-6" aria-hidden />
        </span>
        <p className="text-base font-semibold text-foreground">
          保存されたフローはありません
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          フローを zip 出力すると、設定がここに自動で保存され、いつでも再利用できます。
        </p>
      </Surface>
    );
  }

  return (
    <div className="space-y-3">
      {flows.map((flow, index) => {
        const config = flow.config;
        const isBox = config.dataSourceType === "box";
        return (
          <div
            key={flow.id}
            className="surface animate-fade-up flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="min-w-0 space-y-2">
              <p className="truncate text-base font-semibold text-foreground">
                {flow.name}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {isBox ? (
                    <Box className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {isBox ? "Box" : "SharePoint"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {describeSchedule({
                    frequency: config.scheduleFrequency,
                    hour: config.scheduleHour,
                    minute: config.scheduleMinute,
                    weekdays: config.scheduleWeekdays,
                    day: config.scheduleDay,
                  })}
                </span>
                <span className="mono">{formatDate(flow.savedAt)}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onLoad(config)}>
                <FolderOpen className="h-4 w-4" aria-hidden />
                読み込む
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="削除"
                onClick={() => handleDelete(flow.id)}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
