// components/AIAssistant.jsx
import React, { useState } from 'react';
import './AIAssistant.css';

function AIAssistant({ onGenerate, currentContent }) {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('blog');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    await onGenerate(prompt, type);
    setIsGenerating(false);
    setPrompt('');
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>🤖 AI Content Assistant</h3>
        <p>Generate content, improve writing, or get suggestions</p>
      </div>
      
      <div className="ai-controls">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="blog">Blog Post</option>
          <option value="seo">SEO Meta Description</option>
          <option value="social">Social Media Post</option>
          <option value="email">Email Newsletter</option>
        </select>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to write about..."
          rows={3}
        />
        
        <button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>
      </div>
      
      <div className="ai-suggestions">
        <h4>Suggested prompts:</h4>
        <div className="suggestion-buttons">
          <button onClick={() => setPrompt('Write an introduction about web development trends in 2024')}>
            Web development trends
          </button>
          <button onClick={() => setPrompt('Create a list of best practices for SEO')}>
            SEO best practices
          </button>
          <button onClick={() => setPrompt('Generate a conclusion about AI in content creation')}>
            AI content creation
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;