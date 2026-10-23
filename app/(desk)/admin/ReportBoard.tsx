"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { findChief } from "../../lib/party-chiefs";
import {
  applySubmission,
  cellState,
  isSubmitted,
  mondayOfWeek,
  type BoardData,
  type BoardDay,
  type CellState,
  type Submission,
} from "../../lib/report-week";

const STATE_LABEL: Record<CellState, string> = {
  submitted: "Received",
  missing: "Missing",
  due: "Due",
  upcoming: "Not due",
};

function cellKey(chiefId: string, date: string): string {
  return `${chiefId}|${date}`;
}

function plural(count: number, singular: string, pluralLabel = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralLabel}`;
}

export function ReportBoard({ board }: { board: BoardData }) {
  const [submissions, setSubmissions] = useState<Submission[]>(board.submissions);
  const [selectedDay, setSelectedDay] = useState(board.selectedDay);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const submissionsRef = useRef(submissions);
  const pendingRef = useRef(pendingKeys);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    submissionsRef.current = submissions;
  }, [submissions]);

  useEffect(() => {
    pendingRef.current = pendingKeys;
  }, [pendingKeys]);

  const thisWeek = mondayOfWeek(board.today);
  const selected = board.days.find((day) => day.date === selectedDay) ?? board.days[0];
  const selectedIndex = board.days.findIndex((day) => day.date === selected.date);

  function stateFor(chiefId: string, date: string): CellState {
    return cellState(date, board.today, isSubmitted(submissions, chiefId, date));
  }

  function dayOutstanding(day: BoardDay): number {
    return board.crews.reduce(
      (total, crew) =>
        total +
        crew.chiefs.filter((chief) => {
          const state = stateFor(chief.id, day.date);
          return state === "missing" || state === "due";
        }).length,
      0,
    );
  }

  function dayReceived(day: BoardDay): number {
    return board.crews.reduce(
      (total, crew) =>
        total + crew.chiefs.filter((chief) => stateFor(chief.id, day.date) === "submitted").length,
      0,
    );
  }

  function selectDay(date: string) {
    setSelectedDay(date);
    const url = new URL(window.location.href);
    url.searchParams.set("week", board.weekStart);
    url.searchParams.set("day", date);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (selectedIndex + direction + board.days.length) % board.days.length;
    selectDay(board.days[nextIndex].date);
    tabRefs.current[nextIndex]?.focus();
  }

  function toggle(chiefId: string, date: string) {
    const key = cellKey(chiefId, date);
    if (pendingRef.current.has(key)) return;

    const currently = isSubmitted(submissionsRef.current, chiefId, date);
    const nextSubmitted = !currently;
    const existing = submissionsRef.current.find(
      (submission) => submission.chiefId === chiefId && submission.date === date,
    );
    const optimistic = applySubmission(
      submissionsRef.current,
      chiefId,
      date,
      nextSubmitted,
      existing?.submittedAt ?? new Date().toISOString(),
    );
    submissionsRef.current = optimistic;
    pendingRef.current = new Set(pendingRef.current).add(key);
    setSubmissions(optimistic);
    setPendingKeys(new Set(pendingRef.current));
    setError("");

    void (async () => {
      try {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chiefId, date, submitted: nextSubmitted }),
        });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          throw new Error(payload?.error || "Could not save that change.");
        }
        const chief = findChief(chiefId);
        const day = board.days.find((item) => item.date === date);
        setStatus(
          nextSubmitted
            ? `${chief?.name ?? "Report"} marked received for ${day?.weekday ?? "that day"}.`
            : `${chief?.name ?? "Report"} marked missing for ${day?.weekday ?? "that day"}.`,
        );
      } catch (caught) {
        const restored = applySubmission(
          submissionsRef.current,
          chiefId,
          date,
          currently,
          existing?.submittedAt ?? "",
        );
        submissionsRef.current = restored;
        setSubmissions(restored);
        setError(caught instanceof Error ? caught.message : "Could not save that change.");
      } finally {
        const nextPending = new Set(pendingRef.current);
        nextPending.delete(key);
        pendingRef.current = nextPending;
        setPendingKeys(nextPending);
      }
    })();
  }

  const dueToday = board.days
    .filter((day) => day.date === board.today)
    .reduce((total, day) => total + dayOutstanding(day), 0);
  const missingEarlier = board.days
    .filter((day) => day.date < board.today)
    .reduce((total, day) => total + dayOutstanding(day), 0);
  const receivedToday = board.days
    .filter((day) => day.date === board.today)
    .reduce((total, day) => total + dayReceived(day), 0);
  const missingClosed = board.days.reduce((total, day) => total + dayOutstanding(day), 0);
  const receivedClosed = board.days.reduce((total, day) => total + dayReceived(day), 0);
  const finishedWeek = board.crews.reduce(
    (total, crew) =>
      total +
      crew.chiefs.filter((chief) => board.days.every((day) => stateFor(chief.id, day.date) === "submitted"))
        .length,
    0,
  );

  return (
    <>
      <div className="desk-heading">
        <div>
          <p className="desk-kicker">Admin</p>
          <h1>Who has not submitted</h1>
          <p className="desk-lead">
            Party chiefs turn in a report each Monday through Saturday. Pick a day to see who is still out,
            or scan the week below.
          </p>
        </div>
      </div>

      <div className="desk-weekbar">
        <Link className="desk-weeklink" href={`/admin?week=${board.previousWeek}`}>
          Previous week
        </Link>
        <div className="desk-weeklabel">
          <p>Week of {board.weekLabel}</p>
          <p>Today is {board.todayLabel}</p>
        </div>
        <Link className="desk-weeklink" href={`/admin?week=${board.nextWeek}`}>
          Next week
        </Link>
      </div>
      {board.weekStart !== thisWeek ? (
        <p className="desk-back">
          <Link href="/admin">Back to this week</Link>
        </p>
      ) : null}

      {board.justEnded ? (
        <p className="desk-note">
          No report is due on Sunday. This is the Monday–Saturday week that ended yesterday.
        </p>
      ) : null}
      {board.phase === "future" ? (
        <p className="desk-note">This week has not started. Nobody is late yet.</p>
      ) : null}

      <section className="desk-stats" aria-label="Week summary">
        {board.phase === "current" ? (
          <>
            <Stat value={String(dueToday)} label="Have not submitted today" tone={dueToday ? "alert" : "ok"} />
            <Stat value={String(missingEarlier)} label="Missing reports from earlier days" tone={missingEarlier ? "alert" : "ok"} />
            <Stat value={String(receivedToday)} label="Received today" tone="ok" />
          </>
        ) : null}
        {board.phase === "closed" ? (
          <>
            <Stat value={String(missingClosed)} label="Missing reports this week" tone={missingClosed ? "alert" : "ok"} />
            <Stat value={String(receivedClosed)} label="Reports received" tone="ok" />
            <Stat value={String(finishedWeek)} label="Finished every day" tone="ok" />
          </>
        ) : null}
        {board.phase === "future" ? (
          <>
            <Stat value="0" label="Reports due so far" tone="later" />
            <Stat value={String(receivedClosed)} label="Turned in early" tone="ok" />
            <Stat value="6" label="Reporting days" tone="later" />
          </>
        ) : null}
      </section>

      <div className="desk-tabs" role="tablist" aria-label="Days this week">
        {board.days.map((day, index) => {
          const outstanding = dayOutstanding(day);
          const received = dayReceived(day);
          const upcoming = day.date > board.today;
          let detail = `${outstanding} left`;
          if (upcoming) detail = received > 0 ? `${received} in` : "Later";
          else if (outstanding === 0) detail = "All in";
          else if (day.date === board.today) detail = `${outstanding} due`;

          return (
            <button
              key={day.date}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`day-tab-${day.date}`}
              className="desk-tab"
              aria-selected={day.date === selected.date}
              aria-controls="day-panel"
              tabIndex={day.date === selected.date ? 0 : -1}
              data-day={day.date}
              onClick={() => selectDay(day.date)}
              onKeyDown={onTabKeyDown}
            >
              <span className="desk-tab-name">{day.shortWeekday}</span>
              <span className="desk-tab-date">{day.monthDay.replace(/^[A-Za-z]+ /, "")}</span>
              <span className={`desk-tab-detail is-${upcoming ? "upcoming" : outstanding === 0 ? "submitted" : day.date === board.today ? "due" : "missing"}`}>
                {detail}
              </span>
            </button>
          );
        })}
      </div>

      <section
        className="desk-panel"
        role="tabpanel"
        id="day-panel"
        aria-labelledby={`day-tab-${selected.date}`}
      >
        <div className="desk-panel-head">
          <h2>{selected.fullLabel}</h2>
          <DaySummary day={selected} today={board.today} outstanding={dayOutstanding(selected)} received={dayReceived(selected)} />
        </div>

        {error ? (
          <p className="desk-error" role="alert">
            {error}
          </p>
        ) : null}
        <p className="desk-live" role="status">
          {status}
        </p>

        <DayLists
          board={board}
          day={selected}
          stateFor={stateFor}
          pendingKeys={pendingKeys}
          onToggle={toggle}
        />
      </section>

      <section className="desk-grid-section">
        <div className="desk-panel-head">
          <h2>Whole week</h2>
          <p>Each cell is one report. Mark it received when it comes in. Select it again to undo.</p>
        </div>
        <div className="desk-legend" aria-hidden="true">
          <span className="is-missing">Missing</span>
          <span className="is-due">Due today</span>
          <span className="is-submitted">Received</span>
          <span className="is-upcoming">Not due yet</span>
        </div>
        <div className="desk-scroll">
          <table className="desk-grid">
            <caption className="desk-sr">
              Report status for {board.weekLabel}, Monday through Saturday
            </caption>
            <thead>
              <tr>
                <th scope="col" className="desk-namehead">
                  Party chief
                </th>
                {board.days.map((day) => (
                  <th
                    key={day.date}
                    scope="col"
                    className={`desk-dayhead${day.date === selected.date ? " is-selected" : ""}`}
                    aria-current={day.date === board.today ? "date" : undefined}
                  >
                    <span className="desk-col-weekday">{day.weekday}</span>
                    <span className="desk-col-date">{day.monthDay}</span>
                  </th>
                ))}
              </tr>
            </thead>
            {board.crews.map((crew) => (
              <CrewRows
                key={crew.id}
                crew={crew}
                days={board.days}
                selectedDate={selected.date}
                stateFor={stateFor}
                pendingKeys={pendingKeys}
                onToggle={toggle}
              />
            ))}
          </table>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: "alert" | "ok" | "later" }) {
  return (
    <article className={`desk-stat is-${tone}`}>
      <p className="desk-stat-value">{value}</p>
      <p className="desk-stat-label">{label}</p>
    </article>
  );
}

function DaySummary({
  day,
  today,
  outstanding,
  received,
}: {
  day: BoardDay;
  today: string;
  outstanding: number;
  received: number;
}) {
  if (day.date > today) {
    return (
      <p>
        {received > 0
          ? `${plural(received, "report")} already turned in. Everyone else is not due yet.`
          : "This report is not due yet."}
      </p>
    );
  }
  if (outstanding === 0) {
    return <p>Everyone has submitted for this day.</p>;
  }
  return <p>{plural(outstanding, "party chief")} {outstanding === 1 ? "has" : "have"} not submitted.</p>;
}

function DayLists({
  board,
  day,
  stateFor,
  pendingKeys,
  onToggle,
}: {
  board: BoardData;
  day: BoardDay;
  stateFor: (chiefId: string, date: string) => CellState;
  pendingKeys: Set<string>;
  onToggle: (chiefId: string, date: string) => void;
}) {
  const upcoming = day.date > board.today;
  const outstandingCrews = board.crews
    .map((crew) => ({
      ...crew,
      chiefs: crew.chiefs.filter((chief) => {
        const state = stateFor(chief.id, day.date);
        return state === "missing" || state === "due";
      }),
    }))
    .filter((crew) => crew.chiefs.length > 0);
  const receivedCrews = board.crews
    .map((crew) => ({
      ...crew,
      chiefs: crew.chiefs.filter((chief) => stateFor(chief.id, day.date) === "submitted"),
    }))
    .filter((crew) => crew.chiefs.length > 0);

  return (
    <>
      {upcoming ? (
        <p className="desk-empty">Names show up here once this day arrives and a report is still missing.</p>
      ) : outstandingCrews.length === 0 ? (
        <p className="desk-empty">Nothing outstanding for {day.weekday}.</p>
      ) : (
        <div className="desk-crews">
          {outstandingCrews.map((crew) => (
            <section key={crew.id} className="desk-crew">
              <h3>
                {crew.name}
                <span>{crew.chiefs.length}</span>
              </h3>
              <ul className="desk-people">
                {crew.chiefs.map((chief) => {
                  const key = cellKey(chief.id, day.date);
                  const pending = pendingKeys.has(key);
                  return (
                    <li key={chief.id} className="desk-person">
                      <span>{chief.name}</span>
                      <button
                        type="button"
                        data-chief={chief.id}
                        data-date={day.date}
                        data-state={stateFor(chief.id, day.date)}
                        disabled={pending}
                        onClick={() => onToggle(chief.id, day.date)}
                      >
                        {pending ? "Saving" : "Mark received"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {receivedCrews.length > 0 ? (
        <details className="desk-received">
          <summary>
            Already submitted ({receivedCrews.reduce((total, crew) => total + crew.chiefs.length, 0)})
          </summary>
          {receivedCrews.map((crew) => (
            <section key={crew.id} className="desk-crew">
              <h3>{crew.name}</h3>
              <ul className="desk-people">
                {crew.chiefs.map((chief) => {
                  const key = cellKey(chief.id, day.date);
                  const pending = pendingKeys.has(key);
                  return (
                    <li key={chief.id} className="desk-person">
                      <span>{chief.name}</span>
                      <button
                        type="button"
                        className="desk-undo"
                        data-chief={chief.id}
                        data-date={day.date}
                        data-state="submitted"
                        disabled={pending}
                        onClick={() => onToggle(chief.id, day.date)}
                      >
                        {pending ? "Saving" : "Undo"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </details>
      ) : null}
    </>
  );
}

function CrewRows({
  crew,
  days,
  selectedDate,
  stateFor,
  pendingKeys,
  onToggle,
}: {
  crew: BoardData["crews"][number];
  days: BoardDay[];
  selectedDate: string;
  stateFor: (chiefId: string, date: string) => CellState;
  pendingKeys: Set<string>;
  onToggle: (chiefId: string, date: string) => void;
}) {
  return (
    <tbody>
      <tr className="desk-crewrow">
        <th scope="rowgroup" colSpan={7}>
          {crew.name}
        </th>
      </tr>
      {crew.chiefs.map((chief) => (
        <tr key={chief.id}>
          <th scope="row">{chief.name}</th>
          {days.map((day) => {
            const state = stateFor(chief.id, day.date);
            const key = cellKey(chief.id, day.date);
            const pending = pendingKeys.has(key);
            const action =
              state === "submitted" ? "Undo the received mark." : "Mark the report received.";
            return (
              <td key={day.date} className={day.date === selectedDate ? "is-selected" : undefined}>
                <button
                  type="button"
                  className={`desk-cell is-${state}`}
                  data-chief={chief.id}
                  data-date={day.date}
                  data-state={state}
                  aria-label={`${chief.name}, ${day.fullLabel}, ${STATE_LABEL[state]}. ${action}`}
                  disabled={pending}
                  onClick={() => onToggle(chief.id, day.date)}
                >
                  {pending ? "Saving" : STATE_LABEL[state]}
                </button>
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}
