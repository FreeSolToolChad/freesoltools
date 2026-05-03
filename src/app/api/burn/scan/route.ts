import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { heliusConnection } from '@/lib/helius';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    const owner = new PublicKey(walletAddress);

    // Fetch all token accounts for the wallet from standard SPL token program
    const response = await heliusConnection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Also fetch Token-2022 accounts
    const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
    const response2022 = await heliusConnection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const allAccounts = [...response.value, ...response2022.value];

    const accounts = allAccounts
      .map((accountInfo) => ({
        pubkey: accountInfo.pubkey.toBase58(),
        mint: accountInfo.account.data.parsed.info.mint,
        amount: accountInfo.account.data.parsed.info.tokenAmount.amount,
        uiAmount: accountInfo.account.data.parsed.info.tokenAmount.uiAmount || 0,
        decimals: accountInfo.account.data.parsed.info.tokenAmount.decimals,
        state: accountInfo.account.data.parsed.info.state,
        closeAuthority: accountInfo.account.data.parsed.info.closeAuthority,
      }))
      .filter((acc) => {
        if (acc.state === 'frozen') return false;
        if (acc.closeAuthority && acc.closeAuthority !== owner.toBase58()) return false;
        return true;
      });

    // Fetch Token Metadata via Helius and Price from Jupiter
    const uniqueMints = Array.from(new Set(accounts.map((a) => a.mint)));
    const tokenInfoMap: Record<string, { name: string; symbol: string; priceUsd?: number; imageUrl: string | null }> = {};

    // 1. Fetch Metadata from Helius getAssetBatch
    // Helius allows max 1000 addresses per request
    const heliusChunkSize = 1000;
    for (let i = 0; i < uniqueMints.length; i += heliusChunkSize) {
      const chunk = uniqueMints.slice(i, i + heliusChunkSize);
      try {
        const rpcEndpoint = heliusConnection.rpcEndpoint;
        const heliusRes = await fetch(rpcEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAssetBatch',
            params: {
              ids: chunk
            }
          }),
        });

        if (heliusRes.ok) {
          const heliusData = await heliusRes.json();
          if (heliusData.result && Array.isArray(heliusData.result)) {
            heliusData.result.forEach((asset: { id: string, content?: { metadata?: { name?: string, symbol?: string }, links?: { image?: string }, files?: { uri?: string }[] } }) => {
              if (asset && asset.id) {
                tokenInfoMap[asset.id] = {
                  name: asset.content?.metadata?.name || 'Unknown Token',
                  symbol: asset.content?.metadata?.symbol || 'UNKNOWN',
                  priceUsd: 0, // Will be updated by Jupiter
                  imageUrl: asset.content?.links?.image || asset.content?.files?.[0]?.uri || null,
                };
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching Helius metadata for chunk', err);
      }
    }

    // 2. Fetch Prices from Jupiter v3
    // Jupiter allows max 50 addresses per request
    const jupChunkSize = 50;
    for (let i = 0; i < uniqueMints.length; i += jupChunkSize) {
      const chunk = uniqueMints.slice(i, i + jupChunkSize);
      try {
        const jupRes = await fetch(`https://lite-api.jup.ag/price/v3?ids=${chunk.join(',')}`);
        if (jupRes.ok) {
          const jupData = await jupRes.json();
          if (jupData) {
            Object.entries(jupData as Record<string, { id?: string, usdPrice?: number }>).forEach(([mint, priceInfo]) => {
              if (tokenInfoMap[mint]) {
                tokenInfoMap[mint].priceUsd = priceInfo?.usdPrice;
              } else {
                tokenInfoMap[mint] = {
                  name: 'Unknown Token',
                  symbol: 'UNKNOWN',
                  priceUsd: priceInfo?.usdPrice,
                  imageUrl: null,
                };
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching Jupiter prices for chunk', err);
      }
    }

    // Attach info to accounts
    const enrichedAccounts = accounts.map(acc => {
      const info = tokenInfoMap[acc.mint] || {
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        priceUsd: undefined,
        imageUrl: null
      };
      
      const valueUsd = info.priceUsd !== undefined ? acc.uiAmount * info.priceUsd : undefined;
      
      return {
        ...acc,
        info,
        valueUsd
      };
    });

    return NextResponse.json({ accounts: enrichedAccounts });
  } catch (error: unknown) {
    console.error('Error scanning for token accounts:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to scan accounts' }, { status: 500 });
  }
}
