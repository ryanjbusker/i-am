"use client";

import { FormEvent, useEffect, useState } from "react";

type Guest = {
  id: number;
  firstName: string;
  lastName: string;
  rsvp: null | { attending: boolean };
};

type Invitation = {
  guests: Guest[];
  plusOneAllowed: boolean;
  plusOne: null | { name: string; attending: boolean };
  hasResponded: boolean;
};

export function RsvpForm({ token }: { token: string }) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [plusOneAttending, setPlusOneAttending] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "saved" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/rsvp/${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as Invitation & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Invitation not found.");
        setInvitation(payload);
        setAnswers(Object.fromEntries(payload.guests.map((guest) => [guest.id, guest.rsvp?.attending ?? null])));
        setPlusOneAttending(payload.plusOne?.attending ?? false);
        setPlusOneName(payload.plusOne?.name ?? "");
        setStatus("ready");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setMessage(error instanceof Error ? error.message : "Unable to load the invitation.");
        setStatus("error");
      });
    return () => controller.abort();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invitation) return;
    const unanswered = invitation.guests.find((guest) => answers[guest.id] === null);
    if (unanswered) {
      setMessage(`Please answer for ${unanswered.firstName}.`);
      return;
    }
    if (plusOneAttending && !plusOneName.trim()) {
      setMessage("Please enter your guest’s name.");
      return;
    }

    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch(`/api/rsvp/${encodeURIComponent(token)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          responses: invitation.guests.map((guest) => ({
            guestId: guest.id,
            attending: answers[guest.id],
          })),
          plusOne: invitation.plusOneAllowed
            ? { attending: plusOneAttending, name: plusOneName.trim() }
            : null,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to save your RSVP.");
      setStatus("saved");
      setMessage("Your RSVP has been saved.");
    } catch (error) {
      setStatus("ready");
      setMessage(error instanceof Error ? error.message : "Unable to save your RSVP.");
    }
  }

  if (status === "loading") {
    return <section className="card"><p>Loading invitation…</p></section>;
  }

  if (status === "error" || !invitation) {
    return (
      <section className="card">
        <h1>Invitation not found</h1>
        <p>{message}</p>
        <a href="/">Try another name</a>
      </section>
    );
  }

  return (
    <form className="card rsvp-form" onSubmit={submit}>
      <p className="label">Wedding RSVP</p>
      <h1>{invitation.hasResponded ? "Update your RSVP" : "Will you be attending?"}</h1>
      <p className="description">Please answer for each person on your invitation.</p>

      <div className="guest-list">
        {invitation.guests.map((guest) => (
          <fieldset key={guest.id}>
            <legend>{guest.firstName} {guest.lastName}</legend>
            <label>
              <input
                type="radio"
                name={`guest-${guest.id}`}
                checked={answers[guest.id] === true}
                onChange={() => {
                  setAnswers((current) => ({ ...current, [guest.id]: true }));
                  setMessage("");
                }}
              />
              Accepts
            </label>
            <label>
              <input
                type="radio"
                name={`guest-${guest.id}`}
                checked={answers[guest.id] === false}
                onChange={() => {
                  setAnswers((current) => ({ ...current, [guest.id]: false }));
                  setMessage("");
                }}
              />
              Declines
            </label>
          </fieldset>
        ))}
      </div>

      {invitation.plusOneAllowed ? (
        <fieldset className="plus-one">
          <legend>Plus-one</legend>
          <label>
            <input
              type="checkbox"
              checked={plusOneAttending}
              onChange={(event) => setPlusOneAttending(event.target.checked)}
            />
            I am bringing a guest
          </label>
          {plusOneAttending ? (
            <label className="text-field">
              Guest’s full name
              <input value={plusOneName} maxLength={200} onChange={(event) => setPlusOneName(event.target.value)} />
            </label>
          ) : null}
        </fieldset>
      ) : null}

      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : invitation.hasResponded ? "Update RSVP" : "Submit RSVP"}
      </button>
      <p className={status === "saved" ? "form-message success" : "form-message"} role="status">{message}</p>
      <a href="/">Search another name</a>
    </form>
  );
}
