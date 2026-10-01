import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sentinelops_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res: any = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Session validation failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res: any = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwtToken } = res.data;
    localStorage.setItem('sentinelops_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('sentinelops_token');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    const roleEmails: Record<UserRole, string> = {
      operator: 'operator@example.com',
      supervisor: 'supervisor@example.com',
      technician: 'technician1@example.com',
      manager: 'manager@example.com',
      admin: 'admin@example.com',
    };
    const targetEmail = roleEmails[role];
    if (targetEmail) {
      await login(targetEmail, 'Password123!');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
