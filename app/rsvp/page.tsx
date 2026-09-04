import { Navigation } from "../components/Navigation";
import { NameSearch } from "../components/NameSearch";

export default function RsvpSearchPage() {
  return (
    <>
      <Navigation />
      <main className="lookup-page search-page">
        <section className="card lookup-card">
          <p className="label">RSVP</p>
          <h1>Enter your name</h1>
          <p className="description">
            If it matches a guest, we'll load everyone on that invitation.
          </p>
          <NameSearch />
        </section>
      </main>
    </>
  );
}
