import { Navigation } from "./components/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="landing-page">
        <section className="hero-section">
          <div className="floral-accent floral-top-left"></div>
          <div className="floral-accent floral-top-right"></div>
          <div className="hero-content">
            <p className="label">WE'RE GETTING MARRIED</p>
            <h1 className="couple-names">Ryan &amp; Eleanor</h1>
            <div className="date-location">
              <p className="wedding-month">April 2027</p>
              <p className="wedding-location">Corpus Christi, Texas</p>
            </div>
          </div>
          <div className="floral-accent floral-bottom-left"></div>
          <div className="floral-accent floral-bottom-right"></div>
        </section>
      </main>
    </>
  );
}
