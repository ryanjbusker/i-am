import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  applySubmission,
  buildBoard,
  chicagoToday,
  type BoardData,
  type Submission,
  type SubmissionInput,
} from "./report-week";

type StoreFile = {
  submissions: Submission[];
};

function storePath(): string {
  return process.env.REPORTS_DATA_PATH || path.join(process.cwd(), "data", "report-submissions.json");
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readRaw(): Promise<Submission[]> {
  try {
    const text = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(text) as StoreFile;
    if (!parsed || !Array.isArray(parsed.submissions)) return [];
    return parsed.submissions.filter(
      (submission) =>
        submission &&
        typeof submission.chiefId === "string" &&
        typeof submission.date === "string" &&
        typeof submission.submittedAt === "string",
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeRaw(submissions: Submission[]): Promise<void> {
  const file = storePath();
  await mkdir(path.dirname(file), { recursive: true });
  const payload: StoreFile = { submissions };
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function loadBoard(weekParam?: string, dayParam?: string): Promise<BoardData> {
  return enqueue(async () => {
    const submissions = await readRaw();
    return buildBoard({
      today: chicagoToday(),
      weekParam,
      dayParam,
      submissions,
    });
  });
}

export function saveSubmission(input: SubmissionInput): Promise<void> {
  return enqueue(async () => {
    const submissions = await readRaw();
    const existing = submissions.find(
      (submission) => submission.chiefId === input.chiefId && submission.date === input.date,
    );
    const submittedAt = existing?.submittedAt ?? new Date().toISOString();
    await writeRaw(
      applySubmission(submissions, input.chiefId, input.date, input.submitted, submittedAt),
    );
  });
}
