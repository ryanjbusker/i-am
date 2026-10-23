"use client";

import { useMemo, useState } from "react";
import type { Crew } from "../../lib/party-chiefs";
import { findChief } from "../../lib/party-chiefs";
import { isSubmitted, weekdayIndex, type Submission } from "../../lib/report-week";

export function SubmitReport({
  today,
  todayLabel,
  crews,
  submissions,
}: {
  today: string;
  todayLabel: string;
  crews: Crew[];
  submissions: Submission[];
}) {
  const [chiefId, setChiefId] = useState("");
  const [records, setRecords] = useState(submissions);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const sunday = weekdayIndex(today) === 0;
  const chief = findChief(chiefId);
  const alreadyIn = useMemo(
    () => (chiefId ? isSubmitted(records, chiefId, today) : false),
    [chiefId, records, today],
  );

  async function send(submitted: boolean) {
    if (!chiefId || pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chiefId, date: today, submitted }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Could not save the report.");
      }
      setRecords((current) => {
        const next = current.filter((record) => !(record.chiefId === chiefId && record.date === today));
        if (submitted) next.push({ chiefId, date: today, submittedAt: new Date().toISOString() });
        return next;
      });
      setStatus(
        submitted
          ? `${chief?.name ?? "Your report"} is in for ${todayLabel}.`
          : `${chief?.name ?? "Your report"} was removed for ${todayLabel}.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the report.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="desk-submit">
      <p className="desk-kicker">Party chief</p>
      <h1>Submit today&apos;s report</h1>
      <p className="desk-lead">Reports are due Monday through Saturday. Today is {todayLabel}.</p>

      {sunday ? (
        <p className="desk-note">No report is due on Sunday. The next one is Monday.</p>
      ) : (
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send(true);
          }}
        >
          <label htmlFor="chief">Your name</label>
          <select
            id="chief"
            name="chief"
            value={chiefId}
            onChange={(event) => {
              setChiefId(event.target.value);
              setStatus("");
              setError("");
            }}
          >
            <option value="">Select your name</option>
            {crews.map((crew) => (
              <optgroup key={crew.id} label={crew.name}>
                {crew.chiefs.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {chief && alreadyIn ? (
            <p className="desk-note">{chief.name} already submitted for today.</p>
          ) : null}
          {error ? (
            <p className="desk-error" role="alert">
              {error}
            </p>
          ) : null}
          <p className="desk-live" role="status">
            {status}
          </p>

          <div className="desk-form-actions">
            <button type="submit" className="desk-primary" disabled={!chiefId || pending || alreadyIn}>
              {pending ? "Saving" : "Submit report"}
            </button>
            {alreadyIn ? (
              <button type="button" className="desk-undo" disabled={pending} onClick={() => void send(false)}>
                Undo submission
              </button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
