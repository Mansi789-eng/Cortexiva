'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface Bot {
  id: string;
  name: string;
  department: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused';
  created_at: string;
  updated_at: string;
}

const departments: Record<string, { name: string; icon: string }> = {
  hr: { name: 'Human Resources', icon: '👥' },
  sales: { name: 'Sales', icon: '💰' },
  engineering: { name: 'Engineering', icon: '⚙️' },
  support: { name: 'Customer Support', icon: '🎧' },
  marketing: { name: 'Marketing', icon: '📣' },
  operations: { name: 'Operations', icon: '📋' },
  finance: { name: 'Finance', icon: '📊' },
  other: { name: 'Other', icon: '🤖' },
};

const statusColors = {
  draft: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Draft' },
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  paused: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Paused' },
};

export default function CreateBotDashboard() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/bots');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?redirectTo=/create-bot-dashboard');
          return;
        }
        throw new Error('Failed to fetch bots');
      }
      const data = await response.json();
      setBots(data.bots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = () => {
    router.push('/create-bot');
  };

  const handleBotClick = (botId: string) => {
    router.push(`/configuration-bot?id=${botId}`);
  };

  const handleTestBot = (e: React.MouseEvent, botId: string) => {
    e.stopPropagation();
    router.push(`/test-bot?id=${botId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--card-border)]">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Create and manage your knowledge bots</p>
            </div>
            {bots.length > 0 && (
              <button
                onClick={handleCreateBot}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-hover)] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Bot
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-muted)]">Loading bots...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchBots}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : bots.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <button
                onClick={handleCreateBot}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-72 h-72 rounded-2xl border-2 border-dashed border-[var(--card-border)] hover:border-[var(--accent-primary)] bg-[var(--card-bg)] hover:bg-[var(--accent-subtle)]/50 transition-all duration-300 ease-out flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-lg"
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isHovered ? 'bg-[var(--accent-primary)] scale-110' : 'bg-[var(--accent-subtle)]'
                  }`}
                >
                  <svg
                    className={`w-10 h-10 transition-all duration-300 ${
                      isHovered ? 'text-white rotate-90' : 'text-[var(--accent-primary)]'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="mt-6 text-center">
                  <p
                    className={`text-lg font-medium transition-colors duration-300 ${
                      isHovered ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    Create New Bot
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-2 px-6">
                    Build a knowledge bot for your team
                  </p>
                </div>
              </button>
              <div className="mt-8 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  No bots yet. Create your first bot to get started.
                </p>
              </div>
            </div>
          ) : (
            /* Bot Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  onClick={() => handleBotClick(bot.id)}
                  className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent-primary)]/50 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center text-2xl">
                      {departments[bot.department]?.icon || '🤖'}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusColors[bot.status]?.bg || 'bg-gray-100'
                      } ${statusColors[bot.status]?.text || 'text-gray-700'}`}
                    >
                      {statusColors[bot.status]?.label || bot.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    {bot.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {departments[bot.department]?.name || 'General'}
                  </p>

                  {bot.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-3 line-clamp-2">
                      {bot.description}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      Created {formatDate(bot.created_at)}
                    </span>
                    {bot.status === 'active' && (
                      <button
                        onClick={(e) => handleTestBot(e, bot.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--accent-primary)] bg-[var(--accent-subtle)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Create New Bot Card */}
              <button
                onClick={handleCreateBot}
                className="p-6 rounded-2xl border-2 border-dashed border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)]/30 transition-all flex flex-col items-center justify-center min-h-[220px] group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--sidebar-hover)] group-hover:bg-[var(--accent-primary)] flex items-center justify-center transition-colors">
                  <svg
                    className="w-6 h-6 text-[var(--text-muted)] group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] mt-3 transition-colors">
                  Create New Bot
                </p>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
