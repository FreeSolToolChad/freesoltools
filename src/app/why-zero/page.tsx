import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why 0% Fees? | Honest & Free Solana Tools - FreeSolTools',
  description: 'Learn why FreeSolTools is the most trusted, 0% fee platform for managing and cleaning your Solana wallet. Non-custodial, transparent, and absolutely free.',
};

export default function WhyZeroPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-zinc-300 space-y-12 selection:bg-[#e2fbff]/30">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Why <span className="text-[#e2fbff]">0% Fees</span>?
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          You shouldn&apos;t have to pay to clean your own wallet. We believe in providing completely free tools for the Solana community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#e2fbff]/10 flex items-center justify-center text-[#e2fbff] mb-6">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Keep 100% of Your SOL</h2>
          <p className="leading-relaxed">
            Other platforms quietly take up to 20% of your recovered rent. We give you back every single drop. It&apos;s your money, and you should keep all of it.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">How We Survive</h2>
          <p className="leading-relaxed">
            Instead of taxing your transactions, we plan to support our platform through simple, non-intrusive advertisements in the future. Until then, enjoy the completely free service.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-4 md:col-span-2 md:max-w-2xl md:mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Safer by Design</h2>
          <p className="leading-relaxed">
            Because we don&apos;t take a fee, we don&apos;t need complex middle-man contracts to route funds. Your recovered SOL goes straight from your closed accounts directly into your main wallet.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-[#e2fbff] hover:bg-[#c2f6ff] rounded-xl transition-colors">
          Start Cleaning Now
        </Link>
      </div>
    </main>
  );
}