// src/components/AI/AISuggestions.jsx
import React, { useState, useEffect } from 'react';
import './AISuggestions.css';

const AISuggestions = ({ 
  onApplySuggestion,
  contentType = 'blog',
  currentContent = '',
  title = '',
  tags = [],
  autoFetch = true
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  // AI suggestion categories
  const categories = [
    { id: 'all', name: 'All', icon: '✨' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'headlines', name: 'Headlines', icon: '📰' },
    { id: 'tags', name: 'Tags', icon: '🏷️' },
    { id: 'meta', name: 'Meta', icon: '📊' }
  ];

  // Pre-defined AI suggestions based on content type
  const suggestionTemplates = {
    blog: [
      {
        id: 'seo-1',
        category: 'seo',
        title: 'Improve SEO Score',
        description: 'Add more keywords and optimize meta description',
        icon: '🔍',
        action: 'seo_optimize',
        prompt: 'Optimize this blog post for SEO: {content}'
      },
      {
        id: 'headline-1',
        category: 'headlines',
        title: 'Generate Catchy Headlines',
        description: 'Create 5 engaging headlines for your post',
        icon: '📰',
        action: 'generate_headlines',
        prompt: 'Generate 5 catchy headlines for a blog post about: {title}'
      },
      {
        id: 'content-1',
        category: 'content',
        title: 'Expand Content',
        description: 'Add more depth and examples to your content',
        icon: '📝',
        action: 'expand_content',
        prompt: 'Expand this content with more details and examples: {content}'
      },
      {
        id: 'tags-1',
        category: 'tags',
        title: 'Generate Related Tags',
        description: 'Suggest relevant tags for better discovery',
        icon: '🏷️',
        action: 'generate_tags',
        prompt: 'Generate 10 relevant tags for a blog post about: {title}'
      }
    ],
    page: [
      {
        id: 'meta-1',
        category: 'meta',
        title: 'Optimize Meta Description',
        description: 'Create compelling meta description',
        icon: '📊',
        action: 'generate_meta',
        prompt: 'Write a compelling meta description for: {title}'
      },
      {
        id: 'content-2',
        category: 'content',
        title: 'Improve Readability',
        description: 'Simplify complex sentences and improve flow',
        icon: '📝',
        action: 'improve_readability',
        prompt: 'Improve the readability of this content: {content}'
      }
    ],
    product: [
      {
        id: 'product-1',
        category: 'content',
        title: 'Product Description',
        description: 'Generate persuasive product description',
        icon: '🛍️',
        action: 'product_desc',
        prompt: 'Write a persuasive product description for: {title}'
      }
    ]
  };

  useEffect(() => {
    if (autoFetch) {
      generateSuggestions();
    }
  }, [contentType, currentContent, title, autoFetch]);

  const generateSuggestions = async () => {
    setLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const templates = suggestionTemplates[contentType] || suggestionTemplates.blog;
    const enhancedSuggestions = templates.map(suggestion => ({
      ...suggestion,
      generated: false,
      result: null,
      confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
    }));
    
    setSuggestions(enhancedSuggestions);
    setLoading(false);
  };

  const handleGenerateSuggestion = async (suggestionId) => {
    setGenerating(true);
    
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    // Update loading state for this suggestion
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, generating: true } : s
    ));
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let result = '';
    switch (suggestion.action) {
      case 'seo_optimize':
        result = `Optimized version: ${currentContent.substring(0, 100)}... [SEO improvements added: keyword density increased, meta tags optimized, readability improved]`;
        break;
      case 'generate_headlines':
        result = `1. "The Ultimate Guide to ${title || 'Your Topic'}"\n2. "10 Surprising Facts About ${title || 'Your Topic'}"\n3. "How to Master ${title || 'Your Topic'} in 5 Days"\n4. "The Future of ${title || 'Your Topic'}: What Experts Say"\n5. "Why ${title || 'Your Topic'} Matters More Than Ever"`;
        break;
      case 'expand_content':
        result = `${currentContent}\n\n## Additional Insights\n\nBased on recent research, there are several key factors to consider... [AI-generated expansion with examples and case studies]`;
        break;
      case 'generate_tags':
        result = `${title || 'topic'}, guide, tutorial, tips, best practices, how-to, beginners, advanced, strategies, insights, trends, ${new Date().getFullYear()}`;
        break;
      case 'generate_meta':
        result = `Discover the ultimate guide to ${title || 'your topic'}. Learn expert tips, strategies, and insights to master ${title || 'your topic'} in ${new Date().getFullYear()}. Read more!`;
        break;
      case 'improve_readability':
        result = `[Improved version with better sentence structure, active voice, and clearer flow]\n\n${currentContent.substring(0, 200)}...`;
        break;
      default:
        result = `AI-generated suggestion for: ${suggestion.title}\n\nBased on your content, we recommend focusing on key areas including engagement, readability, and SEO optimization.`;
    }
    
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, generated: true, result, generating: false } : s
    ));
    
    setGenerating(false);
  };

  const handleApplySuggestion = (suggestion) => {
    if (onApplySuggestion && suggestion.result) {
      onApplySuggestion({
        type: suggestion.action,
        content: suggestion.result,
        originalSuggestion: suggestion
      });
    }
  };

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) return;
    
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const customResult = `AI-generated response to: "${customPrompt}"\n\nBased on your request, here's a tailored response with relevant information and actionable insights. This content has been optimized for engagement and clarity.`;
    
    const customSuggestion = {
      id: `custom-${Date.now()}`,
      category: 'custom',
      title: 'Custom AI Generation',
      description: customPrompt,
      icon: '🤖',
      generated: true,
      result: customResult,
      confidence: 85
    };
    
    setSuggestions(prev => [customSuggestion, ...prev]);
    setCustomPrompt('');
    setShowCustomPrompt(false);
    setGenerating(false);
  };

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'high';
    if (confidence >= 70) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="ai-suggestions-loading">
        <div className="loading-animation">
          <div className="ai-pulse"></div>
          <div className="ai-pulse-delayed"></div>
          <div className="ai-pulse-more"></div>
        </div>
        <p>AI is analyzing your content...</p>
        <small>Generating personalized suggestions</small>
      </div>
    );
  }

  return (
    <div className="ai-suggestions">
      <div className="ai-header">
        <div className="header-content">
          <h3>
            <span className="ai-icon">🤖</span>
            AI Content Assistant
          </h3>
          <p>Intelligent suggestions to improve your content</p>
        </div>
        <button 
          className="custom-prompt-btn"
          onClick={() => setShowCustomPrompt(!showCustomPrompt)}
        >
          💬 Custom Request
        </button>
      </div>

      {showCustomPrompt && (
        <div className="custom-prompt-section">
          <textarea
            placeholder="Ask AI to do something specific... (e.g., 'Write a conclusion paragraph', 'Generate a list of statistics', 'Create a call to action')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
          />
          <div className="custom-prompt-actions">
            <button onClick={() => setShowCustomPrompt(false)}>Cancel</button>
            <button onClick={handleCustomGenerate} disabled={generating || !customPrompt.trim()}>
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      )}

      <div className="ai-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="suggestions-list">
        {filteredSuggestions.length === 0 ? (
          <div className="no-suggestions">
            <div className="empty-icon">💡</div>
            <p>No suggestions in this category</p>
            <small>Try selecting a different category</small>
          </div>
        ) : (
          filteredSuggestions.map((suggestion, index) => (
            <div 
              key={suggestion.id} 
              className={`suggestion-card ${suggestion.generated ? 'generated' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="suggestion-header">
                <div className="suggestion-icon">{suggestion.icon}</div>
                <div className="suggestion-info">
                  <h4>{suggestion.title}</h4>
                  <p>{suggestion.description}</p>
                </div>
                <div className="confidence-badge" data-level={getConfidenceColor(suggestion.confidence)}>
                  {suggestion.confidence}% confidence
                </div>
              </div>

              {!suggestion.generated ? (
                <div className="suggestion-actions">
                  <button 
                    className="generate-btn"
                    onClick={() => handleGenerateSuggestion(suggestion.id)}
                    disabled={suggestion.generating}
                  >
                    {suggestion.generating ? (
                      <>
                        <span className="spinner-small"></span>
                        Generating...
                      </>
                    ) : (
                      <>✨ Generate Suggestion</>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <div className="suggestion-result">
                    <div className="result-header">
                      <span>📋 Generated Result</span>
                      <button 
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(suggestion.result);
                          // Show toast notification
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="result-content">
                      <pre>{suggestion.result}</pre>
                    </div>
                  </div>
                  
                  <div className="suggestion-actions">
                    <button 
                      className="apply-btn"
                      onClick={() => handleApplySuggestion(suggestion)}
                    >
                      ✓ Apply to Content
                    </button>
                    <button 
                      className="regenerate-btn"
                      onClick={() => handleGenerateSuggestion(suggestion.id)}
                    >
                      ⟳ Regenerate
                    </button>
                  </div>
                </>
              )}

              {expandedSuggestion === suggestion.id && (
                <div className="suggestion-details">
                  <h5>Why this suggestion?</h5>
                  <p>Based on analysis of top-performing content in your niche, this suggestion addresses key areas for improvement including engagement, readability, and search engine optimization.</p>
                  <h5>Expected Impact</h5>
                  <ul>
                    <li>📈 30-50% increase in engagement</li>
                    <li>🔍 Improved search rankings</li>
                    <li>📖 Better readability score</li>
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="ai-footer">
        <div className="ai-stats">
          <span>🎯 {suggestions.length} suggestions available</span>
          <span>⚡ {Math.floor(suggestions.filter(s => s.generated).length / suggestions.length * 100)}% generated</span>
        </div>
        <button 
          className="refresh-btn"
          onClick={generateSuggestions}
          disabled={loading}
        >
          🔄 Refresh Suggestions
        </button>
      </div>
    </div>
  );
};

export default AISuggestions;