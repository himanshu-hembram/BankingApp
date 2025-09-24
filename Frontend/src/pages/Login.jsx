import React, { useState } from 'react';
import api, { setAuthToken, setUserInfo } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { identifier, password });
      // Expected TokenOut: access_token, token_type, userId, userName, userEmailid
      const token = res.data?.access_token;
      if (token) {
        localStorage.setItem('authToken', token);

        // Store user info if needed
        localStorage.setItem(
          'userInfo',
          JSON.stringify({
            userId: res.data.userId,
            userName: res.data.userName,
            userEmailid: res.data.userEmailid,
          })
        );
        setAuthToken(token);
        setUserInfo({ userId: res.data.userId, userName: res.data.userName, userEmailid: res.data.userEmailid });
        navigate('/customer');
      } else {
        setError('No token returned from server');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.detail || 'Authentication failed');
      } else if (err.request) {
        setError('No response from server — is backend running?');
      } else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800 p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white/6 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/6">
          <h2 className="text-2xl font-bold text-white text-center">Login</h2>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-sky-100 mb-2">Username or Email</label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-white focus:ring-2 focus:ring-sky-400"
                placeholder="username or email"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-sky-100 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-white focus:ring-2 focus:ring-sky-400"
                placeholder="password"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div>
              <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-white rounded-xl">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
