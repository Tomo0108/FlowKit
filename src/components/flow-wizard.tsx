"use client";

import {
  Fragment,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateFlowPackage,
  summarizeFlow,
} from "@/lib/power-automate/generate-package";
import { saveFlow } from "@/lib/saved-flows";
import {
  describeSchedule,
  formatTime,
  FREQUENCY_OPTIONS,
  WEEKDAYS,
} from "@/lib/schedule";
import { useCompactMotion } from "@/lib/use-compact-motion";
import { downloadBlob } from "@/lib/utils";
import {
  defaultFlowConfig,
  flowConfigSchema,
  type FlowConfig,
} from "@/lib/validators";

type StepId = "source" | "sheet" | "output" | "schedule" | "review";

const STEPS: { id: StepId; label: string; title: string; subtitle: string }[] = [
  {
    id: "schedule",
    label: "実行時刻",
    title: "実行スケジュール",
    subtitle: "自動バッチを実行する頻度と時刻を指定します",
  },
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
    id: "review",
    label: "確認",
    title: "内容を確認して出力",
    subtitle: "設定を確認し、インポート用 zip を生成します",
  },
];

const TIME_PRESETS = [
  { h: 9, m: 0 },
  { h: 10, m: 0 },
  { h: 12, m: 0 },
  { h: 18, m: 0 },
];

const TIME_ZONES = [
  { value: "Tokyo Standard Time", label: "(UTC+09:00) 東京・大阪" },
  { value: "Korea Standard Time", label: "(UTC+09:00) ソウル" },
  { value: "China Standard Time", label: "(UTC+08:00) 北京" },
  { value: "Singapore Standard Time", label: "(UTC+08:00) シンガポール" },
  { value: "W. Europe Standard Time", label: "(UTC+01:00) 中央ヨーロッパ" },
  { value: "GMT Standard Time", label: "(UTC+00:00) ロンドン" },
  { value: "UTC", label: "(UTC+00:00) UTC" },
  { value: "Eastern Standard Time", label: "(UTC-05:00) 米国東部" },
  { value: "Pacific Standard Time", label: "(UTC-08:00) 米国太平洋" },
];

function fieldsForStep(
  step: StepId,
  source: FlowConfig["dataSourceType"],
  frequency: FlowConfig["scheduleFrequency"],
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
      return frequency === "week"
        ? ["scheduleWeekdays", "scheduleHour", "scheduleMinute", "timeZone"]
        : ["scheduleHour", "scheduleMinute", "timeZone"];
    default:
      return [];
  }
}

function FieldHelp({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        className="help-dot"
        data-open={open}
        aria-label="この項目の説明"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden />
      </button>
      {open && (
        <span
          role="tooltip"
          className="help-popover animate-fade-up absolute left-0 top-7 z-30 block w-[min(17rem,calc(100vw-2.5rem))] px-3.5 py-2.5 break-words whitespace-normal"
        >
          {text}
        </span>
      )}
    </span>
  );
}

function Field({
  label,
  htmlFor,
  help,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  help?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label htmlFor={htmlFor} className="field-label">
          {label}
        </label>
        {help && <FieldHelp text={help} />}
      </div>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function TimeStepper({
  label,
  value,
  onInc,
  onDec,
}: {
  label: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const incRef = useRef(onInc);
  const decRef = useRef(onDec);
  incRef.current = onInc;
  decRef.current = onDec;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY < 0) incRef.current();
      else decRef.current();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div ref={ref} className="time-field" title="スクロールでも変更できます">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        className="step-btn"
        onClick={onInc}
        aria-label={`${label}を増やす`}
      >
        <ChevronUp className="h-4 w-4" aria-hidden />
      </button>
      <span className="time-field-value">{String(value).padStart(2, "0")}</span>
      <button
        type="button"
        className="step-btn"
        onClick={onDec}
        aria-label={`${label}を減らす`}
      >
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

const reviewSteps = [
  { icon: Clock, label: "設定したスケジュールで自動実行", schedule: true },
  { icon: Box, label: "ソースから Excel を取得", schedule: false },
  {
    icon: FileSpreadsheet,
    label: "指定シートをコピーして CSV 化",
    schedule: false,
  },
  { icon: FileText, label: "CSV を Box フォルダへ配置", schedule: false },
];

export function FlowWizard({
  initialConfig,
}: {
  initialConfig?: FlowConfig;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(
    initialConfig ? STEPS.length - 1 : 0,
  );
  const [direction, setDirection] = useState<"next" | "back">("next");
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFile, setExportedFile] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const compactMotion = useCompactMotion();

  const form = useForm<FlowConfig>({
    resolver: zodResolver(flowConfigSchema),
    defaultValues: initialConfig ?? defaultFlowConfig,
    mode: "onChange",
  });

  const values = form.watch();
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const hour = Number(values.scheduleHour) || 0;
  const minute = Number(values.scheduleMinute) || 0;
  const day = Number(values.scheduleDay) || 1;
  const weekdays = values.scheduleWeekdays ?? [];

  const scheduleText = describeSchedule({
    frequency: values.scheduleFrequency,
    hour,
    minute,
    weekdays,
    day,
  });
  const scheduleLabel = scheduleText.replace(` ${formatTime(hour, minute)}`, "");

  function fieldError(name: keyof FlowConfig) {
    const message = form.formState.errors[name]?.message;
    return message ? String(message) : null;
  }

  function setHour(next: number) {
    form.setValue("scheduleHour", ((next % 24) + 24) % 24, {
      shouldValidate: true,
    });
  }

  function setMinute(next: number) {
    form.setValue("scheduleMinute", ((next % 60) + 60) % 60, {
      shouldValidate: true,
    });
  }

  function setDay(next: number) {
    form.setValue("scheduleDay", ((((next - 1) % 31) + 31) % 31) + 1, {
      shouldValidate: true,
    });
  }

  function setTime(h: number, m: number) {
    setHour(h);
    setMinute(m);
  }

  function toggleWeekday(value: string) {
    const next = weekdays.includes(value)
      ? weekdays.filter((d) => d !== value)
      : [...weekdays, value];
    form.setValue("scheduleWeekdays", next, { shouldValidate: true });
  }

  async function goNext() {
    const valid = await form.trigger(
      fieldsForStep(step.id, values.dataSourceType, values.scheduleFrequency),
    );
    if (!valid) return;
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    setDirection("next");
    setStepIndex(next);
    setMaxReached((m) => Math.max(m, next));
  }

  function goBack() {
    setExportError(null);
    setDirection("back");
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function goTo(index: number) {
    if (index === stepIndex || index > maxReached) return;
    setExportError(null);
    setDirection(index > stepIndex ? "next" : "back");
    setStepIndex(index);
  }

  async function onExport() {
    setExportError(null);
    const valid = await form.trigger();
    if (!valid) return;

    setIsExporting(true);
    try {
      const config = form.getValues();
      const { blob, fileName } = await generateFlowPackage(config);
      downloadBlob(blob, fileName);
      saveFlow(config);
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
    setMaxReached(0);
    setDirection("back");
    setStepIndex(0);
  }

  const spring = { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.85 };
  const compactTransition = {
    duration: 0.18,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const headerOffset = compactMotion ? 8 : 18;
  const contentEnterOffset = compactMotion ? 12 : 48;
  const contentExitOffset = compactMotion ? 10 : 36;

  const headerVariants = {
    initial: (dir: "next" | "back") => ({
      opacity: 0,
      x: dir === "next" ? headerOffset : -headerOffset,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: compactMotion ? compactTransition : spring,
    },
    exit: (dir: "next" | "back") => ({
      opacity: 0,
      x: dir === "next" ? -headerOffset : headerOffset,
      transition: compactMotion
        ? { duration: 0.14, ease: [0.4, 0, 1, 1] as const }
        : { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
    }),
  };

  const contentVariants = {
    initial: (dir: "next" | "back") => ({
      opacity: 0,
      x: dir === "next" ? contentEnterOffset : -contentEnterOffset,
      filter: compactMotion ? "none" : "blur(4px)",
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: "none",
      transition: compactMotion ? compactTransition : spring,
    },
    exit: (dir: "next" | "back") => ({
      opacity: 0,
      x: dir === "next" ? -contentExitOffset : contentExitOffset,
      filter: compactMotion ? "none" : "blur(4px)",
      transition: compactMotion
        ? { duration: 0.14, ease: [0.4, 0, 1, 1] as const }
        : { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
    }),
  };

  return (
    <div className="space-y-7">
      {/* Stepper */}
      <ol className="flex items-start sm:pb-7">
        {STEPS.map((s, index) => {
          const state =
            index < stepIndex ? "done" : index === stepIndex ? "active" : "todo";
          const clickable = index <= maxReached && index !== stepIndex;
          return (
            <Fragment key={s.id}>
              <li className="relative flex shrink-0 flex-col items-center">
                <button
                  type="button"
                  className="step-bubble"
                  data-state={state}
                  onClick={() => goTo(index)}
                  disabled={!clickable}
                  aria-label={`${s.label}へ移動`}
                  style={{ cursor: clickable ? "pointer" : "default" }}
                >
                  {state === "done" ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </button>
                <span
                  className="step-caption absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap sm:block"
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
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.header
            key={step.id}
            custom={direction}
            variants={headerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-6"
            data-compact-motion={compactMotion ? "true" : undefined}
          >
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
              Step {stepIndex + 1} / {STEPS.length}
            </p>
            <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">
              {step.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.subtitle}</p>
          </motion.header>
        </AnimatePresence>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            data-compact-motion={compactMotion ? "true" : undefined}
          >
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
                  help="Excel ファイルが格納されている Box フォルダの ID です。フォルダを開いた際の URL 末尾の数字で確認できます。"
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
                    help="対象 SharePoint サイトの URL です。例: https://contoso.sharepoint.com/sites/example"
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
                    help="サイト内の Excel ファイルがあるフォルダのパスです。例: Shared Documents/Reports"
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
              help="CSV に変換する Excel シートの名前です。シート見出しと完全に一致させてください。"
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
                help="生成した CSV を配置する Box フォルダの ID です。"
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
                help="出力ファイル名の先頭に付く文字列です。例: export → export_20260624.csv"
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
                  help="Box ソース時に Excel を一時処理するための OneDrive フォルダです。"
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
                help="Power Automate 上に表示されるフローの名前です。"
                error={fieldError("flowName")}
              >
                <Input id="flowName" {...form.register("flowName")} />
              </Field>
            </div>
          )}

          {step.id === "schedule" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--brand-ring)] bg-[var(--brand-softer)] px-6 py-5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">
                  {scheduleLabel}
                </span>
                <div className="time-display">
                  <span className="time-display-value">
                    {String(hour).padStart(2, "0")}
                  </span>
                  <span className="time-display-value">:</span>
                  <span className="time-display-value">
                    {String(minute).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <Field label="実行頻度">
                <div className="segment">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      data-active={values.scheduleFrequency === opt.value}
                      className="segment-item"
                      onClick={() =>
                        form.setValue("scheduleFrequency", opt.value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>

              {values.scheduleFrequency === "week" && (
                <Field
                  label="実行する曜日"
                  error={fieldError("scheduleWeekdays")}
                >
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        className="preset-chip w-10 !px-0 text-center"
                        data-active={weekdays.includes(d.value)}
                        onClick={() => toggleWeekday(d.value)}
                        aria-pressed={weekdays.includes(d.value)}
                      >
                        {d.short}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {values.scheduleFrequency === "month" && (
                <Field
                  label="実行日"
                  help="毎月この日に実行します。31日を指定した場合、月末で調整されます。"
                >
                  <div className="flex items-center justify-center gap-4 rounded-xl border border-border bg-card py-3">
                    <button
                      type="button"
                      className="step-btn"
                      onClick={() => setDay(day - 1)}
                      aria-label="日を減らす"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="time-field-value !text-2xl">{day}日</span>
                    <button
                      type="button"
                      className="step-btn"
                      onClick={() => setDay(day + 1)}
                      aria-label="日を増やす"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </Field>
              )}

              <div>
                <p className="field-label mb-2">よく使う時刻</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_PRESETS.map((preset) => {
                    const active = hour === preset.h && minute === preset.m;
                    return (
                      <button
                        key={`${preset.h}-${preset.m}`}
                        type="button"
                        className="preset-chip"
                        data-active={active}
                        onClick={() => setTime(preset.h, preset.m)}
                      >
                        {formatTime(preset.h, preset.m)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TimeStepper
                  label="時"
                  value={hour}
                  onInc={() => setHour(hour + 1)}
                  onDec={() => setHour(hour - 1)}
                />
                <TimeStepper
                  label="分"
                  value={minute}
                  onInc={() => setMinute(minute - (minute % 5) + 5)}
                  onDec={() =>
                    setMinute(
                      minute % 5 === 0 ? minute - 5 : minute - (minute % 5),
                    )
                  }
                />
              </div>

              <Field
                label="タイムゾーン"
                htmlFor="timeZone"
                help="フローを実行する基準のタイムゾーンです。日本国内のみなら東京を選択します。"
                error={fieldError("timeZone")}
              >
                <select
                  id="timeZone"
                  className="tz-select"
                  {...form.register("timeZone")}
                >
                  {TIME_ZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
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
                  <p className="text-xs text-muted-foreground">
                    この設定は「保存済み」に自動保存されました
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
                        className="grid grid-cols-[4.5rem_1fr] gap-3 px-4 py-3"
                        style={{
                          borderTop:
                            index === 0 ? undefined : "1px solid var(--border)",
                        }}
                      >
                        <dt className="summary-key whitespace-nowrap">{term}</dt>
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
                      const label = rs.schedule
                        ? `${scheduleText} に自動実行`
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
          </motion.div>
        </AnimatePresence>

        {/* Footer navigation */}
        {!(isLast && exportedFile) && (
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            {stepIndex === 0 ? (
              <span aria-hidden />
            ) : (
              <Button variant="ghost" onClick={goBack} disabled={isExporting}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                戻る
              </Button>
            )}

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
