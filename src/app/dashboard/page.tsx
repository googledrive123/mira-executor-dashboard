// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  total_executions: number;
  active_keys: number;
  locked_keys: number;
  last_used: string | null;
}

interface UserKey {
  id: string;
  session_key: string;
  hwid: string | null;
  is_active: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [keys, setKeys] = useState<UserKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetHwidModal, setShowResetHwidModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      
      console.log('Fetching stats...');
      
      // Fetch stats
      const statsRes = await fetch('/api/stats/get', {
        credentials: 'include'
      });
      
      console.log('Stats response status:', statsRes.status);
      
      if (statsRes.status === 401) {
        console.log('Not authenticated, redirecting to login');
        router.push('/');
        return;
      }
      
      if (!statsRes.ok) {
        const errorData = await statsRes.json();
        console.error('Stats error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch stats');
      }
      
      const statsData = await statsRes.json();
      console.log('Stats data:', statsData);
      setStats(statsData);

      console.log('Fetching keys...');
      
      // Fetch keys
      const keysRes = await fetch('/api/keys/list', {
        credentials: 'include'
      });
      
      console.log('Keys response status:', keysRes.status);
      
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        console.log('Keys data:', keysData);
        setKeys(keysData.keys || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    setGenerating(true);
    setNewKey(null);

    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        setNewKey(data.sessionKey);
        fetchData(); // Refresh the key list
      } else {
        alert(data.error || 'Failed to generate key');
      }
    } catch (error) {
      console.error('Key generation error:', error);
      alert('Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Reset HWID Modal
  const ResetHwidModal = () => {
    if (!showResetHwidModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Reset HWID</h2>
          <p className="text-slate-300 mb-6">
            To reset your Hardware ID lock, please join our Discord server and open a support ticket.
          </p>
          <div className="flex gap-3">
            <a
              href="https://discord.gg/p4fRhak5e4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
            >
              Join Discord
            </a>
            <button
              onClick={() => setShowResetHwidModal(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mira Executor Dashboard</h1>
            <p className="text-purple-300">Manage your keys and view usage statistics</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Total Executions</div>
            <div className="text-3xl font-bold text-white">{stats?.total_executions || 0}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Active Keys</div>
            <div className="text-3xl font-bold text-green-400">{stats?.active_keys || 0}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">HWID Locked Keys</div>
            <div className="text-3xl font-bold text-purple-400">{stats?.locked_keys || 0}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Last Used</div>
            <div className="text-lg font-semibold text-white">
              {stats?.last_used ? new Date(stats.last_used).toLocaleDateString() : 'Never'}
            </div>
          </div>
        </div>

        {/* Generate New Key Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Generate Session Key</h2>
          <p className="text-slate-300 mb-4">
            Generate your 36-character session key for use with Mira Executor. This key will be locked to your machine on first use. You can only generate one key per account.
          </p>
          
          {keys.length > 0 ? (
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                ℹ️ You already have a key. Only one key per user is allowed.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleGenerateKey}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {generating ? 'Generating...' : 'Generate New Key'}
              </button>

              {newKey && (
                <div className="mt-4 bg-green-900/30 border border-green-500 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm mb-2">Your new session key:</p>
                      <code className="text-white font-mono text-lg">{newKey}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(newKey)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-green-300 text-xs mt-2">
                    ⚠️ Save this key! It won't be shown again.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Keys List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Keys</h2>
            {keys.length > 0 && keys.some(key => key.hwid) && (
              <button
                onClick={() => setShowResetHwidModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
              >
                Reset HWID
              </button>
            )}
          </div>
          
          {keys.length === 0 ? (
            <p className="text-slate-400">No keys generated yet. Create one above to get started.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-white font-mono">{key.session_key}</code>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            key.hwid
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {key.hwid ? 'HWID Locked' : 'Unlocked'}
                        </span>
                        {key.is_active && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs">
                        Created: {new Date(key.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(key.session_key)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render the modal */}
      <ResetHwidModal />
    </div>
  );
}