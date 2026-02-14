// src/app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginKey: key }),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        setError(data.error || 'Login failed.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Mira Executor
          </h1>
          <p className="text-purple-300 text-sm">
            Enter your 52-digit login key to access your dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Key Input */}
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-slate-300 mb-2">
                Login Key
              </label>
              <input
                id="key"
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your 52-digit key"
                maxLength={52}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-400 mt-2">
                {key.length}/52 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || key.length !== 52}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 space-y-3">
            <a
              href="https://discord.gg/p4fRhak5e4"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
            >
              🎮 Join the Discord!
            </a>
            <p className="text-xs text-slate-400 text-center">
              Don't have a key? Contact your administrator.
            </p>
          </div>
        </div>

        {/* Beta Badge */}
        <div className="mt-4 text-center">
          <span className="inline-block bg-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500/30">
            BETA
          </span>
        </div>
      </div>
    </div>
  );
}