import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto w-100" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1)' }}>
      <div className="container px-4 px-md-5 py-5">
        <div className="row g-5">
          {/* Column 1: Brand & Socials */}
          <div className="col-12 col-md-4">
            <Link to="/dashboard" className="text-decoration-none d-inline-block mb-3">
              <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', textShadow: '0 0 10px var(--accent-color)' }}>NoteBridge</h2>
            </Link>
            <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Your unified workspace bridging the gap between secure cloud storage and real-time community interaction. Connect, collaborate, and create.
            </p>
            <div className="d-flex gap-3">
              <a href="https://www.linkedin.com/in/aagam-jain-10226831a/" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn" style={{ color: 'var(--text-secondary)', transition: 'all 0.3s' }}>
                <i className="fa-brands fa-linkedin fs-4"></i>
              </a>
              <a href="https://github.com/aagamjn13" target="_blank" rel="noreferrer" className="social-icon" aria-label="GitHub" style={{ color: 'var(--text-secondary)', transition: 'all 0.3s' }}>
                <i className="fa-brands fa-github fs-4"></i>
              </a>
              <a href="mailto:aagamjn13@gmail.com" className="social-icon" aria-label="Email" style={{ color: 'var(--text-secondary)', transition: 'all 0.3s' }}>
                <i className="fa-solid fa-envelope fs-4"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-12 col-md-4">
            <h5 className="fw-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li>
                <Link to="/dashboard" className="text-decoration-none footer-link" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Home / Dashboard</Link>
              </li>
              <li>
                <Link to="/about" className="text-decoration-none footer-link" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>About the Creator</Link>
              </li>
              <li>
                <Link to="/social/notifications" className="text-decoration-none footer-link" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Notifications</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="col-12 col-md-4">
            <h5 className="fw-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Legal</h5>
            <ul className="list-unstyled d-flex flex-column gap-3">
              <li>
                <Link to="/" className="text-decoration-none footer-link" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Privacy Policy</Link>
              </li>
              <li>
                <Link to="/" className="text-decoration-none footer-link" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Terms of Service</Link>
              </li>
              <li>
                <Link to="/" className="text-decoration-none footer-link" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>Help Center</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="py-3 w-100" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container text-center">
          <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            &copy; {year} NoteBridge by Aagam Jain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
