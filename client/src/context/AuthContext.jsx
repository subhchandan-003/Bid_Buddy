import { createContext, useContext, useState } from 'react';
import { apiFetch } from '../lib/api';

// Fallback credentials for static / offline deployments (no backend)
const STATIC_USERS = [
  { username: 'admin',   password: 'admin123',   role: 'admin',   name: 'Admin' },
  { username: 'student', password: 'student123', role: 'student', name: 'Student' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('elective_user')) || null; }
    catch { return null; }
  });

  const login = async (username, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      localStorage.setItem('elective_token', data.token);
      const { token: _t, ...safeUser } = data;
      setUser(safeUser);
      localStorage.setItem('elective_user', JSON.stringify(safeUser));
      return safeUser;
    } catch {
      // No backend available — validate against static credentials
      const match = STATIC_USERS.find(
        u => u.username === username.trim() && u.password === password
      );
      if (!match) throw new Error('Invalid username or password');
      const safeUser = { username: match.username, role: match.role, name: match.name };
      setUser(safeUser);
      localStorage.setItem('elective_user', JSON.stringify(safeUser));
      return safeUser;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elective_user');
    localStorage.removeItem('elective_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
