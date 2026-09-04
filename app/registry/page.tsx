import { Navigation } from "../components/Navigation";

export default function RegistryPage() {
  return (
    <>
      <Navigation />
      <main className="content-page">
        <div className="content-container">
          <h1>Registry</h1>
          <p className="description">
            Your presence at our wedding is the greatest gift of all. 
            However, if you wish to honor us with a gift, we've registered at the following locations:
          </p>
          
          <div className="registry-list">
            <div className="registry-card">
              <h3>Amazon</h3>
              <p>For all our home essentials</p>
              <a href="#" className="registry-link">View Registry →</a>
            </div>

            <div className="registry-card">
              <h3>Crate &amp; Barrel</h3>
              <p>Kitchen and dining favorites</p>
              <a href="#" className="registry-link">View Registry →</a>
            </div>

            <div className="registry-card">
              <h3>Honeymoon Fund</h3>
              <p>Help us create memories in Italy</p>
              <a href="#" className="registry-link">Contribute →</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
