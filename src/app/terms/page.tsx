import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | FreeSolTools',
  description: 'Terms of use for SolFree Tools.',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-zinc-300 space-y-8 selection:bg-[#e2fbff]/30">
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Use</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
        <p>Welcome to SolFree Tools (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By using our website and services, you agree to these Terms of Use. If you do not agree, please do not use our services.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">2. Service Description</h2>
        <p>SolFree Tools provides a suite of Solana utilities, including a token account cleaner and multisender tools. We operate on a 0% platform fee model. Users interact directly with the Solana blockchain via our open-source logic. We do not have access to your private keys or funds.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">3. Non-Custodial Nature</h2>
        <p>Our tools are strictly non-custodial. We never hold, control, or manage your cryptographic assets. You are solely responsible for safeguarding your wallet and private keys. Every transaction is authorized and signed explicitly by you.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">4. No Smart Contract Risk</h2>
        <p>We do not deploy custom smart contracts to hold or route your funds. Our tools directly construct transactions using standard Solana program instructions (such as the SPL Token program). This minimizes smart contract risks typically associated with third-party DeFi protocols.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">5. Limitation of Liability</h2>
        <p>You use SolFree Tools at your own risk. The tools are provided &quot;as is&quot; and &quot;as available&quot;. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or digital assets resulting from your use of the service.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">6. Updates to Terms</h2>
        <p>We may update these terms occasionally. We will notify users by updating the date at the top of this page or via site announcements.</p>
      </section>
    </main>
  );
}
