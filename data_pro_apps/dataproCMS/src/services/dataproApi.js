// services/dataproApi.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.data-pro.cloud/api';
const APP_ID = import.meta.env.VITE_APP_ID;

class DataPROApi {
  constructor() {
    this.sessionToken = localStorage.getItem('cms_session_token');
    this.currentUser = JSON.parse(localStorage.getItem('cms_current_user') || 'null');
    this.bindKeyId = localStorage.getItem('cms_bind_key_id');
    this.appId = APP_ID;
    
    console.log('🔧 API Service initialized');
    if (this.sessionToken) {
      console.log('✅ Session token found');
    }
    if (this.currentUser) {
      console.log('👤 User found:', this.currentUser.username);
    }
  }

  // Set session token manually (for session restoration)
  setSessionToken(token) {
    this.sessionToken = token;
    localStorage.setItem('cms_session_token', token);
    console.log('🔑 Session token set');
  }

  // Set current user manually (for session restoration)
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('cms_current_user', JSON.stringify(user));
    console.log('👤 Current user set:', user.username);
  }

  // Verify if current token is still valid
  async verifyToken() {
    if (!this.sessionToken) return false;
    
    try {
      // Try to fetch a protected resource to verify token
      const endpoint = `/apps/${this.appId}/users/me`;
      await this.request(endpoint, {}, true);
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Set the bind key ID (from your bind key configuration)
  setBindKey(bindKeyId) {
    this.bindKeyId = bindKeyId;
    localStorage.setItem('cms_bind_key_id', bindKeyId);
  }

  getHeaders(requireAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
      'X-App-ID': this.appId,
    };
    
    // Always include bind key ID for app-scoped requests
    if (this.bindKeyId) {
      headers['X-Bind-Key-Id'] = this.bindKeyId;
    }
    
    if (requireAuth && this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}, requireAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(requireAuth),
          ...options.headers
        },
      });

      console.log(`📡 Response: ${response.status}`);

      // Handle 401 Unauthorized - clear session
      if (response.status === 401) {
        console.log('🔒 Session expired or invalid');
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============== CMS LOGIN ==============
  
  async login(username, password, bindKeyId) {
    // Store bind key ID if provided
    if (bindKeyId) {
      this.setBindKey(bindKeyId);
    }
    
    if (!this.bindKeyId) {
      throw new Error('No bind key configured. Please set VITE_BIND_KEY_ID in .env');
    }
    
    console.log('========== CMS LOGIN ==========');
    console.log('Username:', username);
    console.log('App ID:', this.appId);
    console.log('Bind Key ID:', this.bindKeyId);
    
    const endpoint = `/apps/${this.appId}/${this.bindKeyId}/auth/login`;
    console.log('Endpoint:', endpoint);
    
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }, false);
    
    if (response.token) {
      this.sessionToken = response.token;
      localStorage.setItem('cms_session_token', response.token);
      console.log('✅ Session token stored');
    }
    
    if (response.user) {
      this.currentUser = response.user;
      localStorage.setItem('cms_current_user', JSON.stringify(response.user));
      console.log('✅ User data stored:', response.user.username);
    }
    
    return response;
  }

  async logout() {
    console.log('🔓 Logging out...');
    this.sessionToken = null;
    this.currentUser = null;
    localStorage.removeItem('cms_session_token');
    localStorage.removeItem('cms_current_user');
    // Don't remove bindKeyId - it's app-specific and persistent
    console.log('✅ Logged out successfully');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.sessionToken && !!this.currentUser;
  }

  // ============== USERS MANAGEMENT ==============
  
  async getAppUsers() {
    const endpoint = `/apps/${this.appId}/users`;
    return await this.request(endpoint, {}, true);
  }

  async getCurrentUserProfile() {
    const endpoint = `/apps/${this.appId}/users/me`;
    return await this.request(endpoint, {}, true);
  }

  async getUser(userId) {
    const endpoint = `/apps/${this.appId}/users/${userId}`;
    return await this.request(endpoint, {}, true);
  }

  async createUser(userData) {
    const endpoint = `/apps/${this.appId}/users`;
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData)
    }, true);
  }

  async updateUser(userId, userData) {
    const endpoint = `/apps/${this.appId}/users/${userId}`;
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }, true);
  }

  async deleteUser(userId) {
    const endpoint = `/apps/${this.appId}/users/${userId}`;
    return await this.request(endpoint, {
      method: 'DELETE'
    }, true);
  }

  // ============== POSTS MANAGEMENT ==============
  
  async getPublicPosts() {
    const endpoint = `/apps/${this.appId}/public/posts`;
    const response = await this.request(endpoint, {}, false);
    return response.items || response || [];
  }

  async getPublicPost(postId) {
    const endpoint = `/apps/${this.appId}/public/posts/${postId}`;
    return await this.request(endpoint, {}, false);
  }

  async getPosts() {
    const endpoint = `/apps/${this.appId}/collections/posts/records`;
    const response = await this.request(endpoint, {}, true);
    return response.items || response || [];
  }

  async getPost(postId) {
    const endpoint = `/apps/${this.appId}/collections/posts/records/${postId}`;
    return await this.request(endpoint, {}, true);
  }

  async createPost(postData) {
    const endpoint = `/apps/${this.appId}/collections/posts/records`;
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(postData)
    }, true);
  }

  async updatePost(postId, postData) {
    const endpoint = `/apps/${this.appId}/collections/posts/records/${postId}`;
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(postData)
    }, true);
  }

  async deletePost(postId) {
    const endpoint = `/apps/${this.appId}/collections/posts/records/${postId}`;
    return await this.request(endpoint, {
      method: 'DELETE'
    }, true);
  }

  // ============== STATISTICS & ANALYTICS ==============
  
  async getDashboardStats() {
    try {
      const posts = await this.getPosts();
      const users = await this.getAppUsers();
      
      const publishedCount = posts.filter(p => p.status === 'published').length;
      const draftCount = posts.filter(p => p.status === 'draft').length;
      const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
      
      return {
        totalPosts: posts.length,
        published: publishedCount,
        drafts: draftCount,
        totalUsers: users.length,
        totalViews: totalViews,
        totalComments: totalComments
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return {
        totalPosts: 0,
        published: 0,
        drafts: 0,
        totalUsers: 0,
        totalViews: 0,
        totalComments: 0
      };
    }
  }

  // ============== COMMENTS MANAGEMENT ==============
  
  async getComments(postId) {
    const endpoint = `/apps/${this.appId}/collections/posts/records/${postId}/comments`;
    return await this.request(endpoint, {}, true);
  }

  async createComment(postId, commentData) {
    const endpoint = `/apps/${this.appId}/collections/posts/records/${postId}/comments`;
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(commentData)
    }, true);
  }

  async deleteComment(postId, commentId) {
    const endpoint = `/apps/${this.appId}/collections/posts/records/${postId}/comments/${commentId}`;
    return await this.request(endpoint, {
      method: 'DELETE'
    }, true);
  }

  // ============== CATEGORIES & TAGS ==============
  
  async getCategories() {
    const endpoint = `/apps/${this.appId}/collections/categories/records`;
    const response = await this.request(endpoint, {}, true);
    return response.items || response || [];
  }

  async createCategory(categoryData) {
    const endpoint = `/apps/${this.appId}/collections/categories/records`;
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(categoryData)
    }, true);
  }

  async getTags() {
    const endpoint = `/apps/${this.appId}/collections/tags/records`;
    const response = await this.request(endpoint, {}, true);
    return response.items || response || [];
  }
}

export default new DataPROApi();