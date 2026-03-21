import { createContext, useContext, useState } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('elective_user')) || null; }
    catch { return null; }
  });

  const login = async (username, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim(), password }),
    });

    // Store JWT separately; store safe user profile for UI
    localStorage.setItem('elective_token', data.token);
    const { token: _t, ...safeUser } = data;
    setUser(safeUser);
    localStorage.setItem('elective_user', JSON.stringify(safeUser));
    return safeUser;
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
