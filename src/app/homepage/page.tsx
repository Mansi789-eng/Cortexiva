'use client';

import Link from 'next/link';

const features = [
  {
    icon: '🔄',
    title: 'Always Fresh Knowledge',
    description: 'Auto-sync with your tools. When docs update, your bot learns instantly. No stale answers.',
  },
  {
    icon: '🎯',
    title: 'Department-Ready',
    description: 'Pre-built templates for HR, Sales, Engineering, Support. Deploy in minutes, not weeks.',
  },
  {
    icon: '🔌',
    title: '24+ Integrations',
    description: 'Connect Slack, Notion, Confluence, Google Drive, GitHub, and more. One-click setup.',
    comingSoon: true,
  },
  {
    icon: '⚡',
    title: 'Instant Answers',
    description: 'Sub-second response times. No more waiting for teammates or searching wikis.',
  },
];

const integrations = [
  { name: 'Slack', icon: '💬', color: '#4A154B' },
  { name: 'Notion', icon: '📝', color: '#191919' },
  { name: 'Confluence', icon: '📘', color: '#172B4D' },
  { name: 'Google Drive', icon: '📁', color: '#4285F4' },
  { name: 'GitHub', icon: '🐙', color: '#24292F' },
  { name: 'Jira', icon: '📋', color: '#0052CC' },
  { name: 'Zendesk', icon: '🎫', color: '#03363D' },
  { name: 'HubSpot', icon: '🧲', color: '#FF7A59' },
];

const stats = [
  { value: '10x', label: 'Faster answers' },
  { value: '60%', label: 'Less repeat questions' },
  { value: '5min', label: 'Setup time' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Homepage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans">
      {/* Animated Glowing Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large teal orb - top left */}
        <div
          className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] rounded-full bg-[#2a9d8f]/15 blur-[120px] animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        {/* Purple orb - top right */}
        <div
          className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#7b2d8e]/10 blur-[100px] animate-pulse"
          style={{ animationDuration: '5s', animationDelay: '1s' }}
        />
        {/* Teal orb - middle */}
        <div
          className="absolute top-[40%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#2a9d8f]/8 blur-[100px] animate-pulse"
          style={{ animationDuration: '6s', animationDelay: '2s' }}
        />
        {/* Purple orb - bottom left */}
        <div
          className="absolute bottom-[-10%] left-[5%] w-[550px] h-[550px] rounded-full bg-[#7b2d8e]/10 blur-[110px] animate-pulse"
          style={{ animationDuration: '5s', animationDelay: '0.5s' }}
        />
        {/* Teal orb - bottom right */}
        <div
          className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full bg-[#2a9d8f]/12 blur-[90px] animate-pulse"
          style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/homepage" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a9d8f] to-[#7b2d8e] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#1e293b]">Cortexiva</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-[#64748b] hover:text-[#2a9d8f] transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-[#64748b] hover:text-[#2a9d8f] transition-colors">How it Works</a>
              <a href="#integrations" className="text-sm text-[#64748b] hover:text-[#2a9d8f] transition-colors">Integrations</a>
              <Link href="/pricing-page" className="text-sm text-[#64748b] hover:text-[#2a9d8f] transition-colors">Pricing</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#1e293b] transition-colors">
                Log in
              </Link>
              <Link
                href="/create-bot-dashboard"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2a9d8f] hover:bg-[#238b7e] transition-all shadow-lg shadow-[#2a9d8f]/20"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1e293b] leading-tight mb-6">
              Knowledge Bots That
              <span className="text-[#2a9d8f]"> Stay Fresh</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-[#64748b] mb-8 leading-relaxed">
              Stop answering the same questions. Build AI assistants that learn from your
              Notion, Slack, and docs — and actually stay up to date.
            </p>

            {/* CTA */}
            <div className="flex items-center mb-8">
              <Link
                href="/create-bot-dashboard"
                className="px-8 py-4 rounded-lg text-base font-semibold text-white bg-[#2a9d8f] hover:bg-[#238b7e] transition-all shadow-lg shadow-[#2a9d8f]/25 flex items-center justify-center gap-2"
              >
                Start Building
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-24 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl border border-[#e2e8f0] shadow-2xl shadow-black/5 overflow-hidden bg-white">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f1f5f9] border-b border-[#e2e8f0]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto px-4 py-1.5 rounded-lg bg-white text-xs text-[#94a3b8] text-center border border-[#e2e8f0]">
                    cortexiva.app/acme/hr-assistant
                  </div>
                </div>
              </div>

              {/* Chat Demo */}
              <div className="p-8 min-h-[400px] flex flex-col justify-center bg-[#f8fafc]">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-md px-4 py-3 rounded-2xl rounded-tr-sm bg-[#2a9d8f] text-white">
                      <p className="text-sm">What's our parental leave policy?</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#7b2d8e] flex items-center justify-center text-white text-sm font-medium">
                      J
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm">
                      <span className="text-sm">👥</span>
                    </div>
                    <div className="max-w-md px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#e2e8f0] shadow-sm">
                      <p className="text-sm text-[#475569]">
                        Our parental leave policy provides <span className="text-[#2a9d8f] font-medium">16 weeks of paid leave</span> for all new parents, regardless of gender. You can start your leave up to 2 weeks before your expected due date.
                      </p>
                      <p className="text-xs text-[#94a3b8] mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        Source: Employee Handbook (updated 2 days ago)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#2a9d8f] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-[#64748b]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for? Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
              Who is this for?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#2a9d8f]/10 flex items-center justify-center text-2xl mb-4">
                👥
              </div>
              <h3 className="text-lg font-semibold text-[#1e293b] mb-2">HR Teams</h3>
              <p className="text-sm text-[#64748b]">Stop answering the same policy questions. Let employees self-serve from your handbook.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#2a9d8f]/10 flex items-center justify-center text-2xl mb-4">
                🎧
              </div>
              <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Support Teams</h3>
              <p className="text-sm text-[#64748b]">Instant access to product docs, troubleshooting guides, and past ticket resolutions.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#2a9d8f]/10 flex items-center justify-center text-2xl mb-4">
                💻
              </div>
              <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Engineering Teams</h3>
              <p className="text-sm text-[#64748b]">Onboard new devs faster with instant answers from your codebase docs and wikis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* EU Data Residency Banner */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-lg shadow-black/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#2a9d8f]/10 border border-[#2a9d8f]/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#2a9d8f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1e293b]">100% EU Data Residency</h3>
                  <p className="text-sm text-[#64748b]">Your data never leaves the European Union. GDPR compliant by design.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0]">
                  <div className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                  <span className="text-xs text-[#64748b]">Hosted: EU</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0]">
                  <div className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                  <span className="text-xs text-[#64748b]">Database: EU</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0]">
                  <div className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                  <span className="text-xs text-[#64748b]">LLM: EU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
              Everything you need to capture tribal knowledge
            </h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
              Build bots that actually help your team, not frustrate them with outdated answers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#2a9d8f]/50 hover:shadow-lg hover:shadow-[#2a9d8f]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#2a9d8f]/10 border border-[#e2e8f0] flex items-center justify-center text-2xl mb-4 group-hover:border-[#2a9d8f]/30 transition-all">
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-[#1e293b]">
                    {feature.title}
                  </h3>
                  {feature.comingSoon && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/20">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
              Live in 5 minutes
            </h2>
            <p className="text-lg text-[#64748b]">
              No engineering required. Seriously.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect your sources',
                description: 'Link Notion, Google Drive, Confluence, or upload files directly. We handle the rest.',
                icon: '🔗',
              },
              {
                step: '02',
                title: 'Customize your bot',
                description: 'Set the tone, add guardrails, define who can access. Make it yours.',
                icon: '🎨',
              },
              {
                step: '03',
                title: 'Share & deploy',
                description: 'Get a link, embed on Slack, or add to your website. Your team is ready.',
                icon: '🚀',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-[#2a9d8f]/10 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-2xl mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1e293b] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b]">
                Works with your stack
              </h2>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/20">
                Coming Soon
              </span>
            </div>
            <p className="text-lg text-[#64748b]">
              One-click integrations with the tools you already use.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 opacity-60">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#e2e8f0] bg-white shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: integration.color }}
                >
                  {integration.icon}
                </div>
                <span className="font-medium text-[#1e293b]">{integration.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-[#cbd5e1] text-[#94a3b8]">
              <span className="text-lg">+</span>
              <span className="font-medium">16 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-[#2a9d8f] to-[#7b2d8e] text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to capture your team's knowledge?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Start building your knowledge bot today.
              </p>
              <Link
                href="/create-bot-dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold text-[#2a9d8f] bg-white hover:bg-gray-50 transition-all shadow-lg"
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-sm text-white/60 mt-4">
                No credit card required. Free forever for 1 bot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#e2e8f0] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/homepage" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a9d8f] to-[#7b2d8e] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-[#1e293b]">Cortexiva</span>
              </Link>
              <p className="text-sm text-[#64748b] max-w-xs">
                Knowledge bots that stay fresh. Built for teams who hate outdated docs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#1e293b] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><a href="#features" className="hover:text-[#2a9d8f] transition-colors">Features</a></li>
                <li><a href="#integrations" className="hover:text-[#2a9d8f] transition-colors">Integrations</a></li>
                <li><Link href="/pricing-page" className="hover:text-[#2a9d8f] transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#1e293b] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><a href="#" className="hover:text-[#2a9d8f] transition-colors">About</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#e2e8f0]">
            <p className="text-sm text-[#94a3b8]">
              © 2026 Cortexiva. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
