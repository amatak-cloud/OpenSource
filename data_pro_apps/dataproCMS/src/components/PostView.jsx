// components/PostView.jsx
import React from 'react';

const PostView = ({ post, onEdit, onBack, user, isAdmin }) => {
  const canEdit = isAdmin || post.authorId === user?.id;

  return (
    <div className="post-view">
      <div className="view-header">
        <button onClick={onBack} className="btn-back">← Back to Posts</button>
        {canEdit && (
          <button onClick={onEdit} className="btn-edit">✏️ Edit Post</button>
        )}
      </div>

      {post.featuredImage && (
        <div className="featured-image">
          <img src={post.featuredImage} alt={post.title} />
        </div>
      )}

      <article className="post-content-full">
        <h1>{post.title}</h1>
        
        <div className="post-meta">
          <span className="meta-item">📅 {new Date(post.createdAt).toLocaleDateString()}</span>
          <span className="meta-item">✍️ {post.author}</span>
          <span className={`status-badge ${post.status}`}>{post.status}</span>
        </div>

        {post.categories?.length > 0 && (
          <div className="post-categories">
            <strong>Categories:</strong>
            {post.categories.map(cat => (
              <span key={cat} className="category-tag">{cat}</span>
            ))}
          </div>
        )}

        {post.excerpt && (
          <div className="post-excerpt">
            <p>{post.excerpt}</p>
          </div>
        )}

        <div className="post-body">
          {post.content.split('\n').map((paragraph, idx) => (
            paragraph.trim() && <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {post.tags?.length > 0 && (
          <div className="post-tags">
            <strong>Tags:</strong>
            {post.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default PostView;