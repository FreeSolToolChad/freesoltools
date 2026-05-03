"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Transaction } from '@solana/web3.js';
import { Activity } from '@/lib/db';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return `${years} years ago`;
}

export default function CleanerUI() {
  const { publicKey, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [accounts, setAccounts] = useState<{pubkey: string; mint: string}[]>([]);
  const [scanned, setScanned] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'info', message: string, signature?: string} | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [scannedWallet, setScannedWallet] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setActivities(data.activities))
      .catch(console.error);
      
    const interval = setInterval(() => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setActivities(data.activities))
        .catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scan when a real wallet connects
  useEffect(() => {
    if (publicKey && !scanned && !scanning) {
      scanAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const scanAccounts = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    const targetWallet = publicKey?.toBase58();
    if (!targetWallet) {
      if (!publicKey) setVisible(true);
      return;
    }

    // Basic Solana address validation (base58, 32-44 chars)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(targetWallet)) {
      setStatus({ type: 'error', message: 'Invalid Solana wallet address format.' });
      return;
    }
    
    setScanning(true);
    setStatus(null);
    try {
      const res = await fetch('/api/cleaner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: targetWallet }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.emptyAccounts || []);
        setScanned(true);
        setScannedWallet(targetWallet);
        if (data.emptyAccounts.length === 0) {
          setStatus({ type: 'info', message: 'No empty token accounts found.' });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      setStatus({ type: 'error', message: (err as Error).message || 'Failed to scan accounts' });
    } finally {
      setScanning(false);
    }
  };

  const cleanAccounts = async () => {
    if (!publicKey) {
      // If they manually checked a wallet and try to recover, they MUST connect first
      setVisible(true);
      return;
    }
    
    // Safety check: Ensure they are recovering THEIR OWN accounts, not the manually searched one
    // if it differs from the connected wallet.
    if (scannedWallet && scannedWallet !== publicKey.toBase58()) {
      setStatus({ 
        type: 'error', 
        message: 'You can only recover accounts for the connected wallet. Please rescan your connected wallet.' 
      });
      return;
    }

    if (!signTransaction || accounts.length === 0) return;
    setLoading(true);
    setStatus(null);
    try {
      // 1. Build TX
      const buildRes = await fetch('/api/cleaner/build-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          accountsToClose: accounts.map(a => a.pubkey),
        }),
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok) throw new Error(buildData.error);

      // 2. Sign TX
      const txBuffer = Buffer.from(buildData.transaction, 'base64');
      const transaction = Transaction.from(txBuffer);
      const signedTx = await signTransaction(transaction);

      // 3. Broadcast TX
      const broadcastRes = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction: signedTx.serialize().toString('base64'),
          activityData: {
            wallet: publicKey.toBase58(),
            accountsCount: accounts.length,
            recoveredSol: estimatedRecovery
          }
        }),
      });
      const broadcastData = await broadcastRes.json();
      if (!broadcastRes.ok) throw new Error(broadcastData.error);

      setStatus({ type: 'success', message: `Successfully recovered ${estimatedRecovery.toFixed(4)} SOL`, signature: broadcastData.signature });
      setAccounts([]);
    } catch (err: unknown) {
      setStatus({ type: 'error', message: (err as Error).message || 'Failed to clean accounts' });
    } finally {
      setLoading(false);
    }
  };

  const estimatedRecovery = accounts.length * 0.00203928;

  return (
    <div className="space-y-8">
      <div className="flex justify-center max-w-2xl mx-auto w-full">
        <button
          onClick={() => {
            if (!publicKey) {
              setVisible(true);
            } else {
              scanAccounts();
            }
          }}
          disabled={scanning}
          className="w-full sm:w-64 py-3 px-4 bg-[#e2fbff] hover:bg-[#c2f6ff] text-black rounded-md font-semibold transition-colors flex justify-center items-center h-[50px] gap-2 disabled:opacity-50"
        >
          {scanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning...
            </>
          ) : !publicKey ? (
            'Select Wallet'
          ) : (
            <>
              <Search className="w-5 h-5" />
              Scan Wallet
            </>
          )}
        </button>
      </div>

      {scanned && (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <div>Wallet / Mint</div>
            <div className="text-center">Accounts</div>
            <div className="text-right">Recovered SOL</div>
          </div>
          
          <div className="divide-y divide-zinc-800 max-h-[300px] overflow-y-auto">
            {accounts.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm text-green-400 truncate w-32" title={scannedWallet || ''}>
                    {scannedWallet ? `${scannedWallet.slice(0, 6)}...${scannedWallet.slice(-4)}` : ''}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="text-center font-medium">{accounts.length}</div>
                <div className="text-right text-[#c2f6ff] font-mono">{estimatedRecovery.toFixed(4)}</div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                No empty accounts found to recover.
              </div>
            )}
          </div>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 text-sm space-y-3">
            <div className="flex justify-between items-center text-zinc-400">
              <span>Gross Recovered</span>
              <span className="font-mono text-zinc-300">{estimatedRecovery.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Other Cleaners (~20% Fee)</span>
              <span className="font-mono text-red-400 line-through">-{((estimatedRecovery * 0.2)).toFixed(4)} SOL</span>
            </div>
            <div className="w-full h-px bg-zinc-800/50" />
            <div className="flex justify-between items-center font-medium">
              <span className="text-[#e2fbff] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#e2fbff]"></span>SolFree Fee (0%)</span>
              <span className="font-mono text-[#e2fbff]">-0.0000 SOL</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg pt-1">
              <span className="text-white">You Keep</span>
              <span className="font-mono text-green-400">{estimatedRecovery.toFixed(4)} SOL</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={cleanAccounts}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#e2fbff] hover:bg-[#c2f6ff] text-black rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {loading ? 'Processing...' : `Recover ${estimatedRecovery.toFixed(4)} SOL`}
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-500' :
          status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' :
          'bg-blue-500/10 border border-blue-500/20 text-blue-500'
        }`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm break-all flex flex-wrap items-center gap-1">
            <span>{status.message}</span>
            {status.signature && (
              <span className="opacity-90">
                Signature:{' '}
                <a 
                  href={`https://solscan.io/tx/${status.signature}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:opacity-100 transition-opacity"
                >
                  {status.signature.slice(0, 4)}...{status.signature.slice(-4)}
                </a>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="mt-8 pt-6 border-t border-zinc-800/50">
        <div className="mb-4 text-center md:text-left">
          <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live Activity
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Real transactions happening right now. All verifiable on-chain.</p>
        </div>
        <div className="border border-[#e2fbff]/30 rounded-xl overflow-hidden bg-[#09090b]/50">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-[#e2fbff]/30 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            <div className="col-span-1">Wallet/TX</div>
            <div className="text-center">Accts</div>
            <div className="text-right">Recovered SOL</div>
            <div className="text-right">Time</div>
          </div>
          
          <div className="divide-y divide-[#e2fbff]/20">
            {activities.length > 0 ? activities.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-zinc-800/30 transition-colors text-sm font-mono">
                <div className="col-span-1 flex flex-col gap-1">
                  <div className="text-zinc-200">{row.wallet.slice(0, 4)}...{row.wallet.slice(-4)}</div>
                  <a 
                    href={`https://solscan.io/tx/${row.signature}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#c2f6ff] hover:text-[#e2fbff] transition-colors flex items-center gap-1.5 text-xs"
                  >
                    {row.signature.slice(0, 4)}...{row.signature.slice(-4)}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#e2fbff]" />
                  </a>
                </div>
                <div className="text-center text-zinc-300 font-sans font-medium">{row.accountsCount}</div>
                <div className="text-right text-[#e2fbff] font-sans font-medium">{row.recoveredSol.toFixed(4)} SOL</div>
                <div className="text-right text-zinc-400 font-sans text-xs">{timeAgo(row.timestamp)}</div>
              </div>
            )) : (
              <div className="p-4 text-center text-sm text-zinc-500">Waiting for live activity...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
