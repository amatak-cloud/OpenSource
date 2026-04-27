// components/ApiTokenSetup.jsx - Updated with better error handling
import React, { useState } from 'react';
import dataproApi from '../services/dataproApi';

function ApiTokenSetup({ onComplete }) {
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testConnection = async () => {
    if (!apiToken.trim()) {
      setError('Please enter your API token');
      return false;
    }

    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      console.log('Testing connection with token:', apiToken.substring(0, 20) + '...');
      
      // Store the API token temporarily
      dataproApi.setApiToken(apiToken);
      
      // Test the token by fetching users
      const users = await dataproApi.getAppUsers();
      console.log('✅ Connected! Response:', users);
      
      let userCount = 0;
      if (Array.isArray(users)) {
        userCount = users.length;
      } else if (users && typeof users === 'object') {
        userCount = users.users?.length || users.data?.length || 1;
      }
      
      setTestResult({ success: true, message: `Connected! Found ${userCount} user(s).` });
      return true;
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err.message || 'Invalid API token or network error. Please check and try again.');
      setTestResult({ success: false, message: err.message });
      // Clear invalid token
      dataproApi.setApiToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await testConnection();
    if (success) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  return (
    <div className="api-token-setup">
      <div className="setup-container">
        <h1>🔑 DataPRO CMS Setup</h1>
        <p>Enter your DataPRO API token to connect to your app</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>API Token</label>
            <div className="token-input-wrapper">
              <input
                type={showToken ? 'text' : 'password'}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your DataPRO API token"
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="toggle-visibility"
              >
                {showToken ? '🙈' : '👁️'}
              </button>
            </div>
            <small>Get your API token from your DataPRO dashboard</small>
          </div>

          {error && <div className="error-message">❌ {error}</div>}
          
          {testResult && testResult.success && (
            <div className="success-message">✅ {testResult.message}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Connecting...' : 'Connect to DataPRO'}
          </button>
        </form>

        <div className="setup-info">
          <h4>📋 Troubleshooting:</h4>
          <ul>
            <li>Make sure you have a valid API token from DataPRO dashboard</li>
            <li>Check that your internet connection is working</li>
            <li>The API endpoint is: https://api.data-pro.cloud/api</li>
            <li>App ID: e03be376-1c9e-4a34-9a0a-edf109d6f083</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ApiTokenSetup;