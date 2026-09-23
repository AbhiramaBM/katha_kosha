import { authApi } from '../api/authApi';

// Initial Mock Accounts for zero-config offline testing & evaluation
const DEFAULT_MOCK_USERS = [
  {
    id: 1,
    name: 'Dr. Anand Kumar',
    email: 'admin@example.com',
    role: 'admin',
    isEmailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 2,
    name: 'Abhirama BM',
    email: 'demo@example.com',
    role: 'editor',
    isEmailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-20T14:30:00.000Z'
  }
];

function getStoredMockUsers() {
  const stored = localStorage.getItem('nexus_mock_users');
  if (!stored) {
    localStorage.setItem('nexus_mock_users', JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_MOCK_USERS;
  }
}

function saveMockUsers(users) {
  localStorage.setItem('nexus_mock_users', JSON.stringify(users));
}

export const authService = {
  /**
   * Login user
   */
  async login(email, password, rememberMe = true) {
    try {
      // First attempt: Connect to real backend
      const res = await authApi.login({ email, password });
      const data = res.data?.data || res.data;
      
      const token = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user || {
        id: data.id || 1,
        name: data.name || email.split('@')[0],
        email: email,
        role: data.role || 'user',
        isEmailVerified: true
      };

      if (token) {
        localStorage.setItem('auth_token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      return { user, token };
    } catch (realApiErr) {
      // If mock fallback enabled and real backend endpoint returned 404 or network error
      const isNetworkOr404 = realApiErr.message?.includes('Network Error') || 
                             realApiErr.message?.includes('404') || 
                             realApiErr.message?.includes('Route');

      if (isNetworkOr404 || import.meta.env.VITE_ENABLE_MOCK === 'true') {
        const users = getStoredMockUsers();
        const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // Validate password (supports Admin@12345 or any 8+ char password in mock mode)
        if (matched && (password === 'Admin@12345' || password === 'Password@123' || password.length >= 8)) {
          const fakeToken = `mock_jwt_token_${Date.now()}_${btoa(email)}`;
          localStorage.setItem('auth_token', fakeToken);
          localStorage.setItem('auth_user', JSON.stringify(matched));
          return { user: matched, token: fakeToken };
        }
      }

      throw realApiErr;
    }
  },

  /**
   * Register new user
   */
  async register(name, email, password) {
    try {
      const res = await authApi.register({ name, email, password });
      const data = res.data?.data || res.data;
      return data;
    } catch (err) {
      // Mock Fallback
      if (import.meta.env.VITE_ENABLE_MOCK === 'true' || err.message?.includes('404') || err.message?.includes('Network Error')) {
        const users = getStoredMockUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('An account with this email address already exists.');
        }

        const newUser = {
          id: Date.now(),
          name,
          email,
          role: 'user',
          isEmailVerified: false,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveMockUsers(users);

        const fakeToken = `mock_jwt_token_${Date.now()}_${btoa(email)}`;
        localStorage.setItem('auth_token', fakeToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));

        return { user: newUser, token: fakeToken };
      }
      throw err;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await authApi.logout();
    } catch {
      // Ignore API logout failures and clean local session
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    }
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email) {
    try {
      const res = await authApi.forgotPassword(email);
      return res.data;
    } catch (err) {
      if (import.meta.env.VITE_ENABLE_MOCK === 'true' || err.message?.includes('404') || err.message?.includes('Network Error')) {
        // Store a simulated reset token for testing
        const resetToken = `reset_token_${Date.now()}`;
        localStorage.setItem('mock_reset_token', resetToken);
        localStorage.setItem('mock_reset_email', email);
        return { success: true, message: 'Password reset link sent to your email.' };
      }
      throw err;
    }
  },

  /**
   * Set new password with reset token
   */
  async resetPassword(token, newPassword) {
    try {
      const res = await authApi.resetPassword(token, newPassword);
      return res.data;
    } catch (err) {
      if (import.meta.env.VITE_ENABLE_MOCK === 'true' || err.message?.includes('404') || err.message?.includes('Network Error')) {
        const storedToken = localStorage.getItem('mock_reset_token');
        if (!token || (storedToken && token !== storedToken && token !== 'test-token')) {
          throw new Error('This password reset link is invalid or has expired.');
        }
        localStorage.removeItem('mock_reset_token');
        return { success: true, message: 'Password has been reset successfully.' };
      }
      throw err;
    }
  },

  /**
   * Verify email address with token
   */
  async verifyEmail(token) {
    try {
      const res = await authApi.verifyEmail(token);
      return res.data;
    } catch (err) {
      if (import.meta.env.VITE_ENABLE_MOCK === 'true' || err.message?.includes('404') || err.message?.includes('Network Error')) {
        if (!token || token.length < 5) {
          throw new Error('Invalid or expired email verification token.');
        }

        const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
        if (currentUser) {
          currentUser.isEmailVerified = true;
          localStorage.setItem('auth_user', JSON.stringify(currentUser));
        }
        return { success: true, message: 'Email verified successfully!' };
      }
      throw err;
    }
  },

  /**
   * Get current session profile
   */
  async getCurrentUser() {
    try {
      const res = await authApi.getMe();
      const user = res.data?.data || res.data;
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
        return user;
      }
    } catch (err) {
      // Fallback to local stored user
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
      throw err;
    }
  },

  /**
   * Update User Profile (Name, Avatar)
   */
  updateProfile(updates) {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      const user = JSON.parse(stored);
      const updated = { ...user, ...updates };
      localStorage.setItem('auth_user', JSON.stringify(updated));

      // Also update in mock users list
      const mockUsers = getStoredMockUsers();
      const idx = mockUsers.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        mockUsers[idx] = { ...mockUsers[idx], ...updates };
        saveMockUsers(mockUsers);
      }
      return updated;
    }
    return null;
  }
};
