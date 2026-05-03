import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FreeSolTools vs Sol Cleaner | Keep 100% of Your SOL',
  description: 'Compare SolFree Tools to Sol Cleaner. Don\'t pay hidden fees. Use the true 0% fee token account cleaner on Solana.',
};

export default function VsSolCleanerPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-zinc-300 space-y-12 selection:bg-[#e2fbff]/30">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-6 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="FreeSolTools Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] scale-[1.5]" />
          <span className="text-2xl font-bold text-zinc-600">VS</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/solcleaner-logo.jpg" alt="Sol Cleaner Logo" className="w-16 h-16 rounded-xl object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          FreeSolTools vs <span className="text-blue-400">Sol Cleaner</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Many tools call themselves &quot;Sol Cleaner&quot;, but most charge a hidden service fee. SolFree is the only true 0% fee alternative.
        </p>
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="p-4 font-semibold text-zinc-400">Feature</th>
              <th className="p-4 font-bold text-white bg-zinc-800/30 border-x border-zinc-800">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo.png" alt="FreeSolTools" className="w-6 h-6 object-contain scale-[1.5]" />
                  FreeSolTools
                </div>
              </th>
              <th className="p-4 font-semibold text-zinc-500">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/solcleaner-logo.jpg" alt="Sol Cleaner" className="w-6 h-6 rounded-md object-contain" />
                  Sol Cleaner
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <tr>
              <td className="p-4 font-medium">Hidden Fees</td>
              <td className="p-4 font-bold text-[#e2fbff] bg-zinc-800/30 border-x border-zinc-800">None (0%)</td>
              <td className="p-4 text-zinc-400">Often 20%+</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">You keep per account</td>
              <td className="p-4 font-bold text-green-400 bg-zinc-800/30 border-x border-zinc-800">~0.0020 SOL</td>
              <td className="p-4 font-bold text-red-400">~0.0016 SOL</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">You keep (per 50 accounts)</td>
              <td className="p-4 font-bold text-green-400 bg-zinc-800/30 border-x border-zinc-800">~0.10 SOL</td>
              <td className="p-4 font-bold text-red-400">~0.08 SOL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
        <h2 className="text-2xl font-bold text-white">Not All Cleaners Are Created Equal</h2>
        <p className="leading-relaxed text-zinc-400">
          A generic &quot;Sol Cleaner&quot; often hides a service fee in the transaction. When you approve the transaction in your wallet, you might not notice that a portion of the SOL is being siphoned off to the developer&apos;s wallet.
        </p>
        <p className="leading-relaxed text-zinc-400">
          SolFree guarantees a 0% fee. You can verify this by checking the simulated transaction in your wallet extension before you sign. The only fee you ever pay is the minuscule network fee required by the Solana blockchain itself.
        </p>
      </div>

      <div className="text-center pt-8">
        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-[#e2fbff] hover:bg-[#c2f6ff] rounded-xl transition-colors">
          Clean Your Wallet Free
        </Link>
      </div>
    </main>
  );
}