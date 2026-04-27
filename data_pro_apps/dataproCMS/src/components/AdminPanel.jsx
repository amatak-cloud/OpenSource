// components/AdminPanel.jsx
import React, { useState } from 'react';

const AdminPanel = ({ users, currentUser, onUpdateRole, onDeleteUser, posts, onDeletePost, isSuperAdmin }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPostStats = () => {
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const draft = posts.filter(p => p.status === 'draft').length;
    return { total, published, draft };
  };

  const stats = getPostStats();

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>👑 Admin Dashboard</h2>
        <p>Manage users and content</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management ({users.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📝 Content Management ({posts.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Site Statistics
        </button>
      </div>

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>System Users</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="users-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Posts</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const userPosts = posts.filter(p => p.authorId === user.id).length;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <span className="user-avatar-small">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {isSuperAdmin ? (
                          <select 
                            value={user.role || 'user'} 
                            onChange={(e) => onUpdateRole(user.id, e.target.value)}
                            className="role-select"
                            disabled={user.id === currentUser?.id}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge ${user.role || 'user'}`}>
                            {user.role || 'user'}
                          </span>
                        )}
                      </td>
                      <td>{userPosts}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {user.id !== currentUser?.id && (
                          <button 
                            onClick={() => onDeleteUser(user.id)} 
                            className="btn-danger-small"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Management */}
      {activeTab === 'content' && (
        <div className="admin-section">
          <h3>All Content</h3>
          <div className="content-list">
            {posts.map(post => (
              <div key={post.id} className="content-item">
                <div className="content-info">
                  <h4>{post.title || 'Untitled'}</h4>
                  <div className="content-meta">
                    <span>By: {post.author}</span>
                    <span className={`status-badge ${post.status}`}>{post.status}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="content-actions">
                  <button onClick={() => window.location.href = `/posts/${post.id}`} className="btn-icon">
                    👁️
                  </button>
                  <button onClick={() => onDeletePost(post.id)} className="btn-icon delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {activeTab === 'stats' && (
        <div className="admin-section">
          <h3>Site Statistics</h3>
          <div className="stats-grid-admin">
            <div className="stat-card-admin">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Posts</div>
            </div>
            <div className="stat-card-admin">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.published}</div>
              <div className="stat-label">Published</div>
            </div>
            <div className="stat-card-admin">
              <div className="stat-icon">📌</div>
              <div className="stat-value">{stats.draft}</div>
              <div className="stat-label">Drafts</div>
            </div>
            <div className="stat-card-admin">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>

          <div className="authors-list">
            <h4>Top Authors</h4>
            {Object.entries(
              posts.reduce((acc, post) => {
                acc[post.author] = (acc[post.author] || 0) + 1;
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1]).map(([author, count]) => (
              <div key={author} className="author-stat">
                <span>{author}</span>
                <span>{count} posts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;