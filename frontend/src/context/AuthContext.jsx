import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (token) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Load user error:', err);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password
      });

      if (res.data.token) {
        console.log('Login successful, setting token and user data');
        Cookies.set('token', res.data.token, { expires: 30 });
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      } else {
        console.error('No token received from server');
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err.response?.data?.message || 'Failed to login';
    }
  };

  const register = async (email, password, course, branch) => {
    try {
      const validCourses = ['B.Tech', 'M.Tech', 'MBA', 'BBA', 'Ph.D'];
      const validBranches = {
        'B.Tech': ['CSE', 'IT', 'ECE', 'EEE', 'MAE', 'ICE', 'MPAE', 'BT'],
        'M.Tech': ['CSE', 'IT', 'ECE', 'EEE', 'MAE'],
        'MBA': ['General', 'Finance', 'Marketing'],
        'BBA': ['General', 'Finance', 'Marketing'],
        'Ph.D': ['CSE', 'IT', 'ECE', 'EEE', 'MAE']
      };

      if (!validCourses.includes(course)) {
        throw new Error('Invalid course selection');
      }

      if (!validBranches[course]?.includes(branch)) {
        throw new Error('Invalid branch selection');
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        email,
        password,
        course,
        branch
      });

      if (res.data.token) {
        Cookies.set('token', res.data.token, { expires: 30 });
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Register error:', err);
      throw err.response?.data?.message || 'Failed to register';
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/login';
  };

  const deleteAccount = async () => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/auth/delete-account`, {
        headers: { 'x-auth-token': token }
      });
      Cookies.remove('token');
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      console.error('Delete account error:', err);
      throw err.response?.data?.message || 'Failed to delete account';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
