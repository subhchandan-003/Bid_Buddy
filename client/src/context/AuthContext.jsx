import { createContext, useContext, useState } from 'react';

const USERS = [
  { id: 1, username: 'admin',   password: 'admin123',   role: 'admin',   name: 'Admin' },
  { id: 2, username: 'student', password: 'student123', role: 'student', name: 'Student' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('elective_user')) || null; }
    catch { return null; }
  });

  const login = async (username, password) => {
    const match = USERS.find(u => u.username === username && u.password === password);
    if (!match) throw new Error('Invalid username or password');
    const { password: _pw, ...safeUser } = match;
    setUser(safeUser);
    localStorage.setItem('elective_user', JSON.stringify(safeUser));
    return safeUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elective_user');
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
