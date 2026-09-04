"use client";

import { FormEvent, useState } from "react";
import { EnvelopeReveal } from "./EnvelopeReveal";

type Invitation = {
  invitationId: string;
  token: string;
  guests: Array<{
    id: number;
    firstName: string;
    lastName: string;
  }>;
};

export function NameSearch() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [opened, setOpened] = useState<Invitation | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = name.trim();
    if (!normalized) {
      setMessage("Please enter a first name, last name, or full name.");
      setInvitations(null);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/rsvp/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: normalized }),
      });
      const payload = (await response.json()) as { invitations?: Invitation[]; error?: string };
      if (!response.ok || !payload.invitations?.length) {
        setInvitations([]);
        throw new Error(payload.error ?? "No invitations matched that name.");
      }

      if (payload.invitations.length === 1) {
        setInvitations(payload.invitations);
        setOpened(payload.invitations[0]);
        return;
      }

      setInvitations(payload.invitations);
      setMessage(`Found ${payload.invitations.length} invitations. Choose yours to open.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="lookup-form" onSubmit={submit}>
        <label htmlFor="guest-name">Name</label>
        <input
          id="guest-name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setMessage("");
          }}
          autoComplete="name"
          maxLength={100}
          disabled={loading}
          placeholder="First name, last name, or full name"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Finding invitation…" : "Find invitation"}
        </button>
        <p className={`form-message${invitations && invitations.length > 0 ? " success" : ""}`} role="status">
          {message}
        </p>
      </form>

      {invitations && invitations.length > 0 ? (
        <ul className="invitation-results">
          {invitations.map((invitation) => (
            <li key={invitation.token} className="invitation-result">
              <p className="invitation-party">{partyName(invitation)}</p>
              <button type="button" className="link-button" onClick={() => setOpened(invitation)}>
                Open this invitation
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {opened ? (
        <EnvelopeReveal
          token={opened.token}
          addressedTo={partyName(opened)}
          onClose={() => setOpened(null)}
        />
      ) : null}
    </>
  );
}

function partyName(invitation: Invitation) {
  return invitation.guests.map((guest) => `${guest.firstName} ${guest.lastName}`).join(" & ");
}
