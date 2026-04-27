// components/PostList.jsx
import React, { useState } from 'react';

const PostList = ({ posts, onEdit, onDelete, onView, user, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesAuthor = authorFilter === 'all' || 
                         (authorFilter === 'me' && post.authorId === user?.id) ||
                         (authorFilter === 'others' && post.authorId !== user?.id);
    return matchesSearch && matchesStatus && matchesAuthor;
  });

  const canEdit = (post) => isAdmin || post.authorId === user?.id;
  const canDelete = (post) => isAdmin || post.authorId === user?.id;

  return (
    <div className="post-list-container">
      <div className="list-header">
        <h2>📄 All Posts</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)}>
            <option value="all">All Authors</option>
            <option value="me">My Posts</option>
            <option value="others">Others' Posts</option>
          </select>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <p>No posts found. Click "New Post" to create your first post!</p>
        </div>
      ) : (
        <table className="posts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post.id}>
                <td className="post-title-cell">
                  <strong>{post.title || 'Untitled'}</strong>
                  {post.excerpt && <small>{post.excerpt.substring(0, 60)}...</small>}
                </td>
                <td>
                  <span className={`status-badge ${post.status || 'draft'}`}>
                    {post.status || 'draft'}
                  </span>
                </td>
                <td>{post.author}</td>
                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button onClick={() => onView(post)} className="btn-icon" title="View">👁️</button>
                  {canEdit(post) && (
                    <button onClick={() => onEdit(post)} className="btn-icon" title="Edit">✏️</button>
                  )}
                  {canDelete(post) && (
                    <button onClick={() => onDelete(post.id)} className="btn-icon delete" title="Delete">🗑️</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PostList;