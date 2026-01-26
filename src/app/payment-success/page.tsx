'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/create-bot-dashboard';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md w-full text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h1>

      {/* Message based on type */}
      {type === 'starter' ? (
        <p className="text-gray-600 mb-6">
          Welcome to Cortexiva! Your account is now activated. You can create your first knowledge bot.
        </p>
      ) : type === 'plus' ? (
        <p className="text-gray-600 mb-6">
          You&apos;re now on the Plus plan! Enjoy unlimited potential with your bots and seats.
        </p>
      ) : (
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your account has been updated.
        </p>
      )}

      {/* Redirect notice */}
      <p className="text-sm text-gray-500 mb-6">
        Redirecting to dashboard in {countdown} seconds...
      </p>

      {/* Manual link */}
      <Link
        href="/create-bot-dashboard"
        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
      >
        Go to Dashboard
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>

      {/* Receipt info */}
      <p className="text-xs text-gray-400 mt-8">
        A receipt has been sent to your email address.
      </p>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 animate-pulse" />
      <div className="h-8 bg-gray-100 rounded w-3/4 mx-auto mb-4 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-full mx-auto animate-pulse" />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
