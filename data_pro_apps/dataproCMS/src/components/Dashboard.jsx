// components/Dashboard.jsx
import React from 'react';

const Dashboard = ({ posts, onEdit, onDelete, user, isAdmin }) => {
  const userPosts = posts.filter(p => p.authorId === user?.id);
  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status === 'draft');

  const stats = {
    total: posts.length,
    myPosts: userPosts.length,
    published: publishedPosts.length,
    draft: draftPosts.length
  };

  const recentPosts = [...posts].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 5);

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>Welcome back, {user?.username || user?.email?.split('@')[0]}! 👋</h2>
        <p>Your WordPress CMS dashboard on DataPRO Cloud</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✏️</div>
          <div className="stat-value">{stats.myPosts}</div>
          <div className="stat-label">Your Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.published}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📌</div>
          <div className="stat-value">{stats.draft}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </div>

      <div className="recent-posts">
        <h3>📋 Recent Posts</h3>
        {recentPosts.length === 0 ? (
          <p className="no-data">No posts yet. Create your first post!</p>
        ) : (
          <div className="recent-list">
            {recentPosts.map(post => (
              <div key={post.id} className="recent-item">
                <div className="recent-info">
                  <span className="recent-title">{post.title || 'Untitled'}</span>
                  <span className="recent-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className={`status-badge small ${post.status}`}>{post.status}</span>
                  {post.authorId === user?.id && <span className="your-post-badge">Your post</span>}
                </div>
                <div className="recent-actions">
                  <button onClick={() => onEdit(post)} className="btn-icon-sm">✏️</button>
                  {(isAdmin || post.authorId === user?.id) && (
                    <button onClick={() => onDelete(post.id)} className="btn-icon-sm delete">🗑️</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="admin-quick-links">
          <h3>🔧 Admin Quick Actions</h3>
          <div className="quick-actions">
            <button onClick={() => window.location.href = '/admin'}>Manage Users</button>
            <button onClick={() => window.location.href = '/posts'}>View All Content</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;