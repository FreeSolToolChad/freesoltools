import { NextResponse } from 'next/server';
import { PublicKey, Transaction } from '@solana/web3.js';
import { createCloseAccountInstruction } from '@solana/spl-token';
import { heliusConnection } from '@/lib/helius';

export async function POST(request: Request) {
  try {
    const { walletAddress, accountsToClose } = await request.json();

    if (!walletAddress || !accountsToClose || !Array.isArray(accountsToClose) || accountsToClose.length === 0) {
      return NextResponse.json({ error: 'walletAddress and accountsToClose array are required' }, { status: 400 });
    }

    const owner = new PublicKey(walletAddress);
    
    // Get latest blockhash for the transaction
    const { blockhash, lastValidBlockHeight } = await heliusConnection.getLatestBlockhash('confirmed');
    
    const transaction = new Transaction({
      feePayer: owner,
      blockhash,
      lastValidBlockHeight,
    });

    // Add close account instructions for each selected empty account
    // 0% platform fee, rent goes directly to the owner
    for (const accountPubkeyStr of accountsToClose) {
      const accountPubkey = new PublicKey(accountPubkeyStr);
      transaction.add(
        createCloseAccountInstruction(
          accountPubkey, // token account which we want to close
          owner, // destination for the rent lamports
          owner, // owner of the token account
          []
        )
      );
    }

    // Serialize the transaction to send to frontend
    // Require user to sign only
    const serializedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({ 
      transaction: serializedTx.toString('base64')
    });
  } catch (error: unknown) {
    console.error('Error building close accounts transaction:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to build transaction' }, { status: 500 });
  }
}
