'use client';

import { useState, useEffect } from 'react';
import type { SlackChannel } from '@/lib/types/database';

interface SlackChannelWithStatus {
  id: string;
  name: string;
  is_private: boolean;
  num_members?: number;
  is_synced: boolean;
  synced_info?: SlackChannel;
}

interface SlackIntegrationBoxProps {
  botId: string;
  slackTeamName: string | null;
  slackChannels: SlackChannel[];
  onUpdate: () => void;
}

export default function SlackIntegrationBox({
  botId,
  slackTeamName,
  slackChannels,
  onUpdate,
}: SlackIntegrationBoxProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [channels, setChannels] = useState<SlackChannelWithStatus[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [resyncingChannelId, setResyncingChannelId] = useState<string | null>(null);
  const [desyncingChannelId, setDesyncingChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!slackTeamName;

  // Initialize selected channels from props
  useEffect(() => {
    setSelectedChannelIds(new Set(slackChannels.map((c) => c.id)));
  }, [slackChannels]);

  // Fetch channels when popup opens and connected
  useEffect(() => {
    if (showPopup && isConnected) {
      fetchChannels();
    }
  }, [showPopup, isConnected]);

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/slack/channels?botId=${botId}`);
      const data = await response.json();
      if (response.ok) {
        setChannels(data.channels);
      } else {
        setError(data.error || 'Failed to load channels');
      }
    } catch {
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch(`/api/slack/install?botId=${botId}`);
      const data = await response.json();
      if (response.ok && data.url) {
        // Redirect to Slack OAuth
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to generate install URL');
      }
    } catch {
      setError('Failed to connect to Slack');
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/slack/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });
      if (response.ok) {
        setShowPopup(false);
        onUpdate();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to disconnect');
      }
    } catch {
      setError('Failed to disconnect from Slack');
    }
  };

  const handleChannelToggle = (channelId: string) => {
    const newSelected = new Set(selectedChannelIds);
    if (newSelected.has(channelId)) {
      newSelected.delete(channelId);
    } else {
      newSelected.add(channelId);
    }
    setSelectedChannelIds(newSelected);
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await fetch('/api/slack/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          channelIds: Array.from(selectedChannelIds),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowPopup(false);
        onUpdate();
      } else {
        setError(data.error || 'Failed to sync channels');
      }
    } catch {
      setError('Failed to sync channels');
    } finally {
      setSyncing(false);
    }
  };

  const handleResync = async (channelId: string) => {
    setResyncingChannelId(channelId);
    setError(null);
    try {
      const response = await fetch('/api/slack/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, channelId }),
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh channels list
        await fetchChannels();
        onUpdate();
      } else {
        setError(data.error || 'Failed to re-sync channel');
      }
    } catch {
      setError('Failed to re-sync channel');
    } finally {
      setResyncingChannelId(null);
    }
  };

  const handleDesync = async (channelId: string) => {
    setDesyncingChannelId(channelId);
    setError(null);
    try {
      const response = await fetch('/api/slack/sync', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, channelId }),
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh channels list and uncheck the channel
        await fetchChannels();
        const newSelected = new Set(selectedChannelIds);
        newSelected.delete(channelId);
        setSelectedChannelIds(newSelected);
        onUpdate();
      } else {
        setError(data.error || 'Failed to desync channel');
      }
    } catch {
      setError('Failed to desync channel');
    } finally {
      setDesyncingChannelId(null);
    }
  };

  // Always open popup when box is clicked
  const handleBoxClick = () => {
    setShowPopup(true);
  };

  const formatSyncDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Slack Box - Similar to other locked boxes but clickable */}
      <div
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 relative cursor-pointer transition-all ${
          isConnected
            ? 'border-green-300 bg-green-50 hover:border-green-400'
            : 'border-[var(--card-border)] bg-white hover:border-[#4A154B] hover:bg-purple-50'
        }`}
        onClick={handleBoxClick}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <img src="/slack-logo.png" alt="Slack" className="w-8 h-8" />
        </div>
        <span className="text-xs font-medium text-[var(--text-primary)]">Slack</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            isConnected
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isConnected ? 'Connected' : 'Connect'}
        </span>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src="/slack-logo.png" alt="Slack" className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">Slack Integration</h3>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {isConnected ? (
                <>
                  {/* Connected Workspace */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="text-sm text-green-800">Connected to workspace</span>
                      <p className="font-semibold text-green-900">{slackTeamName}</p>
                    </div>
                  </div>

                  {/* Channel Selection */}
                  <p className="text-sm text-gray-600 mb-3">Select channels to import as knowledge:</p>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A154B]"></div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                      {channels.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No channels found</p>
                      ) : (
                        channels.map((channel) => (
                          <div
                            key={channel.id}
                            className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 ${
                              selectedChannelIds.has(channel.id) ? 'bg-purple-50' : ''
                            }`}
                          >
                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                              {channel.is_synced ? (
                                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={selectedChannelIds.has(channel.id)}
                                  onChange={() => handleChannelToggle(channel.id)}
                                  className="w-4 h-4 text-[#4A154B] rounded border-gray-300 focus:ring-[#4A154B]"
                                />
                              )}
                              <span className="text-sm font-medium">#{channel.name}</span>
                            </label>
                            <div className="flex items-center gap-1">
                              {channel.synced_info && (
                                <span className="text-xs text-gray-500 mr-1">
                                  {channel.synced_info.message_count} msgs
                                </span>
                              )}
                              {channel.is_synced && channel.synced_info && (
                                <>
                                  {/* Desync button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDesync(channel.id);
                                    }}
                                    disabled={desyncingChannelId === channel.id}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                    title="Remove sync"
                                  >
                                    {desyncingChannelId === channel.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                      </svg>
                                    )}
                                  </button>
                                  {/* Resync button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResync(channel.id);
                                    }}
                                    disabled={resyncingChannelId === channel.id}
                                    className="p-1 text-gray-500 hover:text-[#4A154B] hover:bg-purple-100 rounded transition-colors disabled:opacity-50"
                                    title="Re-sync channel"
                                  >
                                    {resyncingChannelId === channel.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4A154B]"></div>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Sync Info */}
                  {slackChannels.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      Last synced: {formatSyncDate(slackChannels[0]?.synced_at)}
                    </p>
                  )}
                </>
              ) : (
                /* Not Connected State */
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <img src="/slack-logo.png" alt="Slack" className="w-12 h-12" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Connect Your Slack Workspace</h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Import messages from Slack channels as knowledge for your bot.
                    Click connect to authorize access to your workspace.
                  </p>
                  <button
                    onClick={handleConnect}
                    className="w-full py-3 bg-[#4A154B] text-white rounded-lg font-medium hover:bg-[#3a1139] transition-colors flex items-center justify-center gap-2"
                  >
                    <img src="/slack-logo.png" alt="Slack" className="w-5 h-5" />
                    Connect to Slack
                  </button>
                </div>
              )}
            </div>

            {/* Footer - Only show when connected */}
            {isConnected && (
              <div className="p-4 border-t flex justify-between">
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Disconnect Slack
                </button>
                <button
                  onClick={handleSync}
                  disabled={syncing || selectedChannelIds.size === 0}
                  className="px-4 py-2 text-sm bg-[#4A154B] text-white rounded-lg hover:bg-[#3a1139] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {syncing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Syncing...
                    </>
                  ) : (
                    'Sync Selected Channels'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
