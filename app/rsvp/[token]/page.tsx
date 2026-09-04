import type { Metadata } from "next";
import { RsvpForm } from "./RsvpForm";

export const metadata: Metadata = {
  title: "RSVP",
  robots: { index: false, follow: false },
};

export default async function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="rsvp-page">
      <RsvpForm token={token} />
    </main>
  );
}
