import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [tab,      setTab]      = useState('student');   // 'student' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      // role mismatch guard
      if (user.role !== tab) {
        setError(`These credentials belong to an ${user.role} account. Please use the correct tab.`);
        // log them out immediately
        localStorage.removeItem('elective_user');
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fill = (u, p) => { setUsername(u); setPassword(p); setError(''); };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo / title */}
        <div className="login-logo">
          <div className="login-logo-icon">E</div>
          <div>
            <p className="login-inst">IIM Sambalpur</p>
            <h1 className="login-title">Electives Explorer</h1>
          </div>
        </div>

        {/* Role tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => { setTab('student'); setError(''); }}
          >
            Student
          </button>
          <button
            className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => { setTab('admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={tab === 'admin' ? 'admin' : 'student'}
              autoComplete="username"
              required
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : `Sign in as ${tab === 'admin' ? 'Admin' : 'Student'}`}
          </button>
        </form>

        {/* Demo hint */}
        <div className="login-demo">
          <p>Demo credentials</p>
          <div className="login-demo-btns">
            <button onClick={() => { setTab('student'); fill('student', 'student123'); }}>
              Student login
            </button>
            <button onClick={() => { setTab('admin'); fill('admin', 'admin123'); }}>
              Admin login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
