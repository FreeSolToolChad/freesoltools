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

    // Fetch all token accounts for the wallet
    const response = await heliusConnection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Filter accounts with exactly 0 balance
    const emptyAccounts = response.value
      .filter((accountInfo) => accountInfo.account.data.parsed.info.tokenAmount.uiAmount === 0)
      .map((accountInfo) => ({
        pubkey: accountInfo.pubkey.toBase58(),
        mint: accountInfo.account.data.parsed.info.mint,
      }));

    return NextResponse.json({ emptyAccounts });
  } catch (error: unknown) {
    console.error('Error scanning for empty token accounts:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to scan accounts' }, { status: 500 });
  }
}
