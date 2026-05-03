import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-800/50 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-zinc-500">
        
        {/* Left Column - Branding & Socials */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="FreeSolTools Logo" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            <span className="font-bold text-lg tracking-tight text-zinc-300">FreeSolTools</span>
          </div>
          <p className="text-sm">The Only 0% Fee Solana<br/>Wallet Cleaner.</p>
          <a href="mailto:contact@freesoltools.com" className="text-sm hover:text-zinc-300 transition-colors block">
            contact@freesoltools.com
          </a>
          <div className="flex items-center gap-4 pt-2">
            <a href="https://x.com/FreeSolTools" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg width="20" height="20" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.961h-1.96z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Tools Column */}
        <div className="space-y-4">
          <h3 className="font-semibold text-zinc-300">Tools</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Cleaner</Link>
            <Link href="/burn" className="hover:text-zinc-300 transition-colors">Burn</Link>
          </div>
        </div>

        {/* Middle Column - Compare */}
        <div className="space-y-4">
          <h3 className="font-semibold text-zinc-300">Compare</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/vs-solincinerator" className="hover:text-zinc-300 transition-colors">vs Sol Incinerator</Link>
            <Link href="/vs-claimyoursol" className="hover:text-zinc-300 transition-colors">vs Claim Your Sol</Link>
            <Link href="/vs-solcleaner" className="hover:text-zinc-300 transition-colors">vs Sol Cleaner</Link>
            <Link href="/vs-refundyoursol" className="hover:text-zinc-300 transition-colors">vs RefundYourSOL</Link>
            <Link href="/vs-refundsol" className="hover:text-zinc-300 transition-colors">vs RefundSOL</Link>
            <Link href="/vs-unclaimedsol" className="hover:text-zinc-300 transition-colors">vs Unclaimed SOL</Link>
            <Link href="/vs-claimfreesol" className="hover:text-zinc-300 transition-colors">vs ClaimFreeSOL</Link>
            <Link href="/vs-yourfreesol" className="hover:text-zinc-300 transition-colors">vs Your Free SOL</Link>
            <Link href="/vs-claimyoursols" className="hover:text-zinc-300 transition-colors">vs ClaimYourSOLs</Link>
          </div>
        </div>

        {/* Right Column - Legal & About */}
        <div className="space-y-4">
          <h3 className="font-semibold text-zinc-300">Legal & About</h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/why-zero" className="hover:text-zinc-300 transition-colors">Why 0%?</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>

      </div>
      <div className="max-w-5xl mx-auto px-4 py-4 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-600">
        <span>© {new Date().getFullYear()} FreeSolTools</span>
        <span>Built with ❤️ for Solana</span>
      </div>
    </footer>
  );
}
