'use client';

import Link from 'next/link';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { WalletDropdown } from './WalletDropdown';

export function Header() {
  const { isSignedIn } = useIsSignedIn();

  return (
    <header className="relative py-4 px-6 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
              SEO Gap Analyzer
            </span>
          </div>
        </Link>

        {/* Auth / Wallet */}
        <nav className="flex items-center gap-3">
          {isSignedIn ? (
            <WalletDropdown />
          ) : (
            <AuthButton />
          )}
        </nav>
      </div>
    </header>
  );
}
