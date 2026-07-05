import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './Footer';
import NoteContext from '../context/notes/noteContext';
import '../css/landing.css';

const LandingPage = () => {
  const value = useContext(NoteContext);
  return (
    <div className="landing-container d-flex flex-column min-vh-100">
      <Navbar search={() => {}} />
      
      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-4 pt-5 mt-5">
        <div className="hero-section mb-5">
          <span className="badge rounded-pill bg-dark text-white px-3 py-2 mb-4 fs-6">
            New: AI Summarization & Real-time Collaboration ✨
          </span>
          <h1 className="display-3 fw-bold mb-4 tracking-tight text-primary-contrast" style={{ letterSpacing: "-1px" }}>
            Your Unified Workspace
          </h1>
          <p className="lead mb-5 mx-auto text-secondary-contrast" style={{ maxWidth: '600px' }}>
            NoteBridge bridges the gap between cloud file storage and community interaction. Build, organize, and share your notes flawlessly.
          </p>
          <div className="d-flex justify-content-center gap-3">
            {value.islogout ? (
              <Link to="/user/signup" className="btn btn-lg px-5 py-3 rounded-1 fw-semibold" style={{ backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', boxShadow: 'var(--accent-glow)' }}>
                Get Started - It's Free
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn-lg px-5 py-3 rounded-1 fw-semibold" style={{ backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', boxShadow: 'var(--accent-glow)' }}>
                Go to Dashboard
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-lg px-4 py-3 rounded-1 fw-semibold" style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
              Explore
            </Link>
          </div>
        </div>

        <div className="features-grid container mt-5 pt-5 pb-5">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-1 p-4 bg-card-contrast text-start">
                <i className="fa-solid fa-wand-magic-sparkles fs-2 mb-3 text-dark"></i>
                <h4 className="fw-bold">AI Summarization</h4>
                <p className="text-secondary-contrast">Instantly summarize long notes and generate contextual tags using our powerful Gemini AI integration.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-1 p-4 bg-card-contrast text-start">
                <i className="fa-solid fa-users fs-2 mb-3 text-dark"></i>
                <h4 className="fw-bold">Real-time Collab</h4>
                <p className="text-secondary-contrast">Connect instantly with peers. Share notes, leave comments, and receive live notifications without refreshing.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-1 p-4 bg-card-contrast text-start">
                <i className="fa-solid fa-shield-halved fs-2 mb-3 text-dark"></i>
                <h4 className="fw-bold">Secure Storage</h4>
                <p className="text-secondary-contrast">Your files are encrypted and safely stored in Firebase, giving you peace of mind and lightning-fast retrieval.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
