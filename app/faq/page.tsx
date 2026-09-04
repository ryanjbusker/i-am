import { Navigation } from "../components/Navigation";

export default function FAQPage() {
  return (
    <>
      <Navigation />
      <main className="content-page">
        <div className="content-container">
          <h1>Frequently Asked Questions</h1>
          
          <div className="faq-list">
            <div className="faq-item">
              <h3>What should I wear?</h3>
              <p>
                Garden party elegant. Think florals, pastels, and spring vibes. 
                The ceremony will be outdoors, so comfortable shoes are recommended!
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I bring a plus one?</h3>
              <p>
                Due to venue capacity, we're only able to accommodate guests formally invited. 
                If you received a plus one, their name will appear on your invitation.
              </p>
            </div>

            <div className="faq-item">
              <h3>Will there be parking?</h3>
              <p>
                Yes! The venue has ample parking available for all guests. 
                Valet service will be provided for your convenience.
              </p>
            </div>

            <div className="faq-item">
              <h3>Are kids welcome?</h3>
              <p>
                We love your little ones, but we've decided to make our wedding an adults-only celebration. 
                We hope this gives you a chance to relax and enjoy the evening!
              </p>
            </div>

            <div className="faq-item">
              <h3>What time should I arrive?</h3>
              <p>
                Please arrive by 3:45 PM to find your seat. The ceremony will begin promptly at 4:00 PM.
              </p>
            </div>

            <div className="faq-item">
              <h3>Will the ceremony be indoors or outdoors?</h3>
              <p>
                Both the ceremony and reception will be outdoors in the garden. 
                We have a covered backup plan in case of rain.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
