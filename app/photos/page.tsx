import { Navigation } from "../components/Navigation";

export default function PhotosPage() {
  return (
    <>
      <Navigation />
      <main className="content-page">
        <div className="content-container">
          <h1>Our Photos</h1>
          <p className="description">
            Coming soon! We'll share our engagement photos and memories here.
          </p>
          <div className="photo-grid">
            <div className="photo-placeholder">
              <span>📷</span>
              <p>Photos coming soon</p>
            </div>
            <div className="photo-placeholder">
              <span>📷</span>
              <p>Photos coming soon</p>
            </div>
            <div className="photo-placeholder">
              <span>📷</span>
              <p>Photos coming soon</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
