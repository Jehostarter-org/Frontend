'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-2">
          <p className="text-7xl font-bold text-gray-300">404</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            The page you are looking for does not exist or has been moved.
            Please start from the home page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors"
          >
            <Home size={16} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <Search size={16} />
            Go Back
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Jehostarter &mdash; Your Migration Companion
        </p>
      </div>
    </div>
  );
}
