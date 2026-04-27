// components/UserManager.jsx
import React, { useState } from 'react';
import dataproApi from '../services/dataproApi';

function UserManager({ users, currentUser, onUpdate }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });
  const [error, setError] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await dataproApi.createAppUser(formData);
      setShowCreateModal(false);
      setFormData({ username: '', email: '', password: '', role: 'user', isActive: true });
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await dataproApi.updateAppUser(userId, { isActive: !currentStatus });
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?._id) {
      setError('You cannot delete yourself');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dataproApi.deleteAppUser(userId);
        onUpdate();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="user-manager">
      <div className="header">
        <h2>👥 User Management</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Add User
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => handleToggleStatus(user._id, user.isActive)}
                  className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button 
                  onClick={() => handleDeleteUser(user._id)}
                  className="btn-icon delete"
                  disabled={user._id === currentUser?._id}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManager;