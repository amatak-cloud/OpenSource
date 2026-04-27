// components/Header/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useCollaboration } from '../../contexts/CollaborationContext';
import './Header.css';

// Get version from package.json
import packageJson from '../../../package.json';

function Header({ currentUser, setCurrentPage, sidebarCollapsed, setSidebarCollapsed, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const { activeUsers } = useCollaboration();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const appVersion = packageJson.version || '1.0.0';

  // Load real notifications from localStorage or API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Get notifications from localStorage or API
        const storedNotifications = localStorage.getItem('user_notifications');
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        } else {
          // Sample notifications - replace with API call
          const sampleNotifs = [
            { id: 1, message: 'Welcome to DataPRO CMS!', time: new Date().toISOString(), unread: true, type: 'welcome' },
            { id: 2, message: 'Your profile is now active', time: new Date().toISOString(), unread: true, type: 'profile' }
          ];
          setNotifications(sampleNotifs);
          localStorage.setItem('user_notifications', JSON.stringify(sampleNotifs));
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to posts page with search
      navigate('/admin/posts');
      // Store search query in localStorage for results page
      localStorage.setItem('search_query', searchQuery);
      if (setCurrentPage) setCurrentPage('posts');
    }
  };

  const handleNotificationClick = (notificationId) => {
    const updatedNotifs = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, unread: false } : notif
    );
    setNotifications(updatedNotifs);
    localStorage.setItem('user_notifications', JSON.stringify(updatedNotifs));
  };

  const markAllAsRead = () => {
    const updatedNotifs = notifications.map(notif => ({ ...notif, unread: false }));
    setNotifications(updatedNotifs);
    localStorage.setItem('user_notifications', JSON.stringify(updatedNotifs));
  };

  const visitSite = () => {
    // Open the homepage in a new tab
    window.open('/', '_blank');
  };

  const handleNavigation = (page, path) => {
    if (setCurrentPage) setCurrentPage(page);
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const displayName = currentUser?.username || currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const userAvatar = currentUser?.avatar || `https://ui-avatars.com/api/?name=${displayName}&background=e94560&color=fff`;

  return (
    <header className="app-header">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div className="header-left">
        <div className="logo" onClick={() => handleNavigation('dashboard', '/admin/dashboard')}>
          <h1>📝 DataPRO CMS</h1>
          <span className="version">v{appVersion}</span>
        </div>
        {!isMobile && (
          <div className="breadcrumb">
            <span>Admin Dashboard</span>
          </div>
        )}
      </div>

      <div className="header-center">
        <form onSubmit={handleSearch} className="search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={isMobile ? "Search..." : "Search posts, pages, or users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
          {!isMobile && <span className="search-shortcut">⌘K</span>}
        </form>
      </div>

      <div className="header-right">
        {/* Visit Site Button */}
        <button onClick={visitSite} className="visit-site-btn" title="Visit Site">
          🌐 Visit Site
        </button>

        {/* Active Users - Hide on mobile */}
        {!isMobile && activeUsers.length > 0 && (
          <div className="active-users">
            {activeUsers.slice(0, 3).map(user => (
              <div key={user.id} className="user-avatar" title={user.name}>
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=e94560&color=fff`} alt={user.name} />
                <span className="online-indicator"></span>
              </div>
            ))}
            {activeUsers.length > 3 && (
              <div className="more-users">+{activeUsers.length - 3}</div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="notifications-dropdown" ref={notificationRef}>
          <button 
            className="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="dropdown-content">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="mark-all-read">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <span>🔔</span>
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${notif.unread ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif.id)}
                    >
                      <div className="notification-content">
                        <p className="notification-title">{notif.message}</p>
                        <span className="notification-time">
                          {new Date(notif.time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User Menu */}
        <div className="user-menu-container" ref={userMenuRef}>
          <button 
            className="user-menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <img src={userAvatar} alt="User" />
            {!isMobile && <span>{displayName}</span>}
            <span className="dropdown-icon">▼</span>
          </button>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <img src={userAvatar} alt="User" />
                <div>
                  <p className="user-name">{displayName}</p>
                  <p className="user-email">{currentUser?.email || 'user@datapro.com'}</p>
                  <p className="user-role">{currentUser?.role || 'User'}</p>
                </div>
              </div>
              <div className="user-dropdown-divider"></div>
              <button onClick={() => handleNavigation('profile', '/admin/profile')} className="dropdown-item">
                <span>👤</span> My Profile
              </button>
              <button onClick={() => handleNavigation('settings', '/admin/settings')} className="dropdown-item">
                <span>⚙️</span> Settings
              </button>
              <button onClick={visitSite} className="dropdown-item">
                <span>🌐</span> Visit Site
              </button>
              {currentUser?.role === 'admin' && (
                <button onClick={() => handleNavigation('admin', '/admin/admin-panel')} className="dropdown-item">
                  <span>👑</span> Admin Panel
                </button>
              )}
              <div className="user-dropdown-divider"></div>
              <button onClick={onLogout} className="dropdown-item logout">
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div className="mobile-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="mobile-sidebar" ref={mobileMenuRef}>
            <div className="mobile-sidebar-header">
              <h3>📝 DataPRO CMS</h3>
              <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <nav className="mobile-nav">
              <button onClick={() => handleNavigation('dashboard', '/admin/dashboard')} className="mobile-nav-item">
                📊 Dashboard
              </button>
              <button onClick={() => handleNavigation('posts', '/admin/posts')} className="mobile-nav-item">
                📝 Posts
              </button>
              <button onClick={() => handleNavigation('editor', '/admin/editor')} className="mobile-nav-item">
                ✏️ New Post
              </button>
              <button onClick={visitSite} className="mobile-nav-item">
                🌐 Visit Site
              </button>
              <button onClick={() => handleNavigation('profile', '/admin/profile')} className="mobile-nav-item">
                👤 Profile
              </button>
              {currentUser?.role === 'admin' && (
                <button onClick={() => handleNavigation('admin', '/admin/admin-panel')} className="mobile-nav-item">
                  👑 Admin
                </button>
              )}
            </nav>
            <div className="mobile-sidebar-footer">
              <div className="mobile-version">Version v{appVersion}</div>
              <button onClick={toggleTheme} className="mobile-theme-toggle">
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              <button onClick={onLogout} className="mobile-logout-btn">
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;