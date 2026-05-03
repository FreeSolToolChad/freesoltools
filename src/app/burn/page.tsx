import { Flame } from 'lucide-react';
import BurnerUI from '@/components/BurnerUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Burn Tokens - Recover SOL from SPL Tokens | FreeSolTools',
  description: 'Easily scan your Solana wallet to find and burn unwanted SPL tokens. Recover ~0.002 SOL for every account safely, with exactly 0% platform fees.',
};

export default function BurnPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-50 font-sans selection:bg-[#e2fbff]/30">
      <section className="pt-6 pb-6 px-4 border-b border-zinc-800/50 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[#e2fbff]/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#e2fbff]/10 border border-[#e2fbff]/20 text-xs font-semibold text-[#e2fbff] uppercase tracking-widest mb-2">
            The #1 Zero-Fee Tool on Solana
          </div>
          
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight flex items-center justify-center gap-3">
            <Flame className="w-8 h-8 md:w-14 md:h-14 text-[#e2fbff] fill-[#e2fbff]" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e2fbff] to-[#c2f6ff]">Burn & Close Tokens</span>
          </h1>
          
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Burn unwanted SPL tokens and close their accounts to recover <span className="text-white font-bold">~0.002 SOL</span> per account. Select tokens to remove, review safely, and reclaim your funds instantly with <span className="text-white font-bold">0%</span> fees.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* 1-2-3 Steps Graphic */}
        <div className="hidden sm:flex items-start justify-center gap-4 md:gap-12 text-sm max-w-3xl mx-auto pt-4 pb-4">
          <div className="flex flex-col items-center text-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#e2fbff]/10 text-[#e2fbff] border border-[#e2fbff]/30 flex items-center justify-center font-bold text-lg">1</div>
            <div>
              <h3 className="font-bold text-zinc-200">Scan Tokens</h3>
              <p className="text-zinc-500 text-xs mt-1">Automatically detect all unwanted & dust tokens in your wallet.</p>
            </div>
          </div>
          <div className="w-8 md:w-24 h-px bg-zinc-800 mt-5 hidden sm:block" />
          <div className="flex flex-col items-center text-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#e2fbff]/10 text-[#e2fbff] border border-[#e2fbff]/30 flex items-center justify-center font-bold text-lg">2</div>
            <div>
              <h3 className="font-bold text-zinc-200">Select & Review</h3>
              <p className="text-zinc-500 text-xs mt-1">Choose which tokens to burn. High value tokens are protected.</p>
            </div>
          </div>
          <div className="w-8 md:w-24 h-px bg-zinc-800 mt-5 hidden sm:block" />
          <div className="flex flex-col items-center text-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#e2fbff] text-black flex items-center justify-center font-bold text-lg">3</div>
            <div>
              <h3 className="font-bold text-zinc-200">Burn & Recover</h3>
              <p className="text-zinc-500 text-xs mt-1">Burn tokens, close accounts, and reclaim your locked SOL instantly.</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-zinc-400 pb-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-xs sm:text-sm font-medium">No Smart Contract Risk</span>
          </div>
          <div className="flex items-center gap-2 group relative cursor-help">
            <svg className="w-5 h-5 text-[#e2fbff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs sm:text-sm font-medium border-b border-dashed border-zinc-600 pb-0.5">0% Platform Fee</span>
            
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-300 shadow-[0_0_15px_rgba(226,251,255,0.15)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-left pointer-events-none">
              <div className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2fbff]"></span>
                Why 0%?
              </div>
              <p className="leading-relaxed">
                We believe managing your wallet should be free. To keep our platform running smoothly, we plan to rely on future non-intrusive ads instead of taking a cut of your recovered SOL.
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[6px] border-transparent border-t-zinc-700"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">Verify Before Signing</span>
          </div>
        </div>

        <BurnerUI />

        <div className="pt-8 border-t border-zinc-800/50 space-y-8">
          {/* High Impact 0% Fee Callout */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-[#e2fbff]/10 via-[#e2fbff]/5 to-transparent border border-[#e2fbff]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 shadow-[0_0_30px_rgba(226,251,255,0.1)] text-center sm:text-left">
              <span className="text-[#e2fbff] font-bold flex items-center gap-2 text-sm sm:text-base">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c2f6ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e2fbff]"></span>
                </span>
                Unlike other tools, FreeSolTools takes 0% in hidden fees.
              </span>
              <span className="text-zinc-300 font-medium text-sm sm:text-base">Keep 100% of your rent.</span>
            </div>
          </div>
          
          {/* Why Pay Comparison Section */}
          <div className="max-w-3xl mx-auto bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Why Pay to Recover Your Own Money?</h2>
              <p className="text-zinc-400 text-sm">Compare FreeSolTools against the competition.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden bg-[#0a0a0a]">
              {/* Other Tools */}
              <div className="p-6 md:p-8 flex flex-col items-center text-center border-t-2 border-zinc-800 md:border-r border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2">Other Tools</span>
                <span className="text-white font-semibold mb-6">Sol Incinerator, ClaimYourSol, etc.</span>
                
                <div className="text-3xl md:text-4xl font-black text-red-500 mb-1">20% Fee</div>
                <div className="text-xs text-zinc-500 mb-8">on all recovered SOL</div>
                
                <div className="w-full space-y-4 text-sm mb-8">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>You Keep (per account):</span>
                    <span className="font-mono text-red-500">~0.0016 SOL</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>You Keep (50 accounts):</span>
                    <span className="font-mono text-red-500">~0.08 SOL</span>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-center gap-2 text-zinc-400 text-xs font-medium">
                  <span className="text-red-500 text-sm">✗</span> Hidden Platform Fees
                </div>
              </div>
              
              {/* FreeSolTools */}
              <div className="p-6 md:p-8 bg-gradient-to-b from-[#e2fbff]/5 to-transparent flex flex-col items-center text-center relative border-t-2 border-[#e2fbff]">
                <span className="text-[10px] font-bold text-[#e2fbff] tracking-widest uppercase mb-2">FreeSolTools</span>
                <span className="text-white font-semibold mb-6">The 0% Alternative</span>
                
                <div className="text-3xl md:text-4xl font-black text-white mb-1">0% Fee</div>
                <div className="text-xs text-[#e2fbff] mb-8">Keep 100% of your rent</div>
                
                <div className="w-full space-y-4 text-sm mb-8">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>You Keep (per account):</span>
                    <span className="font-mono text-white font-bold">~0.0020 SOL</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>You Keep (50 accounts):</span>
                    <span className="font-mono text-white font-bold">~0.10 SOL</span>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-center gap-2 text-green-400 text-xs font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  100% Free Forever
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-16 space-y-6">
          <h3 className="text-2xl font-bold">Did you know?</h3>
          <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Each time you receive a token, Solana locks ~0.002 SOL as rent for the token account.<br/>
            Even if a token goes to zero, or you no longer want it, the account stays in your wallet, holding your SOL hostage!
          </p>
          
          <div className="space-y-4 text-left max-w-2xl mx-auto bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <h4 className="font-bold text-lg text-white text-center mb-4">Get Your SOL Back Now!</h4>
            <h5 className="font-semibold text-white">What we do</h5>
            <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-zinc-400">
              <li>We automatically detect unwanted and dust tokens in your wallet</li>
              <li>We minimize your effort by consolidating safe burns into a single transaction</li>
              <li>We use Jupiter to swap remaining value to SOL when possible</li>
              <li>Instantly recover your locked SOL rent</li>
              <li>0% service fee is included for the recovered SOL (100% goes to you!)</li>
            </ul>
          </div>
        </div>

      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SolFree Tools - Token Burner",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Scan your Solana wallet to find and burn unwanted SPL tokens. Recover ~0.002 SOL for every account safely, with exactly 0% platform fees."
          })
        }}
      />
    </main>
  );
}