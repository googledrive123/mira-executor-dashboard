// src/app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  created_at: string;
  key_count: number;
  execution_count: number;
}

interface DetailedKey {
  session_key: string;
  hwid: string | null;
  is_active: boolean;
  created_at: string;
  execution_count: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<DetailedKey[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setAuthenticated(true);
      fetchUsers();
    } else {
      alert('Invalid password');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  };

  const fetchUserDetails = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setUserDetails(data.keys);
      setSelectedUser(userId);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel - Mira Executor</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>
            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => fetchUserDetails(user.id)}
                    className={`bg-slate-900/50 rounded-lg p-4 border cursor-pointer transition ${
                      selectedUser === user.id
                        ? 'border-purple-500'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-white font-mono text-sm mb-2">{user.id}</div>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>Keys: {user.key_count}</span>
                      <span>Executions: {user.execution_count}</span>
                      <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">User Details</h2>
            {selectedUser ? (
              <div className="space-y-3">
                {userDetails.map((key, idx) => (
                  <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                    <code className="text-white font-mono text-sm">{key.session_key}</code>
                    <div className="flex gap-2 mt-2">
                      {key.hwid && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          HWID: {key.hwid.substring(0, 8)}...
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          key.is_active
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2">
                      Executions: {key.execution_count} | Created: {new Date(key.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Select a user to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}