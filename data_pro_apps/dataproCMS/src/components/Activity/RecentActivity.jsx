// src/components/RecentActivity.jsx
import React, { useState, useEffect } from 'react';
import './RecentActivity.css';

const RecentActivity = ({ 
  posts = [], 
  users = [],
  limit = 5,
  showViewAll = true,
  autoRefresh = false,
  refreshInterval = 30000
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, posts, users, comments
  const [expanded, setExpanded] = useState(false);

  // Generate activities from posts and users
  useEffect(() => {
    generateActivities();
  }, [posts, users]);

  // Auto-refresh activities
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      generateActivities();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, posts, users]);

  const generateActivities = () => {
    setLoading(true);
    
    const newActivities = [];
    
    // Add post activities
    posts.forEach(post => {
      // Post created
      newActivities.push({
        id: `post-created-${post.id}`,
        type: 'post_created',
        title: post.title || 'Untitled',
        author: post.author,
        authorId: post.authorId,
        status: post.status,
        timestamp: new Date(post.createdAt),
        icon: '📝',
        color: '#10b981',
        postId: post.id
      });
      
      // Post updated
      if (post.updatedAt && post.updatedAt !== post.createdAt) {
        newActivities.push({
          id: `post-updated-${post.id}`,
          type: 'post_updated',
          title: post.title || 'Untitled',
          author: post.author,
          authorId: post.authorId,
          status: post.status,
          timestamp: new Date(post.updatedAt),
          icon: '✏️',
          color: '#3b82f6',
          postId: post.id
        });
      }
      
      // Post published
      if (post.status === 'published' && post.publishedAt) {
        newActivities.push({
          id: `post-published-${post.id}`,
          type: 'post_published',
          title: post.title || 'Untitled',
          author: post.author,
          authorId: post.authorId,
          timestamp: new Date(post.publishedAt),
          icon: '🚀',
          color: '#f59e0b',
          postId: post.id
        });
      }
    });
    
    // Add user activities
    users.forEach(user => {
      newActivities.push({
        id: `user-joined-${user.id}`,
        type: 'user_joined',
        username: user.username,
        email: user.email,
        role: user.role,
        timestamp: new Date(user.createdAt),
        icon: '👤',
        color: '#8b5cf6',
        userId: user.id
      });
      
      // User last active
      if (user.lastLogin) {
        newActivities.push({
          id: `user-active-${user.id}`,
          type: 'user_active',
          username: user.username,
          timestamp: new Date(user.lastLogin),
          icon: '🟢',
          color: '#10b981',
          userId: user.id
        });
      }
    });
    
    // Sort by timestamp (newest first)
    newActivities.sort((a, b) => b.timestamp - a.timestamp);
    
    setActivities(newActivities);
    setLoading(false);
  };

  const getActivityMessage = (activity) => {
    const timeAgo = getTimeAgo(activity.timestamp);
    
    switch (activity.type) {
      case 'post_created':
        return (
          <>
            <span className="activity-action">created</span>
            <span className="activity-title">"{activity.title}"</span>
          </>
        );
      case 'post_updated':
        return (
          <>
            <span className="activity-action">updated</span>
            <span className="activity-title">"{activity.title}"</span>
          </>
        );
      case 'post_published':
        return (
          <>
            <span className="activity-action">published</span>
            <span className="activity-title">"{activity.title}"</span>
          </>
        );
      case 'user_joined':
        return (
          <>
            <span className="activity-action">joined</span>
            <span className="activity-user">{activity.username}</span>
            <span className="activity-detail">as {activity.role}</span>
          </>
        );
      case 'user_active':
        return (
          <>
            <span className="activity-user">{activity.username}</span>
            <span className="activity-action">was active</span>
          </>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'just now';
  };

  const getFilteredActivities = () => {
    if (filter === 'all') return activities;
    if (filter === 'posts') return activities.filter(a => a.type.includes('post'));
    if (filter === 'users') return activities.filter(a => a.type.includes('user'));
    if (filter === 'comments') return activities.filter(a => a.type === 'comment');
    return activities;
  };

  const displayedActivities = getFilteredActivities().slice(0, expanded ? undefined : limit);

  if (loading) {
    return (
      <div className="recent-activity-loading">
        <div className="loading-spinner-small"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <div className="header-left">
          <h3>📋 Recent Activity</h3>
          {autoRefresh && (
            <span className="auto-refresh-badge">
              🔄 Auto-refresh
            </span>
          )}
        </div>
        
        <div className="activity-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'posts' ? 'active' : ''}`}
            onClick={() => setFilter('posts')}
          >
            Posts
          </button>
          <button 
            className={`filter-btn ${filter === 'users' ? 'active' : ''}`}
            onClick={() => setFilter('users')}
          >
            Users
          </button>
        </div>
      </div>

      <div className="activity-timeline">
        {displayedActivities.length === 0 ? (
          <div className="no-activities">
            <div className="empty-icon">📭</div>
            <p>No recent activities</p>
            <small>Activities will appear here as you create content</small>
          </div>
        ) : (
          displayedActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="activity-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="activity-icon" style={{ background: activity.color }}>
                {activity.icon}
              </div>
              
              <div className="activity-content">
                <div className="activity-message">
                  {getActivityMessage(activity)}
                </div>
                <div className="activity-meta">
                  <span className="activity-time">{getTimeAgo(activity.timestamp)}</span>
                  {activity.author && (
                    <>
                      <span className="separator">•</span>
                      <span className="activity-author">by {activity.author}</span>
                    </>
                  )}
                  {activity.status && (
                    <>
                      <span className="separator">•</span>
                      <span className={`activity-status ${activity.status}`}>
                        {activity.status}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {activity.postId && (
                <button 
                  className="activity-action-btn"
                  onClick={() => window.location.href = `/posts/${activity.postId}`}
                  title="View post"
                >
                  👁️
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {showViewAll && activities.length > limit && (
        <div className="activity-footer">
          <button 
            className="view-all-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less ↑' : `View all (${activities.length}) ↓`}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;