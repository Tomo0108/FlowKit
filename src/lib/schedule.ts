export const scheduleFrequencies = ["day", "weekday", "week", "month"] as const;

export type ScheduleFrequency = (typeof scheduleFrequencies)[number];

export const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string }[] = [
  { value: "day", label: "毎日" },
  { value: "weekday", label: "平日" },
  { value: "week", label: "毎週" },
  { value: "month", label: "毎月" },
];

export const WEEKDAYS: { value: string; short: string }[] = [
  { value: "Monday", short: "月" },
  { value: "Tuesday", short: "火" },
  { value: "Wednesday", short: "水" },
  { value: "Thursday", short: "木" },
  { value: "Friday", short: "金" },
  { value: "Saturday", short: "土" },
  { value: "Sunday", short: "日" },
];

const WEEKDAY_SHORT: Record<string, string> = Object.fromEntries(
  WEEKDAYS.map((w) => [w.value, w.short]),
);

export const WEEKDAY_VALUES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function describeSchedule(args: {
  frequency: ScheduleFrequency;
  hour: number;
  minute: number;
  weekdays?: string[];
  day?: number;
}): string {
  const time = formatTime(args.hour, args.minute);
  switch (args.frequency) {
    case "day":
      return `毎日 ${time}`;
    case "weekday":
      return `平日 ${time}`;
    case "week": {
      const days = (args.weekdays ?? [])
        .map((d) => WEEKDAY_SHORT[d])
        .filter(Boolean)
        .join("・");
      return days ? `毎週 ${days} ${time}` : `毎週 ${time}`;
    }
    case "month":
      return `毎月 ${args.day ?? 1}日 ${time}`;
    default:
      return `毎日 ${time}`;
  }
}
