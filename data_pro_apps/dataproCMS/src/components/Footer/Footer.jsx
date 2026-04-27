// src/components/Footer/Footer.jsx
import React, { useState, useEffect } from 'react';
import './Footer.css';

const Footer = ({ 
  showSocialLinks = true,
  showNewsletter = false,
  showBackToTop = true,
  companyName = "DataPRO-WP",
  currentYear = new Date().getFullYear()
}) => {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Social links configuration
  const socialLinks = [
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/datapro', color: '#1DA1F2' },
    { name: 'GitHub', icon: '💻', url: 'https://github.com/datapro', color: '#333333' },
    { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com/company/datapro', color: '#0077B5' },
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com/datapro', color: '#1877F2' },
    { name: 'Instagram', icon: '📸', url: 'https://instagram.com/datapro', color: '#E4405F' },
    { name: 'YouTube', icon: '📺', url: 'https://youtube.com/datapro', color: '#FF0000' }
  ];

  // Quick links for navigation
  const quickLinks = [
    { name: 'About Us', path: '/about', icon: 'ℹ️' },
    { name: 'Documentation', path: '/docs', icon: '📚' },
    { name: 'Support', path: '/support', icon: '🎧' },
    { name: 'Blog', path: '/blog', icon: '📝' },
    { name: 'Privacy Policy', path: '/privacy', icon: '🔒' },
    { name: 'Terms of Service', path: '/terms', icon: '⚖️' }
  ];

  // Resources links
  const resourceLinks = [
    { name: 'API Documentation', path: '/api-docs', icon: '🔌' },
    { name: 'Status Page', path: '/status', icon: '📊' },
    { name: 'Community Forum', path: '/community', icon: '💬' },
    { name: 'Feature Requests', path: '/features', icon: '✨' },
    { name: 'Report Bug', path: '/bugs', icon: '🐛' },
    { name: 'System Status', path: '/system-status', icon: '🖥️' }
  ];

  // Handle scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setNewsletterStatus('loading');
    
    // Simulate API call - replace with actual API endpoint
    try {
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus(null), 3000);
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(null), 3000);
    }
  };

  // Handle link click with navigation
  const handleLinkClick = (path) => {
    // If using React Router
    // navigate(path);
    
    // For now, use window.location
    window.location.href = path;
  };

  return (
    <footer className="app-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Company Info Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <h3>📝 {companyName}</h3>
              <p className="footer-tagline">
                Professional WordPress CMS on DataPRO Cloud
              </p>
            </div>
            <div className="footer-description">
              <p>
                DataPRO-WP is a modern, feature-rich content management system 
                built on DataPRO Cloud's powerful JSON database infrastructure. 
                Experience the future of content management with real-time 
                collaboration, AI-powered tools, and enterprise-grade security.
              </p>
            </div>
            <div className="footer-stats">
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
              <div className="stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Users</span>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleLinkClick(link.path)} 
                    className="footer-link"
                  >
                    <span className="link-icon">{link.icon}</span>
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleLinkClick(link.path)} 
                    className="footer-link"
                  >
                    <span className="link-icon">{link.icon}</span>
                    <span>{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          {showNewsletter && (
            <div className="footer-section">
              <h4>Newsletter</h4>
              <p className="newsletter-text">
                Subscribe to get updates on new features, tips, and security alerts.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={newsletterStatus === 'loading'}
                  />
                  <button 
                    type="submit" 
                    disabled={newsletterStatus === 'loading'}
                  >
                    {newsletterStatus === 'loading' ? '⏳' : 'Subscribe'}
                  </button>
                </div>
                {newsletterStatus === 'success' && (
                  <div className="newsletter-success">
                    ✅ Thanks for subscribing!
                  </div>
                )}
                {newsletterStatus === 'error' && (
                  <div className="newsletter-error">
                    ❌ Failed to subscribe. Please try again.
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Social Links Bar */}
      {showSocialLinks && (
        <div className="footer-social">
          <div className="footer-container">
            <div className="social-links-wrapper">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{ '--social-color': social.color }}
                  aria-label={social.name}
                >
                  <span className="social-icon">{social.icon}</span>
                  <span className="social-name">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="bottom-content">
            <div className="copyright">
              <span>© {currentYear} {companyName}. All rights reserved.</span>
            </div>
            
            <div className="footer-badges">
              <span className="badge">
                <span className="badge-icon">🔒</span>
                SSL Secure
              </span>
              <span className="badge">
                <span className="badge-icon">🌍</span>
                GDPR Compliant
              </span>
              <span className="badge">
                <span className="badge-icon">⚡</span>
                99.9% Uptime
              </span>
            </div>

            <div className="footer-legal">
              <button onClick={() => handleLinkClick('/privacy')} className="legal-link">
                Privacy
              </button>
              <span className="separator">•</span>
              <button onClick={() => handleLinkClick('/terms')} className="legal-link">
                Terms
              </button>
              <span className="separator">•</span>
              <button onClick={() => handleLinkClick('/cookies')} className="legal-link">
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          className={`back-to-top ${showScrollButton ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <span className="arrow">↑</span>
          <span className="text">Top</span>
        </button>
      )}
    </footer>
  );
};

export default Footer;