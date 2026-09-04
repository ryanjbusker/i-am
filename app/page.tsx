import { NameSearch } from "./components/NameSearch";

export default function Home() {
  return (
    <main className="lookup-page search-page">
      <section className="card lookup-card">
        <p className="label">RSVP test</p>
        <h1>Enter your name</h1>
        <p className="description">
          If it matches a guest, we’ll load everyone on that invitation.
        </p>
        <NameSearch />
      </section>
    </main>
  );
}
