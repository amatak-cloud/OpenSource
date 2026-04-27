// pages/Dashboard/Dashboard.jsx - Updated error handling
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dataproApi from '../../services/dataproApi';
import StatCard from '../../components/State/StatCard';
import RecentActivity from '../../components/Activity/RecentActivity';
import AISuggestions from '../../components/AI/AISuggestions';
import './Dashboard.css';

function Dashboard({ currentUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    published: 0,
    drafts: 0,
    totalUsers: 0,
    totalViews: 0,
    totalComments: 0
  });
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Try to get posts
      let postsData = [];
      try {
        postsData = await dataproApi.getPosts();
        setPosts(postsData);
      } catch (postErr) {
        console.error('Failed to load posts:', postErr);
      }
      
      // Try to get users (this might fail if endpoint doesn't exist yet)
      let usersData = [];
      try {
        usersData = await dataproApi.getAppUsers();
        setUsers(usersData);
      } catch (userErr) {
        console.error('Failed to load users:', userErr);
        // Don't fail the whole dashboard if users can't load
        usersData = [];
      }
      
      const publishedCount = postsData.filter(p => p.status === 'published').length;
      const draftCount = postsData.filter(p => p.status === 'draft').length;
      
      setStats({
        totalPosts: postsData.length,
        published: publishedCount,
        drafts: draftCount,
        totalUsers: usersData.length,
        totalViews: postsData.reduce((sum, p) => sum + (p.views || 0), 0),
        totalComments: postsData.reduce((sum, p) => sum + (p.comments || 0), 0)
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const navigateTo = (path) => {
    navigate(`/admin${path}`);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Failed to load dashboard</h3>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <div className="welcome-content">
          <h2>Welcome back, {currentUser?.username || currentUser?.name || 'User'}! 👋</h2>
          <p>Here's what's happening with your content today.</p>
        </div>
        <div className="welcome-actions">
          <button onClick={() => navigateTo('/editor')} className="btn-primary">
            ✏️ Write New Post
          </button>
          {isAdmin && (
            <button onClick={() => navigateTo('/admin-panel')} className="btn-secondary">
              👑 Admin Panel
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          icon="📝" 
          value={stats.totalPosts} 
          label="Total Posts" 
          color="blue"
          onClick={() => navigateTo('/posts')}
        />
        <StatCard 
          icon="✅" 
          value={stats.published} 
          label="Published" 
          color="green"
          onClick={() => navigateTo('/posts')}
        />
        <StatCard 
          icon="📌" 
          value={stats.drafts} 
          label="Drafts" 
          color="orange"
          onClick={() => navigateTo('/posts')}
        />
        <StatCard 
          icon="👥" 
          value={stats.totalUsers} 
          label="Users" 
          color="purple"
          onClick={() => isAdmin && navigateTo('/admin-panel')}
        />
        <StatCard 
          icon="👁️" 
          value={stats.totalViews.toLocaleString()} 
          label="Total Views" 
          color="teal"
        />
        <StatCard 
          icon="💬" 
          value={stats.totalComments.toLocaleString()} 
          label="Comments" 
          color="pink"
        />
      </div>

      <div className="dashboard-grid">
        <div className="recent-activity-section">
          <div className="section-header">
            <h3>📋 Recent Activity</h3>
            <button onClick={() => navigateTo('/posts')} className="section-btn">View All →</button>
          </div>
          <RecentActivity 
            posts={posts} 
            users={users}
            limit={5}
          />
        </div>
        
        <div className="ai-suggestions-section">
          <div className="section-header">
            <h3>🤖 AI Suggestions</h3>
            <span className="ai-badge">Powered by AI</span>
          </div>
          <AISuggestions 
            contentType="blog"
            autoFetch={false}
          />
        </div>
      </div>

      {isAdmin && (
        <div className="admin-quick-actions">
          <h3>🔧 Admin Quick Actions</h3>
          <div className="quick-actions-grid">
            <button onClick={() => navigateTo('/admin-panel')} className="quick-action-card">
              <span className="quick-action-icon">👥</span>
              <span className="quick-action-label">Manage Users</span>
            </button>
            <button onClick={() => navigateTo('/posts')} className="quick-action-card">
              <span className="quick-action-icon">📝</span>
              <span className="quick-action-label">All Content</span>
            </button>
            <button onClick={() => navigateTo('/editor')} className="quick-action-card">
              <span className="quick-action-icon">✏️</span>
              <span className="quick-action-label">New Post</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;