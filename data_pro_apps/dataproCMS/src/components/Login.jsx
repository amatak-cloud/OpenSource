// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dataproApi from '../services/dataproApi';
// Import all required CSS files
import '../styles/global.css';
import '../styles/theme.css';
import '../styles/responsive.css';
import '../styles/auth.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (dataproApi.isAuthenticated()) {
      console.log('Already authenticated, redirecting to dashboard...');
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get bind key ID from environment
      const bindKeyId = import.meta.env.VITE_BIND_KEY_ID;
      
      if (!bindKeyId) {
        setError('No bind key configured. Please check CMS configuration.');
        setLoading(false);
        return;
      }
      
      console.log('Attempting login for:', username);
      
      const response = await dataproApi.login(username, password, bindKeyId);
      
      console.log('Login successful:', response);
      
      // Store user data (already handled by dataproApi, but call onLogin for App state)
      if (onLogin) {
        onLogin(response.user, response.token);
      }
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      
    } catch (err) {
      console.error('Login failed:', err);
      
      // Handle different error types
      if (err.message === 'Session expired. Please login again.') {
        setError('Session expired. Please login again.');
      } else if (err.message.toLowerCase().includes('credentials') || 
                 err.message.toLowerCase().includes('invalid')) {
        setError('Invalid username or password. Please try again.');
      } else if (err.message.toLowerCase().includes('bind key')) {
        setError('Configuration error: Invalid bind key. Please contact administrator.');
      } else if (err.message.includes('401')) {
        setError('Authentication failed. Please check your credentials.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">📝</div>
          <h1>DataPRO CMS</h1>
          <p>Sign in to your account</p>
          {import.meta.env.VITE_BIND_KEY_ID && (
            <small className="bind-key-hint">
              🔑 Bind Key: {import.meta.env.VITE_BIND_KEY_ID.slice(-16)}...
            </small>
          )}
        </div>

        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username or email"
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-auth" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              onClick={() => window.open('https://data-pro.cloud/', '_blank')} 
              className="link-btn" 
              type="button"
            >
              Contact Administrator
            </button>
          </p>
          <small className="auth-note">
            New accounts must be created by a super administrator.
          </small>
        </div>

        {/* Session info for debugging (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="auth-debug">
            <details>
              <summary>Debug Info</summary>
              <small>
                API URL: {import.meta.env.VITE_API_URL}<br />
                App ID: {import.meta.env.VITE_APP_ID?.slice(-16)}...<br />
                Bind Key: {import.meta.env.VITE_BIND_KEY_ID?.slice(-16)}...<br />
                Session: {dataproApi.isAuthenticated() ? 'Active' : 'None'}
              </small>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;