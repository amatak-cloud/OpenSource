// pages/Dashboard/Dashboard.jsx - Updated with real user data and admin route
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
  const [recentActivity, setRecentActivity] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Load posts and users in parallel
      const [postsData, usersData] = await Promise.all([
        dataproApi.getPosts().catch(() => []),
        dataproApi.getAppUsers().catch(() => [])
      ]);
      
      setPosts(postsData);
      setUsers(usersData);
      
      // Calculate stats
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

      // Generate recent activity from posts
      const activities = [...postsData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(post => ({
          id: post.id,
          type: post.status === 'published' ? 'published' : 'created',
          title: post.title,
          author: post.author,
          date: post.createdAt,
          status: post.status
        }));
      setRecentActivity(activities);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Check if user is admin and redirect if needed
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Handle navigation to admin panel
  const goToAdminPanel = () => {
    navigate('/admin');
  };

  // Handle navigation to posts
  const goToPosts = () => {
    navigate('/posts');
  };

  // Handle create new post
  const createNewPost = () => {
    navigate('/editor');
  };

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
          <button onClick={createNewPost} className="btn-primary">
            ✏️ Write New Post
          </button>
          {isAdmin && (
            <button onClick={goToAdminPanel} className="btn-secondary">
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
          onClick={goToPosts}
        />
        <StatCard 
          icon="✅" 
          value={stats.published} 
          label="Published" 
          color="green"
          onClick={goToPosts}
        />
        <StatCard 
          icon="📌" 
          value={stats.drafts} 
          label="Drafts" 
          color="orange"
          onClick={goToPosts}
        />
        <StatCard 
          icon="👥" 
          value={stats.totalUsers} 
          label="Users" 
          color="purple"
          onClick={isAdmin ? goToAdminPanel : null}
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
            <button onClick={goToPosts} className="section-btn">View All →</button>
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
            currentContent=""
            title=""
          />
        </div>
      </div>

      {isAdmin && (
        <div className="admin-quick-actions">
          <h3>🔧 Admin Quick Actions</h3>
          <div className="quick-actions-grid">
            <button onClick={goToAdminPanel} className="quick-action-card">
              <span className="quick-action-icon">👥</span>
              <span className="quick-action-label">Manage Users</span>
            </button>
            <button onClick={goToPosts} className="quick-action-card">
              <span className="quick-action-icon">📝</span>
              <span className="quick-action-label">All Content</span>
            </button>
            <button onClick={createNewPost} className="quick-action-card">
              <span className="quick-action-icon">✏️</span>
              <span className="quick-action-label">New Post</span>
            </button>
            <button className="quick-action-card">
              <span className="quick-action-icon">⚙️</span>
              <span className="quick-action-label">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;