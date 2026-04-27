// components/DataView.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function DataView({ view, data, onSelect, selected, onDelete, currentUser }) {
  const isSelected = (id) => selected.includes(id);
  
  const toggleSelect = (id) => {
    if (isSelected(id)) {
      onSelect(selected.filter(s => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  if (view === 'grid') {
    return (
      <div className="data-view-grid">
        {data.map(post => (
          <div key={post.id} className="grid-card">
            <div className="card-checkbox">
              <input 
                type="checkbox" 
                checked={isSelected(post.id)}
                onChange={() => toggleSelect(post.id)}
              />
            </div>
            {post.featuredImage && (
              <div className="card-image">
                <img src={post.featuredImage} alt={post.title} />
              </div>
            )}
            <div className="card-content">
              <h3>{post.title || 'Untitled'}</h3>
              <p>{post.excerpt?.substring(0, 100)}...</p>
              <div className="card-meta">
                <span className={`status-badge ${post.status}`}>{post.status}</span>
                <span>By {post.author}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="card-actions">
                <Link to={`/editor/${post.id}`} className="btn-edit">Edit</Link>
                <button onClick={() => onDelete(post.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="data-view-list">
        {data.map(post => (
          <div key={post.id} className="list-item">
            <input 
              type="checkbox" 
              checked={isSelected(post.id)}
              onChange={() => toggleSelect(post.id)}
            />
            <div className="list-content">
              <div className="list-title">
                <h4>{post.title || 'Untitled'}</h4>
                <span className={`status-badge small ${post.status}`}>{post.status}</span>
              </div>
              <div className="list-meta">
                <span>By {post.author}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="list-actions">
              <Link to={`/editor/${post.id}`} className="btn-icon">✏️</Link>
              <button onClick={() => onDelete(post.id)} className="btn-icon">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table view
  return (
    <div className="data-view-table">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" onChange={(e) => {
              if (e.target.checked) {
                onSelect(data.map(d => d.id));
              } else {
                onSelect([]);
              }
            }} /></th>
            <th>Title</th>
            <th>Status</th>
            <th>Author</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(post => (
            <tr key={post.id}>
              <td><input type="checkbox" checked={isSelected(post.id)} onChange={() => toggleSelect(post.id)} /></td>
              <td><strong>{post.title || 'Untitled'}</strong></td>
              <td><span className={`status-badge ${post.status}`}>{post.status}</span></td>
              <td>{post.author}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <Link to={`/editor/${post.id}`} className="btn-icon">✏️</Link>
                <button onClick={() => onDelete(post.id)} className="btn-icon">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataView;