import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | FreeSolTools',
  description: 'Privacy policy for SolFree Tools.',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-zinc-300 space-y-8 selection:bg-[#e2fbff]/30">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
        <p>Your privacy is critically important to us. This Privacy Policy explains how SolFree Tools collects, uses, and protects your information when you use our website.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">2. What We Collect</h2>
        <p><strong>Wallet Addresses &amp; Public Blockchain Data:</strong> We interact with the Solana blockchain. By nature, your wallet address and transaction history are public. We may temporarily cache or store public transaction hashes (signatures) and wallet addresses for our &quot;Live Activity&quot; and &quot;Global Stats&quot; features to show real-time platform usage.</p>
        <p><strong>No Personal Information:</strong> We do not ask for, collect, or store personal identifiable information (PII) such as names, email addresses, or IP addresses linked to user identities.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">3. How We Use Information</h2>
        <p>We use public on-chain data solely to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide the core functionality of the Sol Cleaner and Multisender tools.</li>
          <li>Display aggregated global statistics (e.g., total SOL recovered).</li>
          <li>Display recent anonymous transaction activity on our site to build trust.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
        <p>Because we do not store personal data or private keys, there is no risk of your sensitive data being breached from our servers. All transaction signing happens securely within your own wallet extension (e.g., Phantom, Solflare).</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">5. Third-Party Services</h2>
        <p>We rely on third-party RPC nodes (like Helius) to broadcast transactions to the Solana network. Their handling of requests is governed by their respective privacy policies.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">6. Changes to this Policy</h2>
        <p>We may update our Privacy Policy from time to time. Any changes will be reflected on this page.</p>
      </section>
    </main>
  );
}
