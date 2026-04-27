// pages/Posts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dataproApi from '../services/dataproApi';
import './Posts.css';

function Posts({ currentUser }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await dataproApi.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const handleEdit = (postId) => {
    navigate(`/admin/editor/${postId}`);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dataproApi.deletePost(postId);
        await loadPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleNewPost = () => {
    navigate('/admin/editor');
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h1>Posts</h1>
        <button onClick={handleNewPost} className="btn-primary">
          + New Post
        </button>
      </div>

      <div className="posts-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({posts.length})
        </button>
        <button 
          className={filter === 'published' ? 'active' : ''} 
          onClick={() => setFilter('published')}
        >
          Published ({posts.filter(p => p.status === 'published').length})
        </button>
        <button 
          className={filter === 'draft' ? 'active' : ''} 
          onClick={() => setFilter('draft')}
        >
          Drafts ({posts.filter(p => p.status === 'draft').length})
        </button>
      </div>

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found.</p>
            <button onClick={handleNewPost} className="btn-primary">
              Create your first post
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="post-item">
              <div className="post-info">
                <h3>{post.title}</h3>
                <div className="post-meta">
                  <span className={`status ${post.status}`}>{post.status}</span>
                  <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.views && <span>👁️ {post.views} views</span>}
                </div>
              </div>
              <div className="post-actions">
                <button onClick={() => handleEdit(post.id)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDelete(post.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Posts;