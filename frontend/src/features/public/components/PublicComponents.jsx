import { Link } from 'react-router-dom'
import { PublicHeader } from '../../../components/layout/PublicLayout'

function PublicLayout({ eyebrow, title, copy, children }) {
  return (
    <div className="public-site">
      <PublicHeader />
      <main>
        <section className="public-hero wrap">
          <span className="eyebrow">
            <span className="status-dot" />
            {eyebrow}
          </span>
          <h1>{title}</h1>
          <p>{copy}</p>
        </section>
        {children}
      </main>
  
      <footer className="footer wrap">
        <div className="footer-top">
          <div>
            <Link className="brand" to="/">
              <span className="brand-mark" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              EventSphere
            </Link>
            <p>
              Good people. Great connections.
              <br />
              Events that bring it all together.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Explore</strong>
              <Link to="/events">Events</Link>
              <Link to="/exhibitors">Exhibitors</Link>
              <Link to="/schedule">Schedule</Link>
            </div>
            <div>
              <strong>EventSphere</strong>
              <Link to="/about">About us</Link>
              <Link to="/contact">Contact the team</Link>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 EventSphere</span>
          <span>Built for better events.</span>
        </div>
      </footer>
    </div>
  )
}

export { PublicLayout }
