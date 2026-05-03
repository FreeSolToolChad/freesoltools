"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, Send, AlertCircle, ChevronDown, Check, Search } from 'lucide-react';
import { Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  balance?: number;
}

export default function MultisenderUI() {
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'sol' | 'token'>('token');
  
  // Token selection state
  const [tokenMint, setTokenMint] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [walletTokens, setWalletTokens] = useState<TokenInfo[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Other state
  const [recipientsInput, setRecipientsInput] = useState('');
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch wallet tokens when connected
  useEffect(() => {
    const fetchWalletTokens = async () => {
      if (!publicKey) {
        setWalletTokens([]);
        return;
      }

      setIsLoadingTokens(true);
      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID
        });

        const tokensInWallet = accounts.value
          .filter(acc => acc.account.data.parsed.info.tokenAmount.uiAmount > 0)
          .map(acc => {
            const mint = acc.account.data.parsed.info.mint;
            const amount = acc.account.data.parsed.info.tokenAmount.uiAmount;
            const decimals = acc.account.data.parsed.info.tokenAmount.decimals;
            
            return {
              address: mint,
              name: `Token ${mint.slice(0, 4)}...${mint.slice(-4)}`,
              symbol: mint.slice(0, 6),
              decimals: decimals,
              balance: amount
            };
          });
        
        setWalletTokens(tokensInWallet);
        
        // Auto-select first token if we have tokens and haven't selected one
        if (tokensInWallet.length > 0) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          if (!selectedToken) {
            handleSelectToken(tokensInWallet[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch wallet tokens:", error);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchWalletTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, connection]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTokenDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectToken = (token: TokenInfo) => {
    setSelectedToken(token);
    setTokenMint(token.address);
    setIsTokenDropdownOpen(false);
    setTokenSearchQuery('');
  };

  // Handle manual mint input
  const handleManualMintInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTokenSearchQuery(val);
    setTokenMint(val);
    
    // Try to find the token in our lists
    const foundToken = walletTokens.find(t => t.address === val);
    if (foundToken) {
      setSelectedToken(foundToken);
    } else if (val.length > 30) {
      setSelectedToken({
          address: val,
          name: 'Unknown Token',
          symbol: val.slice(0, 4) + '...',
          decimals: 0
      });
    } else {
        setSelectedToken(null);
    }
  };

  // Filter tokens based on search and connection status
  const displayedTokens = useMemo(() => {
    // Determine the source array
    const sourceList = walletTokens;
    
    if (!tokenSearchQuery.trim()) {
      return sourceList.slice(0, 50);
    }

    const query = tokenSearchQuery.toLowerCase();
    
    // Check if it's a direct exact mint match for a token we don't have in our lists
    if (query.length > 30 && !sourceList.some(t => t.address.toLowerCase() === query)) {
        return [{
          address: tokenSearchQuery,
          name: 'Unknown Token (Custom Mint)',
          symbol: tokenSearchQuery.slice(0, 4) + '...',
          decimals: 0
        }];
    }

    return sourceList.filter(t => 
      t.symbol.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    ).slice(0, 50); // Limit to 50 results
  }, [walletTokens, tokenSearchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRecipientsInput(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    if (!signAllTransactions) {
      setStatus({ type: 'error', message: 'Wallet does not support signAllTransactions' });
      return;
    }

    if (type === 'token' && !tokenMint.trim()) {
      setStatus({ type: 'error', message: 'Token Mint Address is required' });
      return;
    }

    if (!recipientsInput.trim()) {
      setStatus({ type: 'error', message: 'Please enter recipients' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Parse recipients
      const lines = recipientsInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const transfers = lines.map((line, index) => {
        // Supports comma or space separation
        const parts = line.split(/[,\s]+/).filter(Boolean);
        if (parts.length !== 2) throw new Error(`Invalid format on line ${index + 1}: ${line}`);
        const [address, amountStr] = parts;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) throw new Error(`Invalid amount on line ${index + 1}: ${amountStr}`);
        return { address, amount };
      });

      if (transfers.length === 0) throw new Error('No valid transfers found');

      // 1. Build TXs
      const endpoint = type === 'sol' ? '/api/multisender/sol/build-tx' : '/api/multisender/token/build-tx';
      const body = type === 'sol' 
        ? { walletAddress: publicKey.toBase58(), transfers }
        : { walletAddress: publicKey.toBase58(), tokenMint: tokenMint.trim(), transfers };

      const buildRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok) throw new Error(buildData.error);

      // 2. Sign TXs
      const transactions = buildData.transactions.map((txStr: string) => {
        const txBuffer = Buffer.from(txStr, 'base64');
        return Transaction.from(txBuffer);
      });

      const signedTxs = await signAllTransactions(transactions);

      // 3. Broadcast TXs sequentially
      const signatures = [];
      for (const signedTx of signedTxs) {
        const broadcastRes = await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signedTransaction: signedTx.serialize().toString('base64'),
          }),
        });
        const broadcastData = await broadcastRes.json();
        if (!broadcastRes.ok) throw new Error(broadcastData.error);
        signatures.push(broadcastData.signature);
      }

      setStatus({ 
        type: 'success', 
        message: `Successfully sent to ${transfers.length} addresses! Signatures: ${signatures.join(', ')}` 
      });
      setRecipientsInput('');
    } catch (err: unknown) {
      setStatus({ type: 'error', message: (err as Error).message || 'Failed to process multisender' });
    } finally {
      setLoading(false);
    }
  };

  // Create numbered lines for the textarea overlay effect
  const lines = recipientsInput.split('\n');
  const lineCount = Math.max(lines.length, 3); // minimum 3 lines

  const validAddressesCount = lines.filter(l => l.trim().includes(',')).length;
  const estimatedCompetitorFee = validAddressesCount * 0.002;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Multisender</h1>
        <p className="text-zinc-400">Send SOL or Tokens to multiple addresses efficiently with 0% fee.</p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 pt-4 pb-2 text-zinc-400">
          <div className="flex items-center gap-2 group relative cursor-help">
            <svg className="w-5 h-5 text-[#e2fbff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-medium border-b border-dashed border-zinc-600 pb-0.5">0% Platform Fee</span>
            
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-300 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-left pointer-events-none">
              <div className="font-bold text-white mb-1.5 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2fbff]"></span>
                Why 0%?
              </div>
              <p className="leading-relaxed">
                We believe managing your wallet should be free. To keep our high-performance RPCs running, we will rely on future non-intrusive ads instead of charging you a platform fee.
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[6px] border-transparent border-t-zinc-700"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-sm font-medium">Secure Batching</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 mb-6 max-w-sm mx-auto">
        <button
          onClick={() => setType('token')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            type === 'token' ? 'bg-[#e2fbff] text-black' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Send Token
        </button>
        <button
          onClick={() => setType('sol')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            type === 'sol' ? 'bg-[#e2fbff] text-black' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Send SOL
        </button>
      </div>

      <div className="bg-[#0f0f11] p-6 rounded-2xl text-zinc-100 shadow-inner border border-zinc-800">
        {type === 'token' && (
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1 relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Select Token to Send</label>
              
              {/* Selected Token Display / Dropdown Toggle */}
              <button
                type="button"
                onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                className="w-full px-4 py-3 bg-[#18181b] border border-zinc-800 rounded-lg hover:border-[#e2fbff]/50 focus:outline-none focus:border-[#e2fbff] transition-all flex items-center justify-between shadow-sm"
              >
                {selectedToken ? (
                  <div className="flex items-center gap-3">
                    {selectedToken.logoURI ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-6 h-6 rounded-full bg-zinc-800" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">{selectedToken.symbol.charAt(0)}</div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm text-zinc-100">{selectedToken.symbol}</span>
                      {selectedToken.balance !== undefined && (
                        <span className="text-xs text-zinc-500">Balance: {selectedToken.balance}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-zinc-500 text-sm">Select a token or paste mint address</span>
                )}
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isTokenDropdownOpen ? 'rotate-180' : ''} ml-2`} />
              </button>

              {/* Dropdown Menu */}
              {isTokenDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-[#18181b] border border-zinc-800 rounded-lg shadow-xl max-h-[300px] flex flex-col overflow-hidden">
                  
                  {/* Search / Manual Input */}
                  <div className="p-3 border-b border-zinc-800/50 bg-[#18181b] sticky top-0 z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search by name or paste mint address"
                        value={tokenSearchQuery}
                        onChange={(e) => {
                          setTokenSearchQuery(e.target.value);
                          // Also try to set it as a manual mint if it looks like an address
                          if (e.target.value.length >= 30) {
                            handleManualMintInput(e);
                          }
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-[#121214] border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-[#e2fbff] placeholder:text-zinc-600"
                        onClick={(e) => e.stopPropagation()} // Prevent closing dropdown
                      />
                    </div>
                  </div>

                  {/* Token List */}
                  <div className="overflow-y-auto flex-1 relative z-0">
                    {publicKey && isLoadingTokens ? (
                      <div className="p-8 flex flex-col items-center justify-center text-zinc-500 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading your tokens...</span>
                      </div>
                    ) : displayedTokens.length === 0 ? (
                      <div className="p-4 text-center text-sm text-zinc-500">
                        No tokens found
                      </div>
                    ) : (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-[#121214]">
                          {publicKey ? 'Your Wallet Tokens' : 'Connect wallet to view your tokens'}
                        </div>
                        {displayedTokens.map((token) => (
                          <button
                            key={token.address}
                            type="button"
                            onClick={() => handleSelectToken(token)}
                            className={`w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors ${selectedToken?.address === token.address ? 'bg-[#e2fbff]/10' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              {token.logoURI ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full bg-zinc-800" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">{token.symbol.charAt(0)}</div>
                              )}
                              <div className="flex flex-col items-start text-left">
                                <span className="font-medium text-sm text-zinc-100">{token.symbol}</span>
                                <span className="text-xs text-zinc-500 truncate max-w-[120px]" title={token.name}>{token.name}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {token.balance !== undefined && (
                                <span className="text-sm font-mono text-zinc-300">{token.balance}</span>
                              )}
                              {selectedToken?.address === token.address && (
                                <Check className="w-4 h-4 text-[#e2fbff]" />
                              )}
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-zinc-300">Addresses with Amounts</label>
            <div>
              <input
                type="file"
                accept=".txt,.csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-[#3b82f6] hover:text-[#2563eb] underline flex items-center gap-1 font-medium"
              >
                Upload file
              </button>
            </div>
          </div>
          
          <div className="relative bg-[#18181b] border border-zinc-800 rounded-lg shadow-sm overflow-hidden flex">
            {/* Line numbers column */}
            <div className="w-12 bg-[#121214] border-r border-zinc-800 py-3 text-right pr-3 text-zinc-500 text-sm font-mono select-none overflow-hidden h-[200px]">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-[1.5]">{i + 1}</div>
              ))}
            </div>
            
            {/* Actual textarea */}
            <textarea
              value={recipientsInput}
              onChange={(e) => setRecipientsInput(e.target.value)}
              placeholder={type === 'sol' ? "Address, Amount (SOL)" : "Address, Amount (Tokens)"}
              className="flex-1 h-[200px] p-3 focus:outline-none transition-all font-mono text-sm resize-none leading-[1.5] whitespace-pre bg-transparent"
              spellCheck="false"
            />
          </div>
          
          <div className="flex justify-between text-xs text-zinc-500 mt-2">
            <span>Separated by commas</span>
            <button 
              className="text-[#3b82f6] hover:text-[#60a5fa] underline"
              onClick={() => setRecipientsInput(`HNhKPG1edbhJomsCDTCLD2PxBX6H1GBVUc11PkbWB3dA,0.0001\nHpPRCUzqMJrC3PswLnShybNE3YgqLZKFtZtwYq8rwYfL,0.0002\nFWCoxjasYQjgHEN4EBB1sbJvoNC6KGmUKARhyyCQfB1j,0.0005`)}
            >
              Show examples
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        {validAddressesCount > 0 && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-sm space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between items-center text-zinc-400">
              <span>Recipients</span>
              <span className="font-mono text-zinc-300">{validAddressesCount}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>Average Competitor Fee</span>
              <span className="font-mono text-red-400 line-through">~{estimatedCompetitorFee.toFixed(3)} SOL</span>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span className="text-[#e2fbff]">SolFree Fee (0%)</span>
              <span className="font-mono text-green-400">0.000 SOL</span>
            </div>
          </div>
        )}
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-[#e2fbff] hover:bg-[#c2f6ff] text-black rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {loading ? 'Processing...' : (!publicKey ? 'Connect Wallet to Send' : `Send ${type === 'sol' ? 'SOL' : 'Tokens'}`)}
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-500' :
          status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' :
          'bg-blue-500/10 border border-blue-500/20 text-blue-500'
        }`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm break-all max-h-32 overflow-y-auto">{status.message}</div>
        </div>
      )}
    </div>
  );
}
