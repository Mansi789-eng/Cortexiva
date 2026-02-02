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
  { name: 'Slack', icon: '💬', color: 'bg-purple-900' },
  { name: 'Notion', icon: '📝', color: 'bg-gray-900' },
  { name: 'Confluence', icon: '📘', color: 'bg-blue-900' },
  { name: 'Google Drive', icon: '📁', color: 'bg-blue-500' },
  { name: 'GitHub', icon: '🐙', color: 'bg-gray-800' },
  { name: 'Jira', icon: '📋', color: 'bg-blue-600' },
  { name: 'Zendesk', icon: '🎫', color: 'bg-teal-800' },
  { name: 'HubSpot', icon: '🧲', color: 'bg-orange-500' },
];

const stats = [
  { value: '10x', label: 'Faster answers' },
  { value: '60%', label: 'Less repeat questions' },
  { value: '5min', label: 'Setup time' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Homepage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/homepage" className="flex items-center">
              <span className="text-2xl font-bold gradient-text">Cortexiva</span>
            </Link>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="font-medium text-gray-600 hover:text-primary transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white section-padding pt-32">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container-custom relative">
          <div className="max-w-4xl">
            {/* Tagline */}
            <p className="text-primary font-medium mb-4 animate-fade-in">
              AI-Powered Knowledge Management
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="text-dark">Knowledge Bots That </span>
              <span className="gradient-text">Stay Fresh</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Stop answering the same questions. Build AI assistants that learn from your Notion, Slack, and docs.
            </p>

            {/* Description */}
            <p className="text-gray-500 max-w-2xl mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Create intelligent knowledge bots in minutes. Connect your data sources, customize the experience, and deploy to your team. No coding required.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/login" className="btn-primary">
                Start Building
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Hero Demo */}
          <div className="mt-16 relative animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto px-4 py-1.5 rounded-lg bg-white text-xs text-gray-400 text-center border border-gray-200">
                    cortexiva.com/acme/hr-assistant
                  </div>
                </div>
              </div>

              {/* Chat Demo */}
              <div className="p-8 min-h-[400px] flex flex-col justify-center bg-gray-50">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* User Message */}
                  <div className="flex gap-3 justify-end items-start">
                    <div className="max-w-md px-4 py-3 rounded-2xl rounded-tr-sm bg-primary text-white">
                      <p className="text-sm">What&apos;s our parental leave policy?</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                        👩‍💼
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-medium">Employee</span>
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex gap-3 items-start">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        <span className="text-lg">👥</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">HR Bot</span>
                    </div>
                    <div className="max-w-md px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-600">
                        Our parental leave policy provides <span className="text-primary font-medium">16 weeks of paid leave</span> for all new parents, regardless of gender. You can start your leave up to 2 weeks before your expected due date.
                      </p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
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
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for? Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Who is this for?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Built for teams who are tired of answering the same questions over and over
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '👥', title: 'HR Teams', description: 'Stop answering the same policy questions. Let employees self-serve from your handbook.' },
              { icon: '🎧', title: 'Support Teams', description: 'Instant access to product docs, troubleshooting guides, and past ticket resolutions.' },
              { icon: '💻', title: 'Engineering Teams', description: 'Onboard new devs faster with instant answers from your codebase docs and wikis.' },
            ].map((item) => (
              <div key={item.title} className="group p-6 rounded-xl border border-gray-100 hover:border-primary/20 card-hover bg-white">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-dark mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EU Data Residency Banner */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-white border border-gray-100 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark">100% EU Data Residency</h3>
                  <p className="text-sm text-gray-500">Your data never leaves the European Union. GDPR compliant by design.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {['Hosted: EU', 'Database: EU', 'LLM: EU'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs text-gray-500">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Everything you need to capture tribal knowledge
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Build bots that actually help your team, not frustrate them with outdated answers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-gray-100 hover:border-primary/20 card-hover bg-white"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:bg-primary/20 transition-all">
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-dark group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  {feature.comingSoon && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Live in 5 minutes
            </h2>
            <p className="text-gray-500">
              No engineering required. Seriously.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect your sources', description: 'Link Notion, Google Drive, Confluence, or upload files directly. We handle the rest.', icon: '🔗' },
              { step: '02', title: 'Customize your bot', description: 'Set the tone, add guardrails, define who can access. Make it yours.', icon: '🎨' },
              { step: '03', title: 'Share & deploy', description: 'Get a link, embed on Slack, or add to your website. Your team is ready.', icon: '🚀' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-dark">
                Works with your stack
              </h2>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
                Coming Soon
              </span>
            </div>
            <p className="text-gray-500">
              One-click integrations with the tools you already use.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 opacity-60">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center text-lg`}>
                  {integration.icon}
                </div>
                <span className="font-medium text-dark">{integration.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-gray-300 text-gray-400">
              <span className="text-lg">+</span>
              <span className="font-medium">16 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white">
        <div className="container-custom py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/homepage" className="flex items-center mb-4">
                <span className="text-2xl font-bold gradient-text">Cortexiva</span>
              </Link>
              <p className="text-gray-400 text-sm max-w-xs">
                Knowledge bots that stay fresh. Built for teams who hate outdated docs.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-primary transition-colors text-sm">Features</a></li>
                <li><a href="#integrations" className="text-gray-400 hover:text-primary transition-colors text-sm">Integrations</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">About</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Cortexiva. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
