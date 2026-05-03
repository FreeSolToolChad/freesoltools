"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, AlertCircle, Search, Flame, ShieldCheck, Info, X } from 'lucide-react';
import { VersionedTransaction, Transaction } from '@solana/web3.js';
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

function formatSmallNumber(num: number): React.ReactNode {
  if (num === 0) return '$0.00';
  if (num >= 0.01) return `$${num.toFixed(3)}`;
  
  const str = num.toFixed(10);
  const match = str.match(/^0\.0(0+)(\d+)$/);
  if (match) {
    const zeros = match[1].length + 1;
    const rest = match[2].replace(/0+$/, '').slice(0, 4);
    if (zeros >= 3) {
      return (
        <span className="inline-flex items-baseline">
          $0.0<sub className="text-[10px] leading-none mb-[-2px] ml-[1px]">{zeros}</sub>{rest}
        </span>
      );
    }
  }
  return `$${num.toFixed(6).replace(/0+$/, '')}`;
}

export default function BurnerUI() {
  const { publicKey, signAllTransactions, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [accounts, setAccounts] = useState<{
    pubkey: string; 
    mint: string; 
    amount?: string; 
    uiAmount?: number;
    valueUsd?: number;
    info?: { name: string; symbol: string; imageUrl: string | null; priceUsd: number }
  }[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [scanned, setScanned] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'info', message: string, signature?: string} | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [filterValue, setFilterValue] = useState<'unknown' | '1' | '5' | '10' | 'all'>('unknown');
  const [pendingFilter, setPendingFilter] = useState<'all' | null>(null);
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

    setScanning(true);
    setStatus(null);
    try {
      const res = await fetch('/api/burn/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: targetWallet }),
      });
      const data = await res.json();
      if (res.ok) {
        const fetchedAccounts = data.accounts || [];
        setAccounts(fetchedAccounts);
        // Select all matching the initial filter (unknown) by default
        const initialFiltered = fetchedAccounts.filter((a: { valueUsd?: number }) => a.valueUsd === undefined || a.valueUsd === 0);
        setSelectedAccounts(new Set(initialFiltered.map((a: { pubkey: string }) => a.pubkey)));
        setScanned(true);
        setScannedWallet(targetWallet);
        if (data.accounts.length === 0) {
          setStatus({ type: 'info', message: 'No accounts found to burn.' });
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

  const toggleSelection = (pubkey: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(pubkey)) {
      newSelected.delete(pubkey);
    } else {
      newSelected.add(pubkey);
    }
    setSelectedAccounts(newSelected);
  };

  const selectAll = () => {
    const filteredPubkeys = filteredAccounts.map(a => a.pubkey);
    const allSelected = filteredPubkeys.length > 0 && filteredPubkeys.every(pk => selectedAccounts.has(pk));
    
    const newSelected = new Set(selectedAccounts);
    if (allSelected) {
      // deselect all currently filtered
      filteredPubkeys.forEach(pk => newSelected.delete(pk));
    } else {
      // select all currently filtered
      filteredPubkeys.forEach(pk => newSelected.add(pk));
    }
    setSelectedAccounts(newSelected);
  };

  const executeBurn = async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    
    if (scannedWallet && scannedWallet !== publicKey.toBase58()) {
      setStatus({ 
        type: 'error', 
        message: 'You can only recover accounts for the connected wallet. Please rescan your connected wallet.' 
      });
      return;
    }

    const accountsToBurn = accounts.filter(a => selectedAccounts.has(a.pubkey));
    if ((!signAllTransactions && !signTransaction) || accountsToBurn.length === 0) return;
    
    setLoading(true);
    setStatus(null);
    setShowConfirmModal(false);
    
    try {
      const buildRes = await fetch('/api/burn/build-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          accountsToBurn: accountsToBurn,
        }),
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok) throw new Error(buildData.error);

      // Deserialize all transactions
      const txsToSign = buildData.transactions.map((txStr: string) => {
        const buffer = Buffer.from(txStr, 'base64');
        try {
          return VersionedTransaction.deserialize(new Uint8Array(buffer));
        } catch {
          return Transaction.from(buffer);
        }
      });

      let signedTxs: (VersionedTransaction | Transaction)[] = [];
      if (signAllTransactions) {
        signedTxs = await signAllTransactions(txsToSign);
      } else if (signTransaction) {
        for (const tx of txsToSign) {
          const signed = await signTransaction(tx as Transaction & VersionedTransaction);
          signedTxs.push(signed);
        }
      }
      
      let lastSignature = '';

      for (let i = 0; i < signedTxs.length; i++) {
        const signedTx = signedTxs[i];
        const isLast = i === signedTxs.length - 1;
        
        const broadcastRes = await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signedTransaction: Buffer.from(signedTx.serialize()).toString('base64'),
            activityData: isLast ? {
              wallet: publicKey.toBase58(),
              accountsCount: accountsToBurn.length,
              recoveredSol: accountsToBurn.length * 0.00203928
            } : null // Only log activity for the last chunk to avoid spam
          }),
        });
        const broadcastData = await broadcastRes.json();
        if (!broadcastRes.ok) throw new Error(broadcastData.error);
        lastSignature = broadcastData.signature;
      }

      setStatus({ type: 'success', message: `Successfully burned tokens and recovered ${(accountsToBurn.length * 0.00203928).toFixed(4)} SOL`, signature: lastSignature });
      
      // Remove burned accounts from list
      setAccounts(accounts.filter(a => !selectedAccounts.has(a.pubkey)));
      setSelectedAccounts(new Set());
    } catch (err: unknown) {
      setStatus({ type: 'error', message: (err as Error).message || 'Failed to burn accounts' });
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(a => {
    if (filterValue === 'all') return true;
    if (filterValue === 'unknown') {
      return a.valueUsd === undefined || a.valueUsd === 0;
    }
    const maxVal = parseInt(filterValue);
    return a.valueUsd === undefined || a.valueUsd < maxVal;
  }).sort((a, b) => {
    // Sort by valueUsd descending (highest first)
    const valA = a.valueUsd || 0;
    const valB = b.valueUsd || 0;
    return valB - valA;
  });

  const estimatedRecovery = selectedAccounts.size * 0.00203928;

  return (
    <div className="space-y-6">
      
      <div className="flex justify-center max-w-2xl mx-auto w-full">
        <button
          onClick={(e) => {
            if (!publicKey) {
              setVisible(true);
            } else {
              scanAccounts(e);
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
              Scan Accounts
            </>
          )}
        </button>
      </div>

      {publicKey && (
        <>
          {/* Safe Burn Toggle Banner */}
          <div className="bg-zinc-900 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <div>
            <h3 className="text-white font-medium text-sm flex items-center gap-2">Safe Burn <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Recommended</span></h3>
            <p className="text-zinc-400 text-xs mt-0.5">Closes unwanted accounts for SOL. One signature, maximum value!</p>
          </div>
        </div>
        <div className="w-10 h-5 bg-green-500 rounded-full flex items-center justify-end p-0.5 cursor-pointer">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-[#09090b]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Your Token Accounts</h2>
          <div className="flex gap-3">
            <button
              onClick={scanAccounts}
              disabled={scanning}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {scanning ? 'Scanning...' : 'Scan Accounts'}
            </button>
            <button
              onClick={() => {
                if (selectedAccounts.size > 0) setShowConfirmModal(true);
              }}
              disabled={selectedAccounts.size === 0 || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              Safe Burn Selected ({selectedAccounts.size})
            </button>
          </div>
        </div>

        <div className="p-4">
          {!publicKey ? (
            <div className="text-center py-12 text-zinc-500">
              Please connect your wallet to view tokens.
            </div>
          ) : !scanned ? (
            <div className="text-center py-12 text-zinc-500">
              Click Scan Accounts to find unwanted tokens.
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No unwanted token accounts found.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-sm px-2">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white shrink-0">
                  <input 
                    type="checkbox" 
                    checked={filteredAccounts.length > 0 && filteredAccounts.every(a => selectedAccounts.has(a.pubkey))}
                    onChange={selectAll}
                    className="rounded border-zinc-600 bg-zinc-800 accent-green-500 w-4 h-4"
                  />
                  Select All
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'unknown', label: 'Unknown' },
                    { id: '1', label: 'Under $1' },
                    { id: '5', label: 'Under $5' },
                    { id: '10', label: 'Under $10' },
                    { id: 'all', label: 'All Tokens' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        if (f.id === 'all' && filterValue !== 'all') {
                          setPendingFilter('all');
                        } else {
                          setFilterValue(f.id as 'unknown' | '1' | '5' | '10' | 'all');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterValue === f.id 
                          ? 'bg-[#e2fbff] text-black' 
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-2 text-zinc-500 text-xs text-right">
                {filteredAccounts.length} accounts shown
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredAccounts.map((account) => {
                  const isSelected = selectedAccounts.has(account.pubkey);
                  const isUnknown = !account.info || account.info.name === 'Unknown Token';
                  
                  return (
                  <div 
                    key={account.pubkey} 
                    className={`flex items-start p-4 rounded-xl border transition-colors cursor-pointer ${
                      isSelected 
                        ? 'border-[#e2fbff]/50 bg-[#e2fbff]/5' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                    }`}
                    onClick={() => toggleSelection(account.pubkey)}
                  >
                    {/* Checkbox & Image */}
                    <div className="flex items-center gap-4 mr-4 mt-1">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div
                        className="rounded border-zinc-600 bg-zinc-800 accent-[#e2fbff] w-5 h-5 cursor-pointer"
                      />
                      <div className="relative">
                        {account.info?.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={account.info.imageUrl} alt={account.info.symbol} className="w-12 h-12 rounded-full object-cover border border-zinc-700 bg-zinc-800" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                             <span className="text-zinc-500 text-xs font-medium">?</span>
                          </div>
                        )}
                        {isUnknown && (
                          <div className="absolute -bottom-1 -right-1 bg-zinc-800 rounded-full p-0.5 shadow-sm">
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-zinc-100 truncate text-base">
                          {account.info?.name || 'Unknown Token'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-medium flex items-center gap-1 border border-zinc-700 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Token
                        </span>
                      </div>
                      
                      <div className="text-xs text-zinc-500 font-mono mb-2 flex items-center gap-1">
                        CA: {account.mint.slice(0, 4)}...{account.mint.slice(-4)}
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-[15px] text-[#e2fbff] font-medium">
                          {account.uiAmount?.toLocaleString(undefined, { maximumFractionDigits: 6 })} tokens
                        </span>
                        {account.valueUsd !== undefined && (
                          <span className="text-sm text-zinc-400 font-medium">
                            ({formatSmallNumber(account.valueUsd)})
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-zinc-400 mt-3 pt-3 border-t border-zinc-800/50 inline-block w-full">
                        Rent: <span className="text-zinc-300 font-medium">0.002 SOL</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* High-Value Warning Modal */}
      {pendingFilter === 'all' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-md overflow-hidden text-white shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
                <AlertCircle className="w-6 h-6" />
                CRITICAL: High-Value Access
              </h2>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
                <p className="font-bold text-red-400">Viewing tokens worth MORE than $50.</p>
                <p className="text-sm text-red-400/80">EXTREMELY DANGEROUS. You could burn tokens worth hundreds or thousands of dollars.</p>
              </div>

              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <p><strong className="text-white">PERMANENT & IRREVERSIBLE</strong> - No recovery</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <p><strong className="text-white">You are 100% responsible</strong></p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <p><strong className="text-white">FreeSolTools NOT responsible</strong> for losses</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <p><strong className="text-white">ONLY burn worthless tokens</strong></p>
                </li>
              </ul>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-500/90">
                  <strong className="text-yellow-500">Recommended:</strong> Use &quot;Under $1&quot; or &quot;Under $5&quot; filters. Most scam/dust tokens are worth less than $1.
                </p>
              </div>

              <div className="pt-4 space-y-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 text-center">Confirm you understand all risks.</p>
                <button
                  onClick={() => {
                    setFilterValue('all');
                    setPendingFilter(null);
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                  I Understand - Sign Warning
                </button>
                <button
                  onClick={() => setPendingFilter(null)}
                  className="w-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancel (Recommended)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Confirm Safe Burn
              </h2>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-400 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p><strong>Smart Safe Burn:</strong> Swappable tokens → SOL via Jupiter. Others → closed for rent recovery. One signature!</p>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  Expected Recovery
                </div>
                <div className="text-green-400 font-bold text-lg">
                  +{estimatedRecovery.toFixed(4)} SOL
                </div>
              </div>

              <div className="bg-[#e2fbff]/10 border border-[#e2fbff]/20 rounded-lg p-3 text-sm text-[#e2fbff] flex items-start gap-2">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p><strong>Safe Burn Mode:</strong> We will recover the rent exemption from {selectedAccounts.size} accounts. There are 0% platform fees on this transaction.</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={executeBurn}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {loading ? 'Processing...' : `Confirm Safe Burn (${selectedAccounts.size} tokens)`}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 rounded-xl py-3.5 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>)}

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
        </div>
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#09090b]/50">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            <div className="col-span-1">Wallet/TX</div>
            <div className="text-center">Tokens</div>
            <div className="text-right">Recovered</div>
            <div className="text-right">Time</div>
          </div>
          
          <div className="divide-y divide-zinc-800">
            {activities.length > 0 ? activities.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-zinc-800/30 transition-colors text-sm font-mono">
                <div className="col-span-1 flex flex-col gap-1">
                  <div className="text-zinc-200">{row.wallet.slice(0, 4)}...{row.wallet.slice(-4)}</div>
                  <a 
                    href={`https://solscan.io/tx/${row.signature}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#e2fbff] hover:text-[#c2f6ff] transition-colors flex items-center gap-1.5 text-xs"
                  >
                    {row.signature.slice(0, 4)}...{row.signature.slice(-4)}
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
