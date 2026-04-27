// layouts/PublicLayout.jsx - Clean public layout without admin links
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './PublicLayout.css';

function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="public-layout">
      {/* Modern Public Header - No Admin Links */}
      <header className="public-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">📝</div>
            <div className="logo-text">
              <span className="logo-title">DataPRO</span>
              <span className="logo-subtitle">CMS</span>
            </div>
          </Link>
          
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={`public-nav ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/">Home</Link>
            <Link to="/#features">Features</Link>
            <Link to="/#about">About</Link>
            <Link to="/#contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>📝 DataPRO CMS</h3>
              <p>Modern Content Management System</p>
            </div>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-copyright">
              <p>&copy; 2024 DataPRO CMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;