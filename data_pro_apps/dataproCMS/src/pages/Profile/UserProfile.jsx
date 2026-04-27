// src/pages/UserProfile.jsx
import React, { useState, useRef } from 'react';
import dataproApi from '../../services/dataproApi';
import './UserProfile.css';

function UserProfile({ currentUser, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    website: currentUser?.website || '',
    location: currentUser?.location || '',
    socialLinks: {
      twitter: currentUser?.socialLinks?.twitter || '',
      github: currentUser?.socialLinks?.github || '',
      linkedin: currentUser?.socialLinks?.linkedin || ''
    },
    preferences: {
      notifications: currentUser?.preferences?.notifications ?? true,
      language: currentUser?.preferences?.language || 'en',
      editorMode: currentUser?.preferences?.editorMode || 'visual'
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username}&background=e94560&color=fff`);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
      return;
    }

    setLoading(true);
    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setAvatar(base64String);
        
        // Save to backend
        await dataproApi.updateAppUser(currentUser.id, { avatar: base64String });
        if (onUpdate) onUpdate({ ...currentUser, avatar: base64String });
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedUser = await dataproApi.updateAppUser(currentUser.id, formData);
      if (onUpdate) onUpdate(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await dataproApi.changePassword(currentUser.id, passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const getActivityStats = () => {
    return {
      postsCreated: currentUser?.stats?.postsCreated || 0,
      commentsPosted: currentUser?.stats?.commentsPosted || 0,
      lastActive: currentUser?.lastLogin || new Date().toISOString(),
      memberSince: currentUser?.createdAt || new Date().toISOString()
    };
  };

  const stats = getActivityStats();

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-container">
            <div className="profile-avatar" onClick={() => fileInputRef.current?.click()}>
              <img src={avatar} alt={currentUser?.username} />
              <div className="avatar-overlay">
                <span>📷</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <h1>{currentUser?.username}</h1>
            <p className="user-role">{currentUser?.role || 'user'}</p>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          📝 Profile Information
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security & Password
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📊 Activity & Stats
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <div className="profile-content">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-edit">
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={() => setIsEditing(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-save">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="profile-info-display">
                <div className="info-row">
                  <label>Username:</label>
                  <span>{formData.username}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{formData.email}</span>
                </div>
                <div className="info-row">
                  <label>Bio:</label>
                  <span>{formData.bio || 'No bio added yet'}</span>
                </div>
                <div className="info-row">
                  <label>Website:</label>
                  <span>{formData.website || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <label>Location:</label>
                  <span>{formData.location || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <label>Social Links:</label>
                  <div className="social-links">
                    {formData.socialLinks.twitter && (
                      <a href={`https://twitter.com/${formData.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                        🐦 Twitter
                      </a>
                    )}
                    {formData.socialLinks.github && (
                      <a href={`https://github.com/${formData.socialLinks.github}`} target="_blank" rel="noopener noreferrer">
                        💻 GitHub
                      </a>
                    )}
                    {formData.socialLinks.linkedin && (
                      <a href={formData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        🔗 LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                </div>
                <div className="form-group">
                  <label>Twitter Username</label>
                  <input
                    type="text"
                    name="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Username</label>
                  <input
                    type="text"
                    name="socialLinks.github"
                    value={formData.socialLinks.github}
                    onChange={handleChange}
                    placeholder="username"
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn Profile URL</label>
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Security Settings</h2>
            </div>

            {!isChangingPassword ? (
              <div className="security-info">
                <div className="info-card">
                  <h3>🔐 Password</h3>
                  <p>Last changed: {currentUser?.passwordLastChanged || 'Never'}</p>
                  <button onClick={() => setIsChangingPassword(true)} className="btn-change-password">
                    Change Password
                  </button>
                </div>
                <div className="info-card">
                  <h3>🔑 Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                  <button className="btn-setup-2fa">Setup 2FA</button>
                </div>
                <div className="info-card">
                  <h3>📱 Active Sessions</h3>
                  <p>Manage your active sessions across devices</p>
                  <button className="btn-manage-sessions">Manage Sessions</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="password-change-form">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <small>Minimum 6 characters</small>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setIsChangingPassword(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-save">
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="profile-section">
            <h2>Activity Statistics</h2>
            <div className="stats-grid-profile">
              <div className="stat-card-profile">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{stats.postsCreated}</div>
                <div className="stat-label">Posts Created</div>
              </div>
              <div className="stat-card-profile">
                <div className="stat-icon">💬</div>
                <div className="stat-value">{stats.commentsPosted}</div>
                <div className="stat-label">Comments Posted</div>
              </div>
              <div className="stat-card-profile">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{new Date(stats.memberSince).toLocaleDateString()}</div>
                <div className="stat-label">Member Since</div>
              </div>
              <div className="stat-card-profile">
                <div className="stat-icon">🟢</div>
                <div className="stat-value">{new Date(stats.lastActive).toLocaleDateString()}</div>
                <div className="stat-label">Last Active</div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-timeline">
                <div className="activity-item">
                  <div className="activity-icon">✏️</div>
                  <div className="activity-details">
                    <p>Edited post "Getting Started with DataPRO"</p>
                    <small>2 hours ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📝</div>
                  <div className="activity-details">
                    <p>Created new post "Advanced WordPress Tips"</p>
                    <small>Yesterday</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">💬</div>
                  <div className="activity-details">
                    <p>Commented on "Understanding JSON Databases"</p>
                    <small>3 days ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="profile-section">
            <h2>User Preferences</h2>
            <div className="preferences-form">
              <div className="preference-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  />
                  Enable Email Notifications
                </label>
                <small>Receive email updates about your posts and comments</small>
              </div>

              <div className="preference-item">
                <label>Default Editor Mode</label>
                <select
                  value={formData.preferences.editorMode}
                  onChange={(e) => handlePreferenceChange('editorMode', e.target.value)}
                >
                  <option value="visual">Visual Editor</option>
                  <option value="code">Code Editor</option>
                  <option value="split">Split View</option>
                </select>
              </div>

              <div className="preference-item">
                <label>Language</label>
                <select
                  value={formData.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div className="preference-actions">
                <button 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await dataproApi.updateAppUser(currentUser.id, { preferences: formData.preferences });
                      setMessage({ type: 'success', text: 'Preferences saved!' });
                      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    } catch (error) {
                      setMessage({ type: 'error', text: 'Failed to save preferences' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="btn-save-preferences"
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;