'use client';

import { useState } from 'react';
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
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    description: 'SOC2 compliant. Domain-restricted access. Your data never trains external models. 100% EU hosted.',
  },
  {
    icon: '📊',
    title: 'Usage Analytics',
    description: 'See what your team asks. Identify knowledge gaps. Improve documentation.',
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

const testimonials = [
  {
    quote: "Our onboarding time dropped 60%. New hires get answers instantly instead of waiting for someone to reply on Slack.",
    author: 'Sarah Chen',
    role: 'Head of People',
    company: 'TechFlow',
    avatar: 'S',
  },
  {
    quote: "Sales reps close deals faster because they can pull accurate pricing and specs in seconds during calls.",
    author: 'Marcus Johnson',
    role: 'VP of Sales',
    company: 'ScaleUp Inc',
    avatar: 'M',
  },
  {
    quote: "Finally, tribal knowledge doesn't leave when employees do. Everything is captured and searchable.",
    author: 'Priya Patel',
    role: 'CTO',
    company: 'BuildRight',
    avatar: 'P',
  },
];

const stats = [
  { value: '10x', label: 'Faster answers' },
  { value: '60%', label: 'Less repeat questions' },
  { value: '5min', label: 'Setup time' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Homepage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#0ea5e9]/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#06b6d4]/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/8 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/homepage" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Cortexiva</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it Works</a>
              <a href="#integrations" className="text-sm text-gray-400 hover:text-white transition-colors">Integrations</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Log in
              </button>
              <Link
                href="/create-bot-dashboard"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] hover:from-[#0284c7] hover:to-[#0891b2] transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
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
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Now with GPT-4 Turbo
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Knowledge Bots That
              <span className="relative inline-block ml-3">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee]"> Stay Fresh</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 150 4 298 10" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Stop answering the same questions. Build AI assistants that learn from your
              Notion, Slack, and docs — and actually stay up to date.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/create-bot-dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] hover:from-[#0284c7] hover:to-[#0891b2] transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Start Building — It's Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-gray-500 mb-4">
              Trusted by 500+ teams including
            </p>
            <div className="flex items-center justify-center gap-8 opacity-40">
              <span className="text-lg font-semibold text-gray-300">Stripe</span>
              <span className="text-lg font-semibold text-gray-300">Notion</span>
              <span className="text-lg font-semibold text-gray-300">Linear</span>
              <span className="text-lg font-semibold text-gray-300">Vercel</span>
              <span className="text-lg font-semibold text-gray-300">Figma</span>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0ea5e9]/20 to-[#06b6d4]/20 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#0f172a]">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#1e293b] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto px-4 py-1.5 rounded-lg bg-[#0f172a] text-xs text-gray-500 text-center border border-white/5">
                    cortexiva.app/acme/hr-assistant
                  </div>
                </div>
              </div>

              {/* Chat Demo */}
              <div className="p-8 min-h-[400px] flex flex-col justify-center">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-md px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white shadow-lg shadow-cyan-500/20">
                      <p className="text-sm">What's our parental leave policy?</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-purple-500/20">
                      J
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1e293b] border border-white/10 flex items-center justify-center">
                      <span className="text-sm">👥</span>
                    </div>
                    <div className="max-w-md px-4 py-3 rounded-2xl rounded-tl-sm bg-[#1e293b] border border-white/10">
                      <p className="text-sm text-gray-200">
                        Our parental leave policy provides <span className="text-cyan-400 font-medium">16 weeks of paid leave</span> for all new parents, regardless of gender. You can start your leave up to 2 weeks before your expected due date.
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0ea5e9]/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EU Data Residency Banner */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e293b] border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">100% EU Data Residency</h3>
                  <p className="text-sm text-gray-400">Your data never leaves the European Union. GDPR compliant by design.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-gray-400">Database: Frankfurt</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-gray-400">AI: Netherlands</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-gray-400">API: Amsterdam</span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to capture tribal knowledge
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Build bots that actually help your team, not frustrate them with outdated answers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-500/50 hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#06b6d4]/20 border border-white/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/5 via-transparent to-[#0ea5e9]/5" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Live in 5 minutes
            </h2>
            <p className="text-lg text-gray-400">
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
                <div className="text-6xl font-bold text-cyan-500/10 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center text-2xl mb-4 shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Works with your stack
            </h2>
            <p className="text-lg text-gray-400">
              One-click integrations with the tools you already use.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/50 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: integration.color }}
                >
                  {integration.icon}
                </div>
                <span className="font-medium text-white">{integration.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-white/20 text-gray-500">
              <span className="text-lg">+</span>
              <span className="font-medium">16 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0ea5e9]/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Teams ship faster with Cortexiva
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="p-6 rounded-2xl bg-[#0f172a] border border-white/10 shadow-xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center text-white font-semibold shadow-lg shadow-cyan-500/20">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-400">
              Start free. Scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0f172a]">
              <h3 className="text-lg font-semibold text-white mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">Perfect for trying out Cortexiva</p>
              <ul className="space-y-3 mb-6">
                {['1 bot', '100 queries/month', '1 knowledge source', 'Community support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg text-sm font-medium border border-white/10 text-white hover:bg-white/5 transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-2xl border-2 border-cyan-500/50 bg-[#0f172a] relative shadow-xl shadow-cyan-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white text-xs font-medium">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-gray-500">/bot/month</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">For growing teams</p>
              <ul className="space-y-3 mb-6">
                {['Unlimited queries', '10 knowledge sources', 'Slack & Teams integration', 'Analytics dashboard', 'Priority support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white hover:from-[#0284c7] hover:to-[#0891b2] transition-all shadow-lg shadow-cyan-500/25">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0f172a]">
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">For large organizations</p>
              <ul className="space-y-3 mb-6">
                {['Unlimited bots', 'Unlimited sources', 'SSO & SAML', 'Custom integrations', 'Dedicated support', 'SLA guarantee'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg text-sm font-medium border border-white/10 text-white hover:bg-white/5 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#06b6d4]/20 border border-cyan-500/20 text-center relative overflow-hidden backdrop-blur-sm">
            {/* Background decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to capture your team's knowledge?
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Join 500+ teams using Cortexiva to answer questions instantly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:w-80 px-5 py-4 rounded-xl text-white bg-[#0f172a] border border-white/10 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 placeholder-gray-500"
                />
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] hover:from-[#0284c7] hover:to-[#0891b2] transition-all shadow-xl shadow-cyan-500/25">
                  Get Started Free
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required. Free forever for 1 bot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/homepage" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Cortexiva</span>
              </Link>
              <p className="text-sm text-gray-500 max-w-xs">
                Knowledge bots that stay fresh. Built for teams who hate outdated docs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
            <p className="text-sm text-gray-600">
              © 2024 Cortexiva. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
