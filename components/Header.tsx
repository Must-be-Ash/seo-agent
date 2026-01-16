'use client';

import Link from 'next/link';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { WalletDropdown } from './WalletDropdown';

export function Header() {
  const { isSignedIn } = useIsSignedIn();

  return (
    <header className="relative py-4 px-6 border-b" style={{ borderColor: 'transparent', backgroundColor: 'transparent' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#222222' }}>
              <span className="font-bold text-lg" style={{ color: '#FFFFFF' }}>S</span>
            </div>
            <span className="text-lg font-semibold group-hover:opacity-80 transition-opacity" style={{ color: '#FFFFFF' }}>
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
