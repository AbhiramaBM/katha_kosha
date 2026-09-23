import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import { useToast } from '../hooks';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Load profile on initialization
  useEffect(() => {
    async function initSession() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          const user = res.data?.data || res.data;
          setCurrentUser(user);
        } catch {
          // Fallback to locally cached user or clear
          const cached = localStorage.getItem('auth_user');
          if (cached) {
            try {
              setCurrentUser(JSON.parse(cached));
            } catch {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              setCurrentUser(null);
            }
          } else {
            localStorage.removeItem('auth_token');
            setCurrentUser(null);
          }
        }
      }
      setIsLoading(false);
    }

    initSession();

    // Event listener for token expiration
    const handleExpired = () => {
      setCurrentUser(null);
      toast.warning('ನಿಮ್ಮ ಲಾಗಿನ್ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಲಾಗಿನ್ ಆಗಿ (Session expired)');
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [toast]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const data = res.data?.data || res.data;

      const token = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const user = data.user || {
        id: data.id || 1,
        name: data.name || (email.startsWith('admin') ? 'Dr. Anand Kumar (ಮುಖ್ಯ ಆಡಳಿತಗಾರ)' : 'ಸಂಪಾದಕರು'),
        email,
        role: data.role || (email.startsWith('admin') ? 'admin' : 'editor'),
        is_active: 1
      };

      if (token) {
        localStorage.setItem('auth_token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      setCurrentUser(user);
      toast.success(`ಸ್ವಾಗತ, ${user.name}! (Welcome back)`);
      return user;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Invalid email or password.';
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('API logout ignored:', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      setCurrentUser(null);
      toast.info('ಯಶಸ್ವಿಯಾಗಿ ಲಾಗೌಟ್ ಆಗಿದೆ (Logged out)');
      setIsLoading(false);
    }
  }, [toast]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      toast.success('ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಗಿದೆ! (Password changed successfully)');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to change password.';
      toast.error(msg);
      throw new Error(msg);
    }
  }, [toast]);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isEditor: currentUser?.role === 'editor',
    isLoading,
    login,
    logout,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
