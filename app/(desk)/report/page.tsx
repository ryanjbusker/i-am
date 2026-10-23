import { DeskFrame } from "../DeskFrame";
import { loadBoard } from "../../lib/report-store";
import { SubmitReport } from "./SubmitReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReportPage() {
  const board = await loadBoard();

  return (
    <DeskFrame>
      <SubmitReport today={board.today} todayLabel={board.todayLabel} crews={board.crews} submissions={board.submissions} />
    </DeskFrame>
  );
}
