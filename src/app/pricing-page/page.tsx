'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<'starter' | 'plus' | null>(null);
  const [botCount, setBotCount] = useState(1);
  const [seatCount, setSeatCount] = useState(1);

  const handleStarterCheckout = async () => {
    setLoading('starter');
    try {
      const res = await fetch('/api/stripe/checkout-starter', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.error === 'Unauthorized') {
        // Not logged in, redirect to signup
        router.push('/signup?redirect=/pricing-page');
        return;
      }

      if (data.error === 'Already paid') {
        // Already paid, go to dashboard
        router.push('/create-bot-dashboard');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handlePlusCheckout = async () => {
    setLoading('plus');
    try {
      const res = await fetch('/api/stripe/checkout-plus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botCount, seatCount }),
      });

      const data = await res.json();

      if (data.error === 'Unauthorized') {
        router.push('/signup?redirect=/pricing-page');
        return;
      }

      if (data.error === 'Must complete starter payment first') {
        // Need to pay starter first
        handleStarterCheckout();
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const plusPrice = botCount * 5 + seatCount * 2;

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

      {/* Pricing Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white section-padding pt-32">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container-custom relative">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-primary font-medium mb-4 animate-fade-in">
              Simple Pricing
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
              <span className="text-dark">Start Building Your </span>
              <span className="gradient-text">Knowledge Bot</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Choose the plan that fits your needs. Scale as you grow.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="relative p-8 rounded-2xl border border-gray-100 bg-white shadow-xl card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {/* Badge */}
              <div className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
                Starter
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-dark">€1</span>
                  <span className="text-lg text-gray-500">one-time</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Forever free to test</p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-6" />

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
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark font-medium">{item.feature}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleStarterCheckout}
                disabled={loading === 'starter'}
                className="btn-secondary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'starter' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Get Started
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Plus Plan */}
            <div className="relative p-8 rounded-2xl border-2 border-primary/30 bg-white shadow-2xl card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full gradient-bg text-white text-sm font-semibold shadow-lg">
                Most Popular
              </div>

              {/* Badge */}
              <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 mt-2">
                Plus
              </div>

              {/* Price Calculator */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-dark">€{plusPrice}</span>
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">€5/bot + €2/seat • Billed monthly</p>

                {/* Quantity Selectors */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Bots (€5/each)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBotCount(Math.max(1, botCount - 1))}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{botCount}</span>
                      <button
                        onClick={() => setBotCount(botCount + 1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Seats (€2/each)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{seatCount}</span>
                      <button
                        onClick={() => setSeatCount(seatCount + 1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-6" />

              {/* Features */}
              <div className="space-y-4 mb-8">
                {[
                  { feature: `${botCount} Bot${botCount > 1 ? 's' : ''}`, description: '€5 per bot/month', highlight: true },
                  { feature: '20 Sources/bot', description: 'Or 1,000 pages' },
                  { feature: `${seatCount * 1000} Chats/month`, description: `${seatCount} seat${seatCount > 1 ? 's' : ''} × 1,000 chats`, highlight: true },
                  { feature: 'No Branding', description: 'White-label your bot' },
                  { feature: 'Priority Support', description: 'Fast response times' },
                ].map((item) => (
                  <div key={item.feature} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.highlight ? 'bg-secondary/15' : 'bg-primary/10'}`}>
                      <svg className={`w-3 h-3 ${item.highlight ? 'text-secondary' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark font-medium">{item.feature}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handlePlusCheckout}
                disabled={loading === 'plus'}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'plus' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade to Plus
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-dark text-center mb-8">Common Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
                <div key={item.q} className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm card-hover">
                  <h3 className="font-semibold text-dark mb-2">{item.q}</h3>
                  <p className="text-sm text-gray-500">{item.a}</p>
                </div>
              ))}
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
                <li><Link href="/homepage#features" className="text-gray-400 hover:text-primary transition-colors text-sm">Features</Link></li>
                <li><Link href="/homepage#integrations" className="text-gray-400 hover:text-primary transition-colors text-sm">Integrations</Link></li>
                <li><Link href="/pricing-page" className="text-gray-400 hover:text-primary transition-colors text-sm">Pricing</Link></li>
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
