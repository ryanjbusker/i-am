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

        <section className="schedule-section">
          <div className="schedule-container">
            <h2 className="schedule-title">Celebrate with us</h2>
            
            <div className="event-details">
              <div className="event-card">
                <h3 className="event-type">Ceremony</h3>
                <p className="event-time">4:00 PM</p>
                <p className="venue-name">Corpus Christi Cathedral</p>
                <p className="venue-address">
                  505 N Upper Broadway<br />
                  Corpus Christi, TX 78401
                </p>
              </div>

              <div className="event-card">
                <h3 className="event-type">Reception</h3>
                <p className="event-time">To Follow</p>
                <p className="venue-name">Corpus Christi Country Club</p>
                <p className="venue-address">
                  6300 Everhart Rd<br />
                  Corpus Christi, TX 78413
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
