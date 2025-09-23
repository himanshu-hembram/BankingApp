import React from 'react';
import { getUserInfo, getAuthToken } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUserInfo();
  const token = getAuthToken();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800 p-6">
        <div className="bg-white/6 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/6 text-center">
          <p className="text-white">You are not logged in.</p>
          <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-sky-500 rounded">Go to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800 p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white/6 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/6">
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard</h2>
          <p className="text-white/80">Authenticated user info (dummy protected page)</p>

          <div className="mt-6 bg-white/5 p-4 rounded text-white">
            <p><strong>User ID:</strong> {user?.userId}</p>
            <p><strong>Username:</strong> {user?.userName}</p>
            <p><strong>Email:</strong> {user?.userEmailid}</p>
            <p className="break-all mt-2"><strong>Token:</strong> {token ? token.slice(0, 40) + '...' : 'none'}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleLogout} className="px-4 py-2 bg-rose-500 rounded text-white">Logout</button>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-sky-500 rounded text-white">Home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
