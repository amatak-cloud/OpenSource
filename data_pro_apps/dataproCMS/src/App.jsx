// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CollaborationProvider } from './contexts/CollaborationContext';
import { AIProvider } from './contexts/AIContext';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Homepage from './pages/Public/Homepage';
import PublicPostView from './pages/Public/PublicPostView';
import Dashboard from './pages/Dashboard/Dashboard';
import Posts from './pages/Posts';
import PostEditor from './pages/PostEditor';
import UserProfile from './pages/Profile/UserProfile';
import AdminPanel from './pages/Admin/AdminPanel';
import Login from './components/Login';
import dataproApi from './services/dataproApi';
import './styles/global.css';
import './styles/theme.css';
import './styles/responsive.css';

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [publicPosts, setPublicPosts] = useState([]);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      console.log('🔄 Restoring session...');
      
      // Check if we have a stored session token
      const storedToken = localStorage.getItem('cms_session_token');
      const storedUser = localStorage.getItem('cms_current_user');
      
      if (storedToken && storedUser) {
        try {
          // Validate the token with the backend (optional but recommended)
          const user = JSON.parse(storedUser);
          
          // Set the token in the API service
          dataproApi.setSessionToken(storedToken);
          dataproApi.setCurrentUser(user);
          
          // Optional: Verify token with backend
          // const isValid = await dataproApi.verifyToken();
          // if (isValid) {
            setCurrentUser(user);
            console.log('✅ Session restored for user:', user.username);
          // } else {
          //   // Token invalid, clear storage
          //   console.log('❌ Session invalid, clearing...');
          //   dataproApi.logout();
          // }
        } catch (error) {
          console.error('Failed to restore session:', error);
          dataproApi.logout();
        }
      } else {
        console.log('No stored session found');
      }
      
      setLoading(false);
    };
    
    restoreSession();
  }, []);

  // Load public posts
  useEffect(() => {
    const loadPublicPosts = async () => {
      try {
        const posts = await dataproApi.getPublicPosts();
        setPublicPosts(posts);
      } catch (err) {
        console.error('Failed to load public posts:', err);
      }
    };
    loadPublicPosts();
  }, []);

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    // The API service already stores these in localStorage
  };

  const handleLogout = async () => {
    await dataproApi.logout();
    setCurrentUser(null);
    // Navigation will happen via the route protection
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Dynamic admin check based on logged-in user's role
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // Show loading indicator while restoring session
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading your session...</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme} toggleTheme={toggleTheme}>
      <CollaborationProvider>
        <AIProvider>
          <Routes>
            {/* Public Routes - No Auth Required */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Homepage posts={publicPosts} />} />
              <Route path="/post/:id" element={<PublicPostView />} />
            </Route>

            {/* Login Route */}
            <Route 
              path="/admin/login" 
              element={
                currentUser ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />

            {/* Protected Admin Routes - Accessible by any logged-in app user */}
            <Route 
              path="/admin" 
              element={
                currentUser ? (
                  <AdminLayout 
                    currentUser={currentUser}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    toggleTheme={toggleTheme}
                    theme={theme}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard currentUser={currentUser} />} />
              <Route path="posts" element={<Posts currentUser={currentUser} />} />
              <Route path="editor" element={<PostEditor currentUser={currentUser} />} />
              <Route path="editor/:id" element={<PostEditor currentUser={currentUser} />} />
              <Route path="profile" element={<UserProfile currentUser={currentUser} onUpdate={setCurrentUser} />} />
              {/* Admin panel only visible to users with admin role */}
              <Route path="admin-panel" element={
                isAdmin ? 
                <AdminPanel currentUser={currentUser} /> : 
                <Navigate to="/admin/dashboard" replace />
              } />
            </Route>

            {/* 404 Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AIProvider>
      </CollaborationProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;