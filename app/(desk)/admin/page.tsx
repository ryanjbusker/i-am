import { DeskFrame } from "../DeskFrame";
import { loadBoard } from "../../lib/report-store";
import { ReportBoard } from "./ReportBoard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Search = {
  week?: string | string[];
  day?: string | string[];
};

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = (await searchParams) ?? {};
  const board = await loadBoard(one(params.week), one(params.day));

  return (
    <DeskFrame>
      <ReportBoard key={`${board.weekStart}:${board.selectedDay}`} board={board} />
    </DeskFrame>
  );
}
