"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Flame, Info } from 'lucide-react';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Burn Tokens', href: '/burn', icon: Flame },
    { name: 'Why 0%?', href: '/why-zero', icon: Info },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-[#0a0a0a] border-r border-zinc-800/50 min-h-screen sticky top-0">
      <div className="p-4 flex items-center justify-center group h-16 border-b border-zinc-800/50">
        <Link href="/" className="flex items-center justify-center w-full">
          <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="FreeSolTools Logo" width="32" height="32" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] scale-[1.8]" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-zinc-200 transition-colors ml-2">FreeSolTools</span>
        </Link>
      </div>

      <div className="p-4 flex justify-center pb-6">
        <WalletMultiButtonDynamic className="!rounded-lg !w-full !justify-center" />
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href === '/#faq' && pathname === '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                isActive 
                  ? 'bg-[#e2fbff]/10 text-[#e2fbff]' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#e2fbff]' : 'text-zinc-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/50 flex items-center justify-center gap-6 text-zinc-500">
        <a href="https://x.com/FreeSolTools" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
          <span className="sr-only">Twitter</span>
          <svg width="20" height="20" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.961h-1.96z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
