import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FreeSolTools vs Sol Incinerator | Stop Paying High Cleanup Fees',
  description: 'Compare SolFree Tools to Sol Incinerator. Keep 100% of your recovered SOL rent with our 0% fee token account cleaner.',
};

export default function VsSolIncineratorPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-zinc-300 space-y-12 selection:bg-[#e2fbff]/30">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-6 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="FreeSolTools Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] scale-[1.5]" />
          <span className="text-2xl font-bold text-zinc-600">VS</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/solincinerator-logo.jpg" alt="Sol Incinerator Logo" className="w-16 h-16 rounded-xl object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          FreeSolTools vs <span className="text-red-500">Sol Incinerator</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Stop paying high fees just to clean your own wallet. See why SolFree is the better choice for recovering your Solana rent.
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
                  <img src="/images/solincinerator-logo.jpg" alt="Sol Incinerator" className="w-6 h-6 rounded-md object-contain" />
                  Sol Incinerator
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <tr>
              <td className="p-4 font-medium">Platform Fee</td>
              <td className="p-4 font-bold text-[#e2fbff] bg-zinc-800/30 border-x border-zinc-800">0%</td>
              <td className="p-4 text-zinc-400">2.3% to 5%</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">Smart Contract Risk</td>
              <td className="p-4 text-green-400 bg-zinc-800/30 border-x border-zinc-800">None (Native Instructions)</td>
              <td className="p-4 text-zinc-400">Has Custom Contracts</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">You keep per account</td>
              <td className="p-4 font-bold text-green-400 bg-zinc-800/30 border-x border-zinc-800">~0.0020 SOL</td>
              <td className="p-4 font-bold text-red-400">~0.00195 SOL</td>
            </tr>
            <tr>
              <td className="p-4 font-medium">You keep (per 50 accounts)</td>
              <td className="p-4 font-bold text-green-400 bg-zinc-800/30 border-x border-zinc-800">~0.10 SOL</td>
              <td className="p-4 font-bold text-red-400">~0.0977 SOL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
        <h2 className="text-2xl font-bold text-white">The Hidden Cost of Cleaning</h2>
        <p className="leading-relaxed text-zinc-400">
          Sol Incinerator is a well-known tool, but it takes a significant percentage of the rent you recover as a service fee. If you&apos;re cleaning out dozens or hundreds of accounts, those fees add up fast.
        </p>
        <p className="leading-relaxed text-zinc-400">
          With <strong className="text-white">SolFree Tools</strong>, we use direct native Solana instructions. Because we do not rely on taking a cut to sustain the platform (we plan to use ads instead), you get to keep <strong className="text-white">100% of your SOL</strong>.
        </p>
      </div>

      <div className="text-center pt-8">
        <Link href="/" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-[#e2fbff] hover:bg-[#c2f6ff] rounded-xl transition-colors">
          Recover 100% of your SOL
        </Link>
      </div>
    </main>
  );
}