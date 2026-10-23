import { NextResponse } from "next/server";
import { loadBoard, saveSubmission } from "../../lib/report-store";
import { validateSubmission } from "../../lib/report-week";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function firstParam(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const board = await loadBoard(firstParam(url.searchParams.get("week")), firstParam(url.searchParams.get("day")));
  return NextResponse.json(board);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Choose a party chief and a report date." }, { status: 400 });
  }

  const parsed = validateSubmission(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await saveSubmission(parsed.value);
  return NextResponse.json({ ok: true });
}
