'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SlackIntegrationBox from '@/components/SlackIntegrationBox';
import QRCode from 'qrcode';
import type { SlackChannel } from '@/lib/types/database';

interface BotData {
  id?: string;
  name: string;
  department: string;
  description: string;
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: 'file' | 'url' | 'text';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    progress?: number;
    step?: string;
  };
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

const toneOptions = [
  { id: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { id: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { id: 'concise', label: 'Concise', description: 'Brief and to the point' },
];

function ConfigurationBotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const botId = searchParams.get('id');

  const [botData, setBotData] = useState<BotData | null>(null);
  const [activeSection, setActiveSection] = useState('knowledge');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Popup state
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Slack integration state
  const [slackTeamName, setSlackTeamName] = useState<string | null>(null);
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([]);

  // Configuration state
  const [config, setConfig] = useState({
    // Bot Personality
    systemPrompt: '',
    tone: 'professional',
    welcomeMessage: 'Hello! How can I help you today?',

    // Behavior Settings
    confidenceThreshold: 70,
    fallbackMessage: "I'm not sure about that. Let me connect you with someone who can help.",
    enableFollowUp: true,
    suggestRelated: true,

    // Technical Settings
    temperature: 0.7,
    maxTokens: 500,
    memorySize: 5,

    // Access Control
    visibility: 'public', // 'public' | 'private' | 'domain'
    allowedDomain: '',

    // Integrations
    slackConnected: false,
    notionConnected: false,
    confluenceConnected: false,
  });

  // Load existing bot or new bot data
  useEffect(() => {
    const loadBot = async () => {
      if (botId) {
        // Load existing bot from API
        try {
          const response = await fetch(`/api/bots/${botId}`);
          if (response.ok) {
            const data = await response.json();
            const bot = data.bot;
            setBotData({
              id: bot.id,
              name: bot.name,
              department: bot.department,
              description: bot.description || '',
            });
            if (bot.config) {
              setConfig((prev) => ({ ...prev, ...bot.config }));
              // Load invited emails if saved
              if (bot.config.invitedEmails && Array.isArray(bot.config.invitedEmails)) {
                setInvitedEmails(bot.config.invitedEmails);
              }
            }
            // Load knowledge sources
            const sourcesRes = await fetch(`/api/bots/${botId}/knowledge`);
            if (sourcesRes.ok) {
              const sourcesData = await sourcesRes.json();
              setKnowledgeSources(sourcesData.sources || []);
            }
            // Load Slack integration data
            if (bot.slack_team_name) {
              setSlackTeamName(bot.slack_team_name);
              setSlackChannels(bot.slack_channels || []);
            }
          }
        } catch (error) {
          console.error('Error loading bot:', error);
        }
      } else {
        // New bot from sessionStorage
        const storedData = sessionStorage.getItem('newBotData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setBotData(parsed);
          setConfig((prev) => ({
            ...prev,
            systemPrompt: `You are ${parsed.name}, an AI assistant for the ${departments[parsed.department]?.name || 'team'}. ${parsed.description || 'Help users with their questions.'}`,
          }));
        }
      }
    };
    loadBot();
  }, [botId]);

  // Poll for processing sources to update progress
  useEffect(() => {
    const processingIds = knowledgeSources
      .filter((s) => s.status === 'processing')
      .map((s) => s.id);

    if (processingIds.length === 0 || !botData?.id) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bots/${botData.id}/knowledge`);
        if (response.ok) {
          const data = await response.json();
          setKnowledgeSources(data.sources || []);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [knowledgeSources, botData?.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !botData?.id) return;

    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
    setUploading(true);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/bots/${botData.id}/knowledge`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setKnowledgeSources((prev) => [data.source, ...prev]);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    setUploadedFiles([]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeKnowledgeSource = async (sourceId: string) => {
    if (!botData?.id) return;

    try {
      await fetch(`/api/bots/${botData.id}/knowledge/${sourceId}`, {
        method: 'DELETE',
      });
      setKnowledgeSources((prev) => prev.filter((s) => s.id !== sourceId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const addUrl = async () => {
    if (!newUrl.trim() || !botData?.id) return;

    try {
      const response = await fetch(`/api/bots/${botData.id}/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'url',
          name: newUrl.trim(),
          url: newUrl.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setKnowledgeSources((prev) => [data.source, ...prev]);
        setNewUrl('');
      }
    } catch (error) {
      console.error('Add URL error:', error);
    }
  };

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (publish = false) => {
    if (!botData) return;
    setSaving(true);

    try {
      const botConfig = {
        systemPrompt: config.systemPrompt,
        tone: config.tone,
        welcomeMessage: config.welcomeMessage,
        confidenceThreshold: config.confidenceThreshold,
        fallbackMessage: config.fallbackMessage,
        enableFollowUp: config.enableFollowUp,
        suggestRelated: config.suggestRelated,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        memorySize: config.memorySize,
        visibility: config.visibility,
        allowedDomain: config.allowedDomain,
        invitedEmails: invitedEmails,
      };

      if (botData.id) {
        // Update existing bot
        await fetch(`/api/bots/${botData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: botData.name,
            department: botData.department,
            description: botData.description,
            config: botConfig,
            status: publish ? 'active' : 'draft',
          }),
        });
      } else {
        // Create new bot
        const response = await fetch('/api/bots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: botData.name,
            department: botData.department,
            description: botData.description,
            config: botConfig,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBotData({ ...botData, id: data.bot.id });
          sessionStorage.removeItem('newBotData');

          // Update URL with new bot ID
          router.replace(`/configuration-bot?id=${data.bot.id}`);
        }
      }

      if (publish) {
        router.push('/create-bot-dashboard');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Get shareable link URL
  const getShareableLink = () => {
    if (typeof window === 'undefined' || !botData?.id) return '';
    return `${window.location.origin}/chat/${botData.id}`;
  };

  // Generate QR code
  const generateQRCode = async () => {
    const link = getShareableLink();
    if (!link) return;
    try {
      const dataUrl = await QRCode.toDataURL(link, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error('QR Code generation error:', err);
    }
  };

  // Copy link to clipboard
  const copyShareableLink = async () => {
    const link = getShareableLink();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  // Add invited email
  const addInviteEmail = () => {
    const email = newInviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (!invitedEmails.includes(email)) {
      setInvitedEmails([...invitedEmails, email]);
    }
    setNewInviteEmail('');
  };

  // Remove invited email
  const removeInviteEmail = (email: string) => {
    setInvitedEmails(invitedEmails.filter((e) => e !== email));
  };

  // Download QR code as PNG
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${botData?.name || 'bot'}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save visibility config to database
  const saveVisibilityConfig = async (visibility: string, allowedDomain: string = '', invitedEmailsList: string[] = []) => {
    if (!botData?.id) return false;
    try {
      const response = await fetch(`/api/bots/${botData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            ...config,
            visibility,
            allowedDomain,
            invitedEmails: invitedEmailsList,
          },
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving visibility:', error);
      return false;
    }
  };

  // Handle visibility selection and show popup
  const handleVisibilitySelect = async (visibility: 'public' | 'private' | 'domain') => {
    setConfig((prev) => ({ ...prev, visibility, allowedDomain: visibility === 'domain' ? prev.allowedDomain : '' }));
    if (visibility === 'public' && botData?.id) {
      // Save public visibility to DB before showing popup
      await saveVisibilityConfig('public', '');
      generateQRCode();
      setShowSharePopup(true);
    }
  };

  // Handle private visibility with invited users
  const handlePrivateWithInvites = async () => {
    if (!botData?.id) return;
    setSaving(true);
    // Save private visibility and invited emails to DB
    const success = await saveVisibilityConfig('private', '', invitedEmails);
    setSaving(false);
    if (success) {
      setConfig((prev) => ({ ...prev, visibility: 'private', invitedEmails }));
      generateQRCode();
      setShowSharePopup(true);
    }
  };

  // Handle domain visibility
  const handleDomainWithShare = async () => {
    if (!botData?.id || !config.allowedDomain) return;
    setSaving(true);
    // Save domain visibility to DB
    const success = await saveVisibilityConfig('domain', config.allowedDomain);
    setSaving(false);
    if (success) {
      generateQRCode();
      setShowSharePopup(true);
    }
  };

  const sections = [
    { id: 'knowledge', label: 'Knowledge Sources', icon: '📚' },
    { id: 'personality', label: 'Bot Personality', icon: '🎭' },
    { id: 'behavior', label: 'Behavior', icon: '⚡' },
    { id: 'technical', label: 'Technical', icon: '🔧' },
    { id: 'access', label: 'Access Control', icon: '🔒' },
    { id: 'deploy', label: 'Deploy', icon: '🚀' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--card-border)]">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center text-2xl">
                  {botData ? departments[botData.department]?.icon : '🤖'}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                    {botData?.name || 'Configure Bot'}
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {botData ? departments[botData.department]?.name : 'Set up your knowledge bot'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/create-bot-dashboard')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
                >
                  Cancel
                </button>
                {botData?.id && (
                  <button
                    onClick={() => window.open(`/test-bot?id=${botData.id}`, '_blank')}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--accent-primary)] border border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test
                  </button>
                )}
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--card-border)] hover:bg-[var(--sidebar-hover)] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Publish
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Section Navigation */}
          <nav className="w-56 p-4 border-r border-[var(--card-border)] min-h-[calc(100vh-100px)]">
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                    }`}
                  >
                    <span>{section.icon}</span>
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-8 max-w-3xl">
            {/* Knowledge Sources */}
            {activeSection === 'knowledge' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Knowledge Sources</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Add content for your bot to learn from
                  </p>
                </div>

                {/* File Upload */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Upload Files</h3>
                      <p className="text-xs text-[var(--text-muted)]">PDF, DOCX, TXT, MD (max 10MB each)</p>
                    </div>
                  </div>

                  <label className="block w-full p-8 border-2 border-dashed border-[var(--card-border)] rounded-xl hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)]/20 cursor-pointer transition-all">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.txt,.md,.csv,.json,.yaml,.yml,.html,.xml,.png,.jpg,.jpeg,.webp,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        PDF, Word, TXT, MD, CSV, JSON, YAML, HTML, Images
                      </p>
                    </div>
                  </label>

                  {uploading && (
                    <div className="mt-4 p-3 rounded-lg bg-[var(--accent-subtle)] text-center">
                      <div className="w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-[var(--accent-primary)]">Uploading and processing...</p>
                    </div>
                  )}

                  {!botData?.id && (
                    <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-700">Save your bot first to upload files</p>
                    </div>
                  )}

                  {knowledgeSources.filter(s => s.type === 'file').length > 0 && (
                    <div className="mt-4 space-y-2">
                      {knowledgeSources.filter(s => s.type === 'file').map((source) => (
                        <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--sidebar-bg)]">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📄</span>
                            <span className="text-sm text-[var(--text-primary)]">{source.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              source.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              source.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              source.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {source.status === 'processing' && (
                                <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              )}
                              {source.status === 'processing' && source.metadata?.progress !== undefined
                                ? `${source.metadata.progress}%`
                                : source.status}
                            </span>
                          </div>
                          <button
                            onClick={() => removeKnowledgeSource(source.id)}
                            className="p-1 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-muted)]"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* URL Import */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--blue-100)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Import from URL</h3>
                      <p className="text-xs text-[var(--text-muted)]">Scrape content from web pages</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://docs.example.com/guide"
                      className="flex-1 px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                      onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                    />
                    <button
                      onClick={addUrl}
                      className="px-4 py-2 rounded-lg bg-[var(--blue-100)] text-blue-700 text-sm font-medium hover:bg-[var(--blue-100-dark)] transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {!botData?.id && (
                    <p className="mt-2 text-xs text-yellow-600">Save your bot first to add URLs</p>
                  )}

                  {knowledgeSources.filter(s => s.type === 'url').length > 0 && (
                    <div className="mt-4 space-y-2">
                      {knowledgeSources.filter(s => s.type === 'url').map((source) => (
                        <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--sidebar-bg)]">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🔗</span>
                            <span className="text-sm text-[var(--text-primary)] truncate max-w-md">{source.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              source.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              source.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              source.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {source.status === 'processing' && (
                                <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              )}
                              {source.status === 'processing' && source.metadata?.progress !== undefined
                                ? `${source.metadata.progress}%`
                                : source.status}
                            </span>
                          </div>
                          <button
                            onClick={() => removeKnowledgeSource(source.id)}
                            className="p-1 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-muted)]"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Integrations */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[var(--text-primary)]">Connect Integrations</h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-4">Sync knowledge from your existing tools</p>

                  {/* Communication & Collaboration */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">Communication</p>
                    <div className="grid grid-cols-4 gap-3">
                      {/* Slack - Interactive */}
                      {botData?.id && (
                        <SlackIntegrationBox
                          botId={botData.id}
                          slackTeamName={slackTeamName}
                          slackChannels={slackChannels}
                          onUpdate={() => {
                            // Reload bot data to refresh Slack state
                            fetch(`/api/bots/${botData.id}`)
                              .then((res) => res.json())
                              .then((data) => {
                                if (data.bot) {
                                  setSlackTeamName(data.bot.slack_team_name || null);
                                  setSlackChannels(data.bot.slack_channels || []);
                                  // Also reload knowledge sources
                                  fetch(`/api/bots/${botData.id}/knowledge`)
                                    .then((res) => res.json())
                                    .then((sourcesData) => {
                                      setKnowledgeSources(sourcesData.sources || []);
                                    });
                                }
                              });
                          }}
                        />
                      )}
                      {/* Discord - Locked */}
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative opacity-50">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#5865F2] flex items-center justify-center">
                          <span className="text-lg">🎮</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Discord</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Soon</span>
                      </div>
                      {/* MS Teams - Locked */}
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative opacity-50">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#6264A7] flex items-center justify-center">
                          <span className="text-lg">👥</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">MS Teams</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Soon</span>
                      </div>
                      {/* Email - Locked */}
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative opacity-50">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#00897B] flex items-center justify-center">
                          <span className="text-lg">📧</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Email</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Soon</span>
                      </div>
                    </div>
                  </div>

                  {/* Documentation & Knowledge */}
                  <div className="mb-6 opacity-50 pointer-events-none">
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">Documentation</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                          <span className="text-lg">📝</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Notion</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#172B4D] flex items-center justify-center">
                          <span className="text-lg">📘</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Confluence</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#4285F4] flex items-center justify-center">
                          <span className="text-lg">📄</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Google Docs</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#F6AD55] flex items-center justify-center">
                          <span className="text-lg">📚</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">GitBook</span>
                      </div>
                    </div>
                  </div>

                  {/* File Storage */}
                  <div className="mb-6 opacity-50 pointer-events-none">
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">File Storage</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          <span className="text-lg">📁</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Google Drive</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#0078D4] flex items-center justify-center">
                          <span className="text-lg">☁️</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">OneDrive</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#0061FF] flex items-center justify-center">
                          <span className="text-lg">📦</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Dropbox</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#036C70] flex items-center justify-center">
                          <span className="text-lg">🗂️</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">SharePoint</span>
                      </div>
                    </div>
                  </div>

                  {/* Development & Code */}
                  <div className="mb-6 opacity-50 pointer-events-none">
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">Development</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#24292F] flex items-center justify-center">
                          <span className="text-lg">🐙</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">GitHub</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#FC6D26] flex items-center justify-center">
                          <span className="text-lg">🦊</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">GitLab</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#0052CC] flex items-center justify-center">
                          <span className="text-lg">📋</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Jira</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#5E6AD2] flex items-center justify-center">
                          <span className="text-lg">⚡</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Linear</span>
                      </div>
                    </div>
                  </div>

                  {/* CRM & Support */}
                  <div className="mb-6 opacity-50 pointer-events-none">
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">CRM & Support</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#00A1E0] flex items-center justify-center">
                          <span className="text-lg">☁️</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Salesforce</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#FF7A59] flex items-center justify-center">
                          <span className="text-lg">🧲</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">HubSpot</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#03363D] flex items-center justify-center">
                          <span className="text-lg">🎫</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Zendesk</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#1F8CEB] flex items-center justify-center">
                          <span className="text-lg">💬</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Intercom</span>
                      </div>
                    </div>
                  </div>

                  {/* Databases & Internal */}
                  <div className="opacity-50 pointer-events-none">
                    <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">Databases & Other</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#FFCC00] flex items-center justify-center">
                          <span className="text-lg">📊</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Airtable</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#E535AB] flex items-center justify-center">
                          <span className="text-lg">🔗</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">API</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#6366F1] flex items-center justify-center">
                          <span className="text-lg">🔄</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Webhook</span>
                      </div>
                      <div className="p-3 rounded-xl border border-[var(--card-border)] bg-gray-50 flex flex-col items-center gap-2 relative">
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#718096] flex items-center justify-center">
                          <span className="text-lg">🗄️</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)]">Database</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bot Personality */}
            {activeSection === 'personality' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Bot Personality</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Define how your bot communicates with users
                  </p>
                </div>

                {/* System Prompt */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    System Prompt
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Instructions that define your bot's behavior and personality
                  </p>
                  <textarea
                    value={config.systemPrompt}
                    onChange={(e) => setConfig((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                    placeholder="You are a helpful assistant that..."
                  />
                </div>

                {/* Tone Selection */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                    Tone of Voice
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setConfig((prev) => ({ ...prev, tone: tone.id }))}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          config.tone === tone.id
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/40'
                            : 'border-[var(--card-border)] hover:border-[var(--accent-primary)]/50'
                        }`}
                      >
                        <p className="font-medium text-[var(--text-primary)]">{tone.label}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{tone.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>
            )}

            {/* Behavior Settings */}
            {activeSection === 'behavior' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Behavior Settings</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Fine-tune how your bot responds to queries
                  </p>
                </div>

                {/* Confidence Threshold */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)]">
                        Confidence Threshold
                      </label>
                      <p className="text-xs text-[var(--text-muted)]">
                        Minimum confidence level to answer (vs. showing fallback)
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-[var(--accent-primary)]">
                      {config.confidenceThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.confidenceThreshold}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))
                    }
                    className="w-full accent-[var(--accent-primary)]"
                  />
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                    <span>More answers</span>
                    <span>More accurate</span>
                  </div>
                </div>

                {/* Fallback Message */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Fallback Response
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Message shown when bot can't confidently answer
                  </p>
                  <textarea
                    value={config.fallbackMessage}
                    onChange={(e) => setConfig((prev) => ({ ...prev, fallbackMessage: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                  />
                </div>

                {/* Toggles */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Enable Follow-up Questions</p>
                      <p className="text-xs text-[var(--text-muted)]">Bot can ask clarifying questions</p>
                    </div>
                    <button
                      onClick={() => setConfig((prev) => ({ ...prev, enableFollowUp: !prev.enableFollowUp }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.enableFollowUp ? 'bg-[var(--accent-primary)]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                          config.enableFollowUp ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Suggest Related Topics</p>
                      <p className="text-xs text-[var(--text-muted)]">Show related questions after answers</p>
                    </div>
                    <button
                      onClick={() => setConfig((prev) => ({ ...prev, suggestRelated: !prev.suggestRelated }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        config.suggestRelated ? 'bg-[var(--accent-primary)]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                          config.suggestRelated ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Settings */}
            {activeSection === 'technical' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Technical Settings</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Advanced configuration for AI behavior
                  </p>
                </div>

                {/* Temperature */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)]">
                        Temperature
                      </label>
                      <p className="text-xs text-[var(--text-muted)]">
                        Controls randomness in responses
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-[var(--accent-primary)]">
                      {config.temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-[var(--accent-primary)]"
                  />
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Max Response Length
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Maximum tokens per response (1 token ~ 4 characters)
                  </p>
                  <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 500 }))
                    }
                    min="100"
                    max="4000"
                    className="w-32 px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                {/* Memory Size */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Conversation Memory
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Number of previous messages to remember
                  </p>
                  <input
                    type="number"
                    value={config.memorySize}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, memorySize: parseInt(e.target.value) || 5 }))
                    }
                    min="1"
                    max="20"
                    className="w-32 px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>
            )}

            {/* Access Control */}
            {activeSection === 'access' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Access Control</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Control who can access your bot
                  </p>
                </div>

                {/* Visibility */}
                <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                    Visibility
                  </label>
                  <div className="space-y-3">
                    {/* Public */}
                    <button
                      onClick={() => handleVisibilitySelect('public')}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        config.visibility === 'public'
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/40'
                          : 'border-[var(--card-border)] hover:border-[var(--accent-primary)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                          <span className="text-lg">🌐</span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">Public</p>
                          <p className="text-xs text-[var(--text-muted)]">Anyone with the link can access</p>
                        </div>
                      </div>
                    </button>

                    {/* Private */}
                    <div
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        config.visibility === 'private'
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/40'
                          : 'border-[var(--card-border)] hover:border-[var(--accent-primary)]/50'
                      }`}
                    >
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, visibility: 'private', allowedDomain: '' }))}
                        className="w-full flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--error-light)] flex items-center justify-center">
                          <span className="text-lg">🔒</span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">Private</p>
                          <p className="text-xs text-[var(--text-muted)]">Only invited team members can access</p>
                        </div>
                      </button>

                      {/* Invite Users - shown when private visibility is selected */}
                      {config.visibility === 'private' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Invite Team Members
                          </label>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="email"
                              value={newInviteEmail}
                              onChange={(e) => setNewInviteEmail(e.target.value)}
                              placeholder="email@company.com"
                              className="flex-1 px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                              onKeyDown={(e) => e.key === 'Enter' && addInviteEmail()}
                            />
                            <button
                              onClick={addInviteEmail}
                              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-hover)]"
                            >
                              Add
                            </button>
                          </div>
                          {invitedEmails.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {invitedEmails.map((email) => (
                                <div key={email} className="flex items-center justify-between p-2 rounded-lg bg-[var(--sidebar-bg)]">
                                  <span className="text-sm text-[var(--text-primary)]">{email}</span>
                                  <button
                                    onClick={() => removeInviteEmail(email)}
                                    className="p-1 rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-muted)]"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={handlePrivateWithInvites}
                            disabled={!botData?.id}
                            className="w-full px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
                          >
                            Get Shareable Link
                          </button>
                          {!botData?.id && (
                            <p className="text-xs text-yellow-600 mt-2">Save your bot first to get a shareable link</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Domain Specific */}
                    <div
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        config.visibility === 'domain'
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/40'
                          : 'border-[var(--card-border)] hover:border-[var(--accent-primary)]/50'
                      }`}
                    >
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, visibility: 'domain' }))}
                        className="w-full flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--blue-100)] flex items-center justify-center">
                          <span className="text-lg">🏢</span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">Domain Specific</p>
                          <p className="text-xs text-[var(--text-muted)]">Only employees with company email can access</p>
                        </div>
                      </button>

                      {/* Domain Input - shown when domain visibility is selected */}
                      {config.visibility === 'domain' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Company Domain
                          </label>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-[var(--text-muted)]">@</span>
                            <input
                              type="text"
                              value={config.allowedDomain}
                              onChange={(e) => setConfig((prev) => ({ ...prev, allowedDomain: e.target.value }))}
                              placeholder="acme.com"
                              className="flex-1 px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                            />
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-3">
                            Users must sign in with an email ending in @{config.allowedDomain || 'yourdomain.com'}
                          </p>
                          <button
                            onClick={handleDomainWithShare}
                            disabled={!botData?.id || !config.allowedDomain}
                            className="w-full px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
                          >
                            Get Shareable Link
                          </button>
                          {!botData?.id && (
                            <p className="text-xs text-yellow-600 mt-2">Save your bot first to get a shareable link</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Share Popup Modal */}
            {showSharePopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-xl max-w-md w-full mx-4 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Share Your Bot</h3>
                    <button
                      onClick={() => setShowSharePopup(false)}
                      className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-muted)]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Shareable Link */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Shareable Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={getShareableLink()}
                        readOnly
                        className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)] text-sm text-[var(--text-secondary)] truncate"
                      />
                      <button
                        onClick={copyShareableLink}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          linkCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]'
                        }`}
                      >
                        {linkCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    {config.visibility === 'private' && invitedEmails.length > 0 && (
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        {invitedEmails.length} user(s) invited. They will need to sign in to access.
                      </p>
                    )}
                    {config.visibility === 'domain' && (
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        Only users with @{config.allowedDomain} email can access.
                      </p>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                      QR Code
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 rounded-lg bg-white border border-[var(--card-border)] flex items-center justify-center overflow-hidden">
                        {qrCodeDataUrl ? (
                          <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-xs text-[var(--text-muted)]">Loading...</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-secondary)] mb-3">
                          Scan to open the bot on mobile devices
                        </p>
                        <button
                          onClick={downloadQRCode}
                          disabled={!qrCodeDataUrl}
                          className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download PNG
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Done Button */}
                  <button
                    onClick={() => setShowSharePopup(false)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-hover)]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Deploy */}
            {activeSection === 'deploy' && (
              <DeploySection
                botData={botData}
                config={config}
                getShareableLink={getShareableLink}
                copyShareableLink={copyShareableLink}
                linkCopied={linkCopied}
                qrCodeDataUrl={qrCodeDataUrl}
                generateQRCode={generateQRCode}
                downloadQRCode={downloadQRCode}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Deploy Section Component
function DeploySection({
  botData,
  config,
  getShareableLink,
  copyShareableLink,
  linkCopied,
  qrCodeDataUrl,
  generateQRCode,
  downloadQRCode,
}: {
  botData: BotData | null;
  config: { visibility: string; allowedDomain: string };
  getShareableLink: () => string;
  copyShareableLink: () => void;
  linkCopied: boolean;
  qrCodeDataUrl: string;
  generateQRCode: () => void;
  downloadQRCode: () => void;
}) {
  useEffect(() => {
    if (botData?.id && !qrCodeDataUrl) {
      generateQRCode();
    }
  }, [botData?.id, qrCodeDataUrl, generateQRCode]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Deploy Your Bot</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Share your bot with your team
        </p>
      </div>

      {!botData?.id ? (
        <div className="p-6 rounded-xl border border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-700">
            Save your bot first to get shareable links and QR codes.
          </p>
        </div>
      ) : (
        <>
          {/* Share Link */}
          <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={getShareableLink()}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--sidebar-bg)] text-sm text-[var(--text-secondary)] truncate"
              />
              <button
                onClick={copyShareableLink}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  linkCopied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]'
                }`}
              >
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {config.visibility === 'public' && 'Anyone with this link can access your bot.'}
              {config.visibility === 'private' && 'Only invited users can access after signing in.'}
              {config.visibility === 'domain' && `Only users with @${config.allowedDomain || 'yourdomain.com'} email can access.`}
            </p>
          </div>

          {/* QR Code */}
          <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              QR Code
            </label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-lg bg-white border border-[var(--card-border)] flex items-center justify-center overflow-hidden">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Scan to open the bot on mobile devices
                </p>
                <button
                  onClick={downloadQRCode}
                  disabled={!qrCodeDataUrl}
                  className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] opacity-60">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Embed on Website
              </label>
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Coming Soon</span>
            </div>
            <div className="p-4 rounded-lg bg-[var(--sidebar-bg)] font-mono text-xs text-[var(--text-muted)] overflow-x-auto select-none pointer-events-none">
              {`<script src="https://cortexiva.com/embed.js"></script>`}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Add this script to your website to embed the chat widget.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ConfigurationFallback() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="ml-64 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );
}

export default function ConfigurationBot() {
  return (
    <Suspense fallback={<ConfigurationFallback />}>
      <ConfigurationBotContent />
    </Suspense>
  );
}
