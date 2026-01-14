import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // External packages for server components (helps with Solana packages)
  serverExternalPackages: [
    '@solana/web3.js',
    '@solana/kit',
    '@solana-program/token',
    'x402',
  ],

  // Use Turbopack (default in Next.js 16)
  turbopack: {},
};

export default nextConfig;
