import { Navigation } from "../components/Navigation";
import { PhotoGallery } from "../components/PhotoGallery";
import { ENGAGEMENT_PHOTOS } from "./engagement-photos";

export default function PhotosPage() {
  return (
    <>
      <Navigation />
      <main className="content-page">
        <div className="content-container content-container--wide">
          <header className="gallery-header">
            <p className="gallery-kicker">Our Engagement</p>
            <h1>Our Photos</h1>
            <p className="description">
              A few favorite moments from our engagement session. Tap any photo to view it larger.
            </p>
          </header>
          <PhotoGallery photos={ENGAGEMENT_PHOTOS} />
        </div>
      </main>
    </>
  );
}
