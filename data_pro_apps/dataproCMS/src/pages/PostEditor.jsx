// pages/PostEditor.jsx - Click-to-Edit with Real-time Collaboration
import React, { useState, useEffect, useRef } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useAI } from '../contexts/AIContext';
import dataproApi from '../services/dataproApi';
import AIAssistant from '../components/AI/AIAssistant';
import './PostEditor.css';

function PostEditor({ currentUser, postId: existingPostId }) {
  const [post, setPost] = useState({
    id: null,
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    featuredImage: '',
    categories: [],
    tags: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const contentRef = useRef(null);
  
  const { broadcastEdit, broadcastCursor, joinEditingSession, leaveEditingSession } = useCollaboration();
  const { generateContent, getSEOSuggestions, generateTags } = useAI();

  useEffect(() => {
    if (existingPostId) {
      loadPost(existingPostId);
      joinEditingSession(existingPostId);
    }
    
    return () => {
      if (existingPostId) {
        leaveEditingSession();
      }
    };
  }, [existingPostId]);

  const loadPost = async (id) => {
    try {
      const data = await dataproApi.getPost(id);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
    }
  };

  const handleFieldEdit = (field, value) => {
    setPost(prev => ({ ...prev, [field]: value }));
    if (existingPostId) {
      broadcastEdit(existingPostId, { [field]: value }, currentUser.id);
    }
  };

  const handleMouseMove = (e, field) => {
    if (existingPostId && editingField === field) {
      broadcastCursor(existingPostId, { x: e.clientX, y: e.clientY }, currentUser.id);
    }
  };

  const handleAIGenerate = async (prompt, type) => {
    const generated = await generateContent(prompt, type);
    if (generated) {
      handleFieldEdit('content', post.content + '\n\n' + generated);
    }
  };

  const handleSEOSuggestions = async () => {
    const suggestions = await getSEOSuggestions(post.content, post.title);
    // Display suggestions to user
    alert(`SEO Suggestions:\n${suggestions.join('\n')}`);
  };

  const handleAutoTags = async () => {
    const tags = await generateTags(post.content);
    handleFieldEdit('tags', tags);
  };

  const savePost = async () => {
    try {
      if (post.id) {
        await dataproApi.updatePost(post.id, post);
      } else {
        const newPost = await dataproApi.createPost({
          ...post,
          author: currentUser.username,
          authorId: currentUser.id,
          createdAt: new Date().toISOString()
        });
        setPost(newPost);
      }
      alert('Post saved successfully!');
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post');
    }
  };

  return (
    <div className="post-editor-page">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="btn-primary" onClick={savePost}>
            💾 Save
          </button>
          <select value={post.status} onChange={(e) => handleFieldEdit('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button onClick={() => setShowAIAssistant(!showAIAssistant)} className="btn-ai">
            🤖 AI Assistant
          </button>
          <button onClick={handleSEOSuggestions} className="btn-seo">
            🔍 SEO Check
          </button>
          <button onClick={handleAutoTags} className="btn-tags">
            🏷️ Auto Tags
          </button>
        </div>
        <div className="toolbar-right">
          {collaborators.length > 0 && (
            <div className="collaborators">
              {collaborators.map(user => (
                <div key={user.id} className="collaborator-avatar" title={user.name}>
                  {user.name[0]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="editor-content">
        {/* Title - Click to Edit */}
        <div 
          className={`editable-title ${editingField === 'title' ? 'editing' : ''}`}
          onClick={() => setEditingField('title')}
          onBlur={() => setEditingField(null)}
          onMouseMove={(e) => handleMouseMove(e, 'title')}
        >
          {editingField === 'title' ? (
            <input
              type="text"
              value={post.title}
              onChange={(e) => handleFieldEdit('title', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setEditingField(null)}
              autoFocus
              placeholder="Click to add title..."
            />
          ) : (
            <h1>{post.title || 'Click to add title...'}</h1>
          )}
        </div>

        {/* Featured Image - Click to Edit */}
        <div 
          className={`editable-image ${editingField === 'image' ? 'editing' : ''}`}
          onClick={() => setEditingField('image')}
          onBlur={() => setEditingField(null)}
        >
          {editingField === 'image' ? (
            <input
              type="url"
              value={post.featuredImage}
              onChange={(e) => handleFieldEdit('featuredImage', e.target.value)}
              placeholder="Enter image URL..."
              autoFocus
            />
          ) : post.featuredImage ? (
            <img src={post.featuredImage} alt="Featured" />
          ) : (
            <div className="image-placeholder">Click to add featured image</div>
          )}
        </div>

        {/* Content - Click to Edit */}
        <div 
          className={`editable-content ${editingField === 'content' ? 'editing' : ''}`}
          onClick={() => setEditingField('content')}
          onBlur={() => setEditingField(null)}
        >
          {editingField === 'content' ? (
            <textarea
              ref={contentRef}
              value={post.content}
              onChange={(e) => handleFieldEdit('content', e.target.value)}
              placeholder="Write your content here... Click anywhere to start editing"
              autoFocus
            />
          ) : (
            <div className="content-preview">
              {post.content ? (
                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="placeholder">Click to start writing...</p>
              )}
            </div>
          )}
        </div>

        {/* Excerpt - Click to Edit */}
        <div 
          className={`editable-excerpt ${editingField === 'excerpt' ? 'editing' : ''}`}
          onClick={() => setEditingField('excerpt')}
          onBlur={() => setEditingField(null)}
        >
          {editingField === 'excerpt' ? (
            <textarea
              value={post.excerpt}
              onChange={(e) => handleFieldEdit('excerpt', e.target.value)}
              placeholder="Enter excerpt..."
              rows={3}
              autoFocus
            />
          ) : (
            <div className="excerpt-preview">
              <strong>Excerpt:</strong> {post.excerpt || 'Click to add excerpt...'}
            </div>
          )}
        </div>

        {/* Categories - Click to Edit */}
        <div 
          className={`editable-categories ${editingField === 'categories' ? 'editing' : ''}`}
          onClick={() => setEditingField('categories')}
          onBlur={() => setEditingField(null)}
        >
          {editingField === 'categories' ? (
            <input
              type="text"
              value={post.categories.join(', ')}
              onChange={(e) => handleFieldEdit('categories', e.target.value.split(',').map(c => c.trim()))}
              placeholder="Enter categories (comma-separated)"
              autoFocus
            />
          ) : (
            <div className="categories-preview">
              <strong>Categories:</strong> {post.categories.join(', ') || 'Click to add categories...'}
            </div>
          )}
        </div>

        {/* Tags - Click to Edit */}
        <div 
          className={`editable-tags ${editingField === 'tags' ? 'editing' : ''}`}
          onClick={() => setEditingField('tags')}
          onBlur={() => setEditingField(null)}
        >
          {editingField === 'tags' ? (
            <input
              type="text"
              value={post.tags.join(', ')}
              onChange={(e) => handleFieldEdit('tags', e.target.value.split(',').map(t => t.trim()))}
              placeholder="Enter tags (comma-separated)"
              autoFocus
            />
          ) : (
            <div className="tags-preview">
              <strong>Tags:</strong> {post.tags.join(', ') || 'Click to add tags...'}
            </div>
          )}
        </div>
      </div>

      {showAIAssistant && (
        <AIAssistant onGenerate={handleAIGenerate} currentContent={post.content} />
      )}
    </div>
  );
}

export default PostEditor;