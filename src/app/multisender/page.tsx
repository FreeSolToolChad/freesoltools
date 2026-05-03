import MultisenderUI from '@/components/MultisenderUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solana Token Multisender - Bulk Send SOL & SPL Tokens',
  description: 'Send SOL or any SPL token to hundreds of addresses at once. Efficiently batch transactions with our 0% fee Solana Multisender.',
  openGraph: {
    title: 'Solana Token Multisender - Bulk Send SOL & SPL Tokens',
    description: 'Send SOL or any SPL token to hundreds of addresses at once. Efficiently batch transactions with our 0% fee Solana Multisender.',
    type: 'website',
  },
};

export default function MultisenderPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-50 font-sans selection:bg-[#e2fbff]/30">
      <section className="max-w-4xl mx-auto px-4 py-16">
        <MultisenderUI />

        {/* FAQ Section */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">What is the Solana Multisender?</h3>
              <p className="text-zinc-400 text-sm">The Solana Multisender is a tool that allows you to send SOL or any SPL token to multiple addresses in a single, batched process. This saves significant time and effort compared to doing manual transfers one by one.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Are there platform fees for sending?</h3>
              <p className="text-zinc-400 text-sm">No, we charge exactly 0% platform fees on all transfers. You will only pay the minimal network fees required by the Solana blockchain to process your transactions.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">How are tokens routed securely?</h3>
              <p className="text-zinc-400 text-sm">The transactions are constructed entirely on our secure backend. The frontend prompts your wallet to sign the pre-built, standard Solana transfer instructions. You can verify all transaction details in your wallet before signing.</p>
            </div>
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
            "name": "SolFree Tools - Token Multisender",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Send SOL or SPL tokens to multiple addresses at once with 0% platform fees on the Solana network."
          })
        }}
      />
    </main>
  );
}
