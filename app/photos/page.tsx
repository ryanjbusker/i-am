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
            <h1>Photos</h1>
          </header>
          <PhotoGallery photos={ENGAGEMENT_PHOTOS} />
        </div>
      </main>
    </>
  );
}
