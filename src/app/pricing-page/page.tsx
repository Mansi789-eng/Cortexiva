'use client';

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
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
        {/* Purple orb - bottom */}
        <div
          className="absolute bottom-[-10%] right-[10%] w-[550px] h-[550px] rounded-full bg-[#7b2d8e]/10 blur-[110px] animate-pulse"
          style={{ animationDuration: '5s', animationDelay: '0.5s' }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/homepage" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a9d8f] to-[#7b2d8e] flex items-center justify-center shadow-lg shadow-[#2a9d8f]/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#1e293b]">Cortexiva</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#1e293b] transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2a9d8f] hover:bg-[#238b7e] transition-all shadow-lg shadow-[#2a9d8f]/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e2e8f0] text-[#2a9d8f] text-sm font-medium mb-6 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-pulse" />
              Simple Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] mb-4">
              Start Building Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a9d8f] to-[#7b2d8e]"> Knowledge Bot</span>
            </h1>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
              Choose the plan that fits your needs. Scale as you grow.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Starter Plan */}
            <div className="relative p-8 rounded-3xl border border-[#e2e8f0] bg-white shadow-xl shadow-black/5">
              {/* Badge */}
              <div className="inline-flex px-3 py-1 rounded-full bg-[#f1f5f9] text-[#64748b] text-sm font-medium mb-6">
                Starter
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#1e293b]">€1</span>
                  <span className="text-lg text-[#64748b]">one-time</span>
                </div>
                <p className="text-sm text-[#94a3b8] mt-2">Forever free to test</p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#e2e8f0] my-6" />

              {/* Features */}
              <div className="space-y-4 mb-8">
                {[
                  { feature: '1 Bot', description: 'Create one knowledge assistant' },
                  { feature: '3 Knowledge Sources', description: 'Files or URLs' },
                  { feature: '50 Chats', description: 'Queries to your bot' },
                  { feature: '1 Seat (owner)', description: 'Single user access' },
                  { feature: 'Cortexiva Branding', description: 'Powered by Cortexiva badge' },
                ].map((item) => (
                  <div key={item.feature} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#2a9d8f]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#2a9d8f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#1e293b] font-medium">{item.feature}</p>
                      <p className="text-sm text-[#94a3b8]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button className="w-full py-4 rounded-xl text-base font-semibold text-[#1e293b] border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-all flex items-center justify-center gap-2">
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Plus Plan */}
            <div className="relative p-8 rounded-3xl border-2 border-[#2a9d8f]/50 bg-white shadow-2xl shadow-[#2a9d8f]/10">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2a9d8f] to-[#7b2d8e] text-white text-sm font-semibold shadow-lg shadow-[#2a9d8f]/30">
                Most Popular
              </div>

              {/* Badge */}
              <div className="inline-flex px-3 py-1 rounded-full bg-[#2a9d8f]/10 text-[#2a9d8f] text-sm font-medium mb-6 mt-2">
                Plus
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#1e293b]">€7</span>
                  <span className="text-lg text-[#64748b]">/month</span>
                </div>
                <p className="text-sm text-[#94a3b8] mt-2">€5/bot + €2/seat • Billed monthly</p>
              </div>

              {/* Divider */}
              <div className="border-t border-[#e2e8f0] my-6" />

              {/* Features */}
              <div className="space-y-4 mb-8">
                {[
                  { feature: 'Unlimited Bots', description: '€5 per bot/month', highlight: true },
                  { feature: '1,000 Pages/bot', description: 'Or 20 knowledge sources' },
                  { feature: '1,000 Chats/seat', description: 'Per seat, per month', highlight: true },
                  { feature: 'Unlimited Seats', description: '€2 per seat/month' },
                  { feature: 'No Branding', description: 'White-label your bot' },
                  { feature: 'Priority Support', description: 'Fast response times' },
                ].map((item) => (
                  <div key={item.feature} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.highlight ? 'bg-[#7b2d8e]/15' : 'bg-[#2a9d8f]/10'}`}>
                      <svg className={`w-3 h-3 ${item.highlight ? 'text-[#7b2d8e]' : 'text-[#2a9d8f]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#1e293b] font-medium">{item.feature}</p>
                      <p className="text-sm text-[#94a3b8]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button className="w-full py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#2a9d8f] to-[#7b2d8e] hover:from-[#238b7e] hover:to-[#6a2679] transition-all shadow-xl shadow-[#2a9d8f]/25 hover:shadow-[#2a9d8f]/40 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Upgrade to Plus
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              </div>
          </div>

          {/* Pricing Calculator */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-lg shadow-black/5">
              <h3 className="text-lg font-semibold text-[#1e293b] mb-4 text-center">Plus Plan Pricing Examples</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-[#f8fafc]">
                  <p className="text-2xl font-bold text-[#1e293b]">€7</p>
                  <p className="text-sm text-[#64748b]">1 bot + 1 seat</p>
                </div>
                <div className="p-4 rounded-xl bg-[#f8fafc]">
                  <p className="text-2xl font-bold text-[#1e293b]">€16</p>
                  <p className="text-sm text-[#64748b]">2 bots + 3 seats</p>
                </div>
                <div className="p-4 rounded-xl bg-[#f8fafc]">
                  <p className="text-2xl font-bold text-[#1e293b]">€60</p>
                  <p className="text-sm text-[#64748b]">10 bots + 5 seats</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-[#1e293b] text-center mb-8">Common Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: 'Why the €1 Starter payment?',
                  a: 'It helps us verify real users and reduce spam. You get full access to build and test your bot.',
                },
                {
                  q: 'What counts as a "page"?',
                  a: 'PDF/DOCX pages count as-is. For text/URLs, 1 page = ~3,000 characters. Images count as 1 page each.',
                },
                {
                  q: 'What happens if I hit the chat limit?',
                  a: 'Your bot pauses until next month, or you can add more seats (€2/seat = 1,000 more chats).',
                },
                {
                  q: 'Can I mix bots and seats?',
                  a: 'Yes! Buy any combination. 3 bots + 2 seats = €15 + €4 = €19/month.',
                },
              ].map((item) => (
                <div key={item.q} className="p-5 rounded-xl bg-white border border-[#e2e8f0] shadow-sm">
                  <h3 className="font-semibold text-[#1e293b] mb-2">{item.q}</h3>
                  <p className="text-sm text-[#64748b]">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#e2e8f0] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a9d8f] to-[#7b2d8e] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-sm text-[#94a3b8]">© 2026 Cortexiva. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#94a3b8]">
            <Link href="/homepage" className="hover:text-[#2a9d8f] transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
