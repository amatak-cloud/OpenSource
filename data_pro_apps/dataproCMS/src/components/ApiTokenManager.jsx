// components/ApiTokenManager.jsx - Updated without CORS issues
import React, { useState } from 'react';

function ApiTokenManager({ onTokenSet, initialToken }) {
  const [apiToken, setApiToken] = useState(initialToken || '');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');

  const handleTokenSubmit = () => {
    if (!apiToken.trim()) {
      setError('Please enter an API token');
      return;
    }

    // Store token directly without verification (will be verified on API calls)
    localStorage.setItem('datapro_api_token', apiToken);
    localStorage.setItem('datapro_app_id', import.meta.env.VITE_APP_ID);
    localStorage.setItem('datapro_app_secret', import.meta.env.VITE_APP_SECRET);
    
    if (onTokenSet) onTokenSet(apiToken);
  };

  return (
    <div className="api-token-manager">
      <div className="token-input-group">
        <label>DataPRO API Token</label>
        <div className="token-input-wrapper">
          <input
            type={showToken ? 'text' : 'password'}
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your DataPRO API token"
            className="token-input"
          />
          <button 
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="toggle-visibility"
          >
            {showToken ? '🙈' : '👁️'}
          </button>
        </div>
        <p className="token-hint">
          Enter the API token from your DataPRO app configuration
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button 
        onClick={handleTokenSubmit}
        disabled={!apiToken.trim()}
        className="verify-token-btn"
      >
        Connect to DataPRO
      </button>
    </div>
  );
}

export default ApiTokenManager;