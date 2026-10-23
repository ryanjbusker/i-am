import { crews, findChief, type Crew } from "./party-chiefs";

export type Submission = {
  chiefId: string;
  date: string;
  submittedAt: string;
};

export type CellState = "submitted" | "missing" | "due" | "upcoming";

export type WeekPhase = "future" | "current" | "closed";

export type BoardDay = {
  date: string;
  weekday: string;
  shortWeekday: string;
  monthDay: string;
  fullLabel: string;
};

export type BoardData = {
  weekStart: string;
  weekLabel: string;
  previousWeek: string;
  nextWeek: string;
  today: string;
  todayLabel: string;
  justEnded: boolean;
  phase: WeekPhase;
  selectedDay: string;
  days: BoardDay[];
  crews: Crew[];
  submissions: Submission[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDate(value: string): string | null {
  if (!ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

export function chicagoToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Could not resolve today's date.");
  }
  return `${year}-${month}-${day}`;
}

function dateAtNoon(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function addDays(iso: string, days: number): string {
  const date = dateAtNoon(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function weekdayIndex(iso: string): number {
  return dateAtNoon(iso).getUTCDay();
}

export function mondayOfWeek(iso: string): string {
  const daysSinceMonday = (weekdayIndex(iso) + 6) % 7;
  return addDays(iso, -daysSinceMonday);
}

function format(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(dateAtNoon(iso));
}

export function fullDateLabel(iso: string): string {
  return format(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function weekRangeLabel(monday: string): string {
  const saturday = addDays(monday, 5);
  const startMonth = format(monday, { month: "long" });
  const endMonth = format(saturday, { month: "long" });
  const startDay = format(monday, { day: "numeric" });
  const endDay = format(saturday, { day: "numeric" });
  const startYear = format(monday, { year: "numeric" });
  const endYear = format(saturday, { year: "numeric" });

  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
}

export function reportingDates(monday: string): string[] {
  return Array.from({ length: 6 }, (_, index) => addDays(monday, index));
}

export function weekPhase(monday: string, today: string): WeekPhase {
  const saturday = addDays(monday, 5);
  if (today < monday) return "future";
  if (today > saturday) return "closed";
  return "current";
}

function boardDay(iso: string): BoardDay {
  return {
    date: iso,
    weekday: format(iso, { weekday: "long" }),
    shortWeekday: format(iso, { weekday: "short" }),
    monthDay: format(iso, { month: "short", day: "numeric" }),
    fullLabel: format(iso, { weekday: "long", month: "long", day: "numeric" }),
  };
}

function defaultSelectedDay(monday: string, today: string, phase: WeekPhase): string {
  if (phase === "current") return today;
  if (phase === "future") return monday;
  return addDays(monday, 5);
}

export function buildBoard(input: {
  today: string;
  weekParam?: string;
  dayParam?: string;
  submissions: Submission[];
}): BoardData {
  const requestedWeek = input.weekParam ? parseIsoDate(input.weekParam) : null;
  const anchor = requestedWeek ?? input.today;
  const weekStart = mondayOfWeek(anchor);
  const phase = weekPhase(weekStart, input.today);
  const days = reportingDates(weekStart).map(boardDay);
  const requestedDay = input.dayParam ? parseIsoDate(input.dayParam) : null;
  const selectedDay =
    requestedDay && days.some((day) => day.date === requestedDay)
      ? requestedDay
      : defaultSelectedDay(weekStart, input.today, phase);
  const saturday = addDays(weekStart, 5);

  return {
    weekStart,
    weekLabel: weekRangeLabel(weekStart),
    previousWeek: addDays(weekStart, -7),
    nextWeek: addDays(weekStart, 7),
    today: input.today,
    todayLabel: fullDateLabel(input.today),
    justEnded: input.today === addDays(saturday, 1),
    phase,
    selectedDay,
    days,
    crews,
    submissions: input.submissions.filter(
      (submission) => submission.date >= weekStart && submission.date <= saturday,
    ),
  };
}

export function isSubmitted(submissions: Submission[], chiefId: string, date: string): boolean {
  return submissions.some((submission) => submission.chiefId === chiefId && submission.date === date);
}

export function cellState(date: string, today: string, submitted: boolean): CellState {
  if (submitted) return "submitted";
  if (date > today) return "upcoming";
  if (date === today) return "due";
  return "missing";
}

export function applySubmission(
  submissions: Submission[],
  chiefId: string,
  date: string,
  submitted: boolean,
  submittedAt: string,
): Submission[] {
  const next = submissions.filter(
    (submission) => !(submission.chiefId === chiefId && submission.date === date),
  );
  if (submitted) next.push({ chiefId, date, submittedAt });
  return next;
}

export type SubmissionInput = {
  chiefId: string;
  date: string;
  submitted: boolean;
};

export function validateSubmission(
  body: unknown,
): { ok: true; value: SubmissionInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Choose a party chief and a report date." };
  }

  const record = body as Record<string, unknown>;
  if (typeof record.chiefId !== "string" || !findChief(record.chiefId)) {
    return { ok: false, error: "That party chief is not on the list." };
  }
  if (typeof record.date !== "string" || !parseIsoDate(record.date)) {
    return { ok: false, error: "That date is not valid." };
  }
  if (weekdayIndex(record.date) === 0) {
    return { ok: false, error: "Reports are not due on Sunday." };
  }
  if (typeof record.submitted !== "boolean") {
    return { ok: false, error: "Say whether the report was received." };
  }

  return {
    ok: true,
    value: {
      chiefId: record.chiefId,
      date: record.date,
      submitted: record.submitted,
    },
  };
}
