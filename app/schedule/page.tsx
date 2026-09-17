import { Navigation } from "../components/Navigation";

export default function SchedulePage() {
  return (
    <>
      <Navigation />
      <main className="content-page">
        <div className="content-container">
          <h1>Wedding Schedule</h1>
          <p className="description">
            Join us for a day of love and celebration! Here's what to expect on our special day.
          </p>

          <div className="schedule-timeline">
            <div className="schedule-item">
              <div className="schedule-time">3:00 PM</div>
              <div className="schedule-details">
                <h3>Guest Arrival</h3>
                <p>
                  Please arrive and find your seats. The ceremony will begin promptly at 4:00 PM.
                </p>
              </div>
            </div>

            <div className="schedule-item">
              <div className="schedule-time">4:00 PM</div>
              <div className="schedule-details">
                <h3>Ceremony</h3>
                <p>
                  Join us as we exchange our vows in the garden. The ceremony will take place outdoors 
                  at The Garden Estate overlooking the beautiful vineyard views.
                </p>
              </div>
            </div>

            <div className="schedule-item">
              <div className="schedule-time">4:45 PM</div>
              <div className="schedule-details">
                <h3>Cocktail Hour</h3>
                <p>
                  Enjoy drinks and hors d'oeuvres on the terrace while we take photos. 
                  Mingle with other guests and enjoy the spring evening.
                </p>
              </div>
            </div>

            <div className="schedule-item">
              <div className="schedule-time">6:00 PM</div>
              <div className="schedule-details">
                <h3>Reception Begins</h3>
                <p>
                  Dinner service begins! Find your seat for a delicious meal, heartfelt toasts, 
                  and the start of an unforgettable evening.
                </p>
              </div>
            </div>

            <div className="schedule-item">
              <div className="schedule-time">7:30 PM</div>
              <div className="schedule-details">
                <h3>First Dance & Dancing</h3>
                <p>
                  Watch our first dance, then join us on the dance floor! 
                  Let's celebrate with music, laughter, and lots of dancing.
                </p>
              </div>
            </div>

            <div className="schedule-item">
              <div className="schedule-time">9:30 PM</div>
              <div className="schedule-details">
                <h3>Cake Cutting</h3>
                <p>
                  We'll cut our wedding cake and share a sweet moment together.
                </p>
              </div>
            </div>

            <div className="schedule-item">
              <div className="schedule-time">10:30 PM</div>
              <div className="schedule-details">
                <h3>Grand Exit</h3>
                <p>
                  Join us outside for a sparkler send-off as we begin our journey as husband and wife!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
