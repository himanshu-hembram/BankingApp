import React, { useState } from 'react';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // For now, just log values. Integrate with backend /admin/login later.
    console.log('login', { identifier, password });
    // TODO: call backend and store token
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
              />
            </div>

            <div>
              <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-sky-400 to-indigo-500 text-white rounded-xl">Sign in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
