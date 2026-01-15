'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: '#222222' }}
    >
      <div className="text-center px-6">
        <h1
          className="text-8xl font-bold mb-4"
          style={{ color: '#FFFFFF' }}
        >
          404
        </h1>
        <p
          className="text-2xl mb-2"
          style={{ color: '#CCCCCC' }}
        >
          Page not found
        </p>
        <p
          className="text-lg mb-8"
          style={{ color: '#888888' }}
        >
          The page you're looking for doesn't exist
        </p>

        <Link href="/">
          <button
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 mx-auto"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
