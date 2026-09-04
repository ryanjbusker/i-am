import { Navigation } from "./components/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="landing-page">
        <section className="hero-section">
          <div className="hero-content">
            <p className="label">WE'RE GETTING MARRIED</p>
            <h1 className="couple-names">Emily &amp; James</h1>
            <div className="wedding-date">
              <div className="date-number">06</div>
              <div className="date-details">
                <span className="date-month">March</span>
                <span className="date-year">2027</span>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="info-card">
            <h2>Our Story</h2>
            <p>
              We met on a rainy Tuesday at a coffee shop, both reaching for the last blueberry muffin. 
              What started as a friendly compromise turned into countless coffee dates, weekend adventures, 
              and a love that grows stronger every day. Now, we're ready to write the next chapter together.
            </p>
          </div>

          <div className="info-card">
            <h2>The Celebration</h2>
            <p className="venue-name">Th Garden Estate</p>
            <p className="venue-address">
              123 Vineyard Lane<br />
              Napa Valley, California
            </p>
            <p className="ceremony-time">
              Ceremony at 4:00 PM<br />
              Reception to follow
            </p>
          </div>

          <div className="info-card">
            <h2>Dress Code</h2>
            <p>
              Garden party elegant. Think florals, pastels, and spring vibes. 
              Ladies, feel free to wear your favorite sundress or cocktail attire. 
              Gentlemen, suits or dress pants with a button-down shirt.
            </p>
          </div>

          <div className="cta-section">
            <Link href="/rsvp" className="primary-button">
              RSVP Now
            </Link>
            <p className="rsvp-note">Please respond by February 1st, 2027</p>
          </div>
        </section>
      </main>
    </>
  );
}
