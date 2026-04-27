// components/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ currentPage, setCurrentPage, currentUser, collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/admin/dashboard', roles: ['user', 'admin', 'superadmin'] },
    { id: 'posts', icon: '📝', label: 'Posts', path: '/admin/posts', roles: ['user', 'admin', 'superadmin'] },
    { id: 'editor', icon: '✏️', label: 'New Post', path: '/admin/editor', roles: ['user', 'admin', 'superadmin'] },
    { id: 'media', icon: '🖼️', label: 'Media Library', path: '/admin/media', roles: ['user', 'admin', 'superadmin'] },
    { id: 'profile', icon: '👤', label: 'Profile', path: '/admin/profile', roles: ['user', 'admin', 'superadmin'] },
    { id: 'admin', icon: '👑', label: 'Admin Panel', path: '/admin/admin-panel', roles: ['admin', 'superadmin'] },
    { id: 'ai-tools', icon: '🤖', label: 'AI Tools', path: '/admin/ai-tools', roles: ['user', 'admin', 'superadmin'] }
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.includes(currentUser?.role || 'user')
  );

  // Check if current route matches item path
  const isActive = (item) => {
    if (item.id === 'dashboard' && location.pathname === '/admin/dashboard') return true;
    if (item.id === 'posts' && location.pathname === '/admin/posts') return true;
    if (item.id === 'editor' && location.pathname === '/admin/editor') return true;
    if (item.id === 'profile' && location.pathname === '/admin/profile') return true;
    if (item.id === 'admin' && location.pathname === '/admin/admin-panel') return true;
    if (item.id === 'media' && location.pathname === '/admin/media') return true;
    if (item.id === 'ai-tools' && location.pathname === '/admin/ai-tools') return true;
    // Also check if we're editing a post (editor/:id)
    if (item.id === 'editor' && location.pathname.startsWith('/admin/editor/')) return true;
    return false;
  };

  const handleNavigation = (item) => {
    // Update the local state for backward compatibility
    if (setCurrentPage) {
      setCurrentPage(item.id);
    }
    // Navigate using React Router
    navigate(item.path);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '→' : '←'}
      </button>
      
      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${isActive(item) ? 'active' : ''}`}
            onClick={() => handleNavigation(item)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="system-info">
            <p>DataPRO Cloud</p>
            <small>Connected</small>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;