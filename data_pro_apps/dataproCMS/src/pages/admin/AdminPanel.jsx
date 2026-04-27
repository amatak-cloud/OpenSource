// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import dataproApi from '../../services/dataproApi';
import './AdminPanel.css';

function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'DataPRO-WP',
    siteDescription: 'WordPress CMS on DataPRO Cloud',
    postsPerPage: 10,
    defaultUserRole: 'user',
    allowRegistration: true,
    maintenanceMode: false,
    commentsEnabled: true,
    cacheEnabled: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const isSuperAdmin = currentUser?.role === 'superadmin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, postsData] = await Promise.all([
        dataproApi.getAppUsers(),
        dataproApi.getPosts()
      ]);
      setUsers(usersData);
      setPosts(postsData.items || postsData || []);
      
      // Load system settings from localStorage
      const savedSettings = localStorage.getItem('system_settings');
      if (savedSettings) {
        setSystemSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setMessage({ type: 'error', text: 'Failed to load admin data' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = await dataproApi.createAppUser(formData);
      setUsers([...users, newUser]);
      setShowCreateUserModal(false);
      setFormData({ username: '', email: '', password: '', role: 'user', isActive: true });
      setMessage({ type: 'success', text: 'User created successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create user' });
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Only super admins can change user roles' });
      return;
    }
    
    try {
      await dataproApi.updateAppUser(userId, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: 'success', text: 'User role updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user role' });
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await dataproApi.updateAppUser(userId, { isActive: !currentStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      setMessage({ type: 'success', text: `User ${!currentStatus ? 'activated' : 'deactivated'}!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user status' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Only super admins can delete users' });
      return;
    }
    
    if (userId === currentUser?.id) {
      setMessage({ type: 'error', text: 'You cannot delete your own account' });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dataproApi.deleteAppUser(userId);
        setUsers(users.filter(u => u._id !== userId));
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Only super admins can delete users' });
      return;
    }
    
    if (window.confirm(`Delete ${selectedUsers.length} users?`)) {
      for (const userId of selectedUsers) {
        if (userId !== currentUser?.id) {
          await dataproApi.deleteAppUser(userId);
        }
      }
      await loadData();
      setSelectedUsers([]);
      setMessage({ type: 'success', text: 'Users deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dataproApi.deletePost(postId);
        setPosts(posts.filter(p => p.id !== postId));
        setMessage({ type: 'success', text: 'Post deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete post' });
      }
    }
  };

  const handleBulkDeletePosts = async () => {
    if (window.confirm(`Delete ${selectedPosts.length} posts?`)) {
      for (const postId of selectedPosts) {
        await dataproApi.deletePost(postId);
      }
      await loadData();
      setSelectedPosts([]);
      setMessage({ type: 'success', text: 'Posts deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSaveSettings = async () => {
    localStorage.setItem('system_settings', JSON.stringify(systemSettings));
    setMessage({ type: 'success', text: 'Settings saved successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    setShowSettingsModal(false);
  };

  const handleExportData = async () => {
    const exportData = {
      users,
      posts,
      settings: systemSettings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datapro-backup-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setMessage({ type: 'success', text: 'Data exported successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getStats = () => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      adminUsers: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
      totalCategories: [...new Set(posts.flatMap(p => p.categories || []))].length,
      totalTags: [...new Set(posts.flatMap(p => p.tags || []))].length
    };
  };

  const stats = getStats();
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel-page">
      <div className="admin-header">
        <h2>👑 Admin Dashboard</h2>
        <p>Manage users, content, and system settings</p>
      </div>

      {message.text && (
        <div className={`admin-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-trend">{stats.activeUsers} active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.totalPosts}</div>
          <div className="stat-label">Total Posts</div>
          <div className="stat-trend">{stats.publishedPosts} published</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-value">{stats.totalCategories}</div>
          <div className="stat-label">Categories</div>
          <div className="stat-trend">{stats.totalTags} tags</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-value">{stats.adminUsers}</div>
          <div className="stat-label">Admin Users</div>
          <div className="stat-trend">+{stats.adminUsers} this month</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs-container">
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button 
          className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📄 Content Management
        </button>
        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ System Settings
        </button>
        <button 
          className={`admin-tab ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          💾 Backup & Export
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>User Management</h3>
            <div className="header-actions">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isSuperAdmin && (
                <>
                  <button onClick={() => setShowCreateUserModal(true)} className="btn-primary">
                    + Add User
                  </button>
                  {selectedUsers.length > 0 && (
                    <button onClick={handleBulkDeleteUsers} className="btn-danger">
                      Delete Selected ({selectedUsers.length})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="users-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  {isSuperAdmin && <th><input type="checkbox" onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(filteredUsers.map(u => u._id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }} /></th>}
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Posts</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const userPosts = posts.filter(p => p.authorId === user._id).length;
                  return (
                    <tr key={user._id}>
                      {isSuperAdmin && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => {
                              if (selectedUsers.includes(user._id)) {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              } else {
                                setSelectedUsers([...selectedUsers, user._id]);
                              }
                            }}
                          />
                        </td>
                      )}
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {isSuperAdmin ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                            className="role-select"
                            disabled={user._id === currentUser?.id}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>{userPosts}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => {/* Edit user */}} 
                            className="btn-icon"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {isSuperAdmin && user._id !== currentUser?.id && (
                            <button 
                              onClick={() => handleDeleteUser(user._id)} 
                              className="btn-icon delete"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Content Management</h3>
            <div className="header-actions">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {selectedPosts.length > 0 && (
                <button onClick={handleBulkDeletePosts} className="btn-danger">
                  Delete Selected ({selectedPosts.length})
                </button>
              )}
            </div>
          </div>

          <div className="content-list">
            {filteredPosts.map(post => (
              <div key={post.id} className="content-item">
                <div className="content-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => {
                      if (selectedPosts.includes(post.id)) {
                        setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                      } else {
                        setSelectedPosts([...selectedPosts, post.id]);
                      }
                    }}
                  />
                </div>
                {post.featuredImage && (
                  <div className="content-image">
                    <img src={post.featuredImage} alt={post.title} />
                  </div>
                )}
                <div className="content-info">
                  <h4>{post.title || 'Untitled'}</h4>
                  <div className="content-meta">
                    <span>By: {post.author}</span>
                    <span className={`status-badge ${post.status}`}>{post.status}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.categories?.length > 0 && (
                      <span>Categories: {post.categories.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="content-actions">
                  <button onClick={() => window.location.href = `/editor/${post.id}`} className="btn-icon">
                    ✏️
                  </button>
                  <button onClick={() => handleDeletePost(post.id)} className="btn-icon delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>System Settings</h3>
            <button onClick={() => setShowSettingsModal(true)} className="btn-primary">
              Edit Settings
            </button>
          </div>

          <div className="settings-grid">
            <div className="setting-card">
              <h4>Site Information</h4>
              <div className="setting-item">
                <label>Site Name:</label>
                <span>{systemSettings.siteName}</span>
              </div>
              <div className="setting-item">
                <label>Site Description:</label>
                <span>{systemSettings.siteDescription}</span>
              </div>
            </div>

            <div className="setting-card">
              <h4>Content Settings</h4>
              <div className="setting-item">
                <label>Posts Per Page:</label>
                <span>{systemSettings.postsPerPage}</span>
              </div>
              <div className="setting-item">
                <label>Default User Role:</label>
                <span>{systemSettings.defaultUserRole}</span>
              </div>
              <div className="setting-item">
                <label>Comments Enabled:</label>
                <span>{systemSettings.commentsEnabled ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="setting-card">
              <h4>System Status</h4>
              <div className="setting-item">
                <label>Allow Registration:</label>
                <span>{systemSettings.allowRegistration ? 'Yes' : 'No'}</span>
              </div>
              <div className="setting-item">
                <label>Maintenance Mode:</label>
                <span className={systemSettings.maintenanceMode ? 'warning' : 'success'}>
                  {systemSettings.maintenanceMode ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="setting-item">
                <label>Cache Enabled:</label>
                <span>{systemSettings.cacheEnabled ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="setting-card">
              <h4>System Information</h4>
              <div className="setting-item">
                <label>DataPRO Version:</label>
                <span>v2.0.0</span>
              </div>
              <div className="setting-item">
                <label>Last Backup:</label>
                <span>{localStorage.getItem('last_backup') || 'Never'}</span>
              </div>
              <div className="setting-item">
                <label>Environment:</label>
                <span>Production</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Backup & Export</h3>
          </div>

          <div className="backup-options">
            <div className="backup-card">
              <div className="backup-icon">💾</div>
              <h4>Export All Data</h4>
              <p>Export users, posts, and settings as JSON</p>
              <button onClick={handleExportData} className="btn-primary">
                Export Data
              </button>
            </div>

            <div className="backup-card">
              <div className="backup-icon">📊</div>
              <h4>Export Analytics</h4>
              <p>Export site analytics and statistics</p>
              <button className="btn-secondary">
                Export Analytics
              </button>
            </div>

            <div className="backup-card">
              <div className="backup-icon">🔄</div>
              <h4>Restore Backup</h4>
              <p>Restore from previous backup file</p>
              <button className="btn-secondary">
                Restore Backup
              </button>
            </div>

            <div className="backup-card">
              <div className="backup-icon">📅</div>
              <h4>Schedule Backups</h4>
              <p>Configure automatic backups</p>
              <button className="btn-secondary">
                Configure
              </button>
            </div>
          </div>

          <div className="backup-history">
            <h4>Recent Backups</h4>
            <table className="backup-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date().toLocaleString()}</td>
                  <td>2.3 MB</td>
                  <td>Full Backup</td>
                  <td>
                    <button className="btn-icon">📥</button>
                    <button className="btn-icon">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setShowCreateUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateUserModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>System Settings</h3>
              <button onClick={() => setShowSettingsModal(false)}>✕</button>
            </div>
            <div className="settings-form">
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Site Description</label>
                <textarea
                  value={systemSettings.siteDescription}
                  onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Posts Per Page</label>
                <input
                  type="number"
                  value={systemSettings.postsPerPage}
                  onChange={(e) => setSystemSettings({...systemSettings, postsPerPage: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Default User Role</label>
                <select
                  value={systemSettings.defaultUserRole}
                  onChange={(e) => setSystemSettings({...systemSettings, defaultUserRole: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.allowRegistration}
                    onChange={(e) => setSystemSettings({...systemSettings, allowRegistration: e.target.checked})}
                  />
                  Allow User Registration
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                  />
                  Maintenance Mode
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.commentsEnabled}
                    onChange={(e) => setSystemSettings({...systemSettings, commentsEnabled: e.target.checked})}
                  />
                  Enable Comments
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowSettingsModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveSettings} className="btn-primary">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;