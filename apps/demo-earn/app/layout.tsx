import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import React from 'react';
import { Toaster } from 'react-hot-toast';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Prism Earn - Stellar RWA Yield',
  description: 'Deposit USDC, settle on Stellar, and access Etherfuse stablebond yield through Prism Earn.',
  openGraph: {
    title: 'Prism Earn - Stellar RWA Yield',
    description: 'A public preview of Prism Earn with Stellar settlement and Etherfuse stablebond markets.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prism Earn - Stellar RWA Yield',
    description: 'A public preview of Prism Earn with Stellar settlement and Etherfuse stablebond markets.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${dmSans.variable}`}>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(240, 6%, 15%)',
              color: 'hsl(0, 0%, 90%)',
              border: '1px solid hsl(0, 0%, 20%)',
            },
          }}
        />
        <header className="site-header">
          <a className="brand" href="/">
            Prism
          </a>
          <nav>
            <a href="#stellar-product">Product</a>
            <a href="#stellar-paths">Paths</a>
            <a href="#implementation-progress">Progress</a>
            <a href="#stellar-wallet">Sandbox</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
