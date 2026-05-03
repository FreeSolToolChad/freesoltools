import { NextResponse } from 'next/server';
import { VersionedTransaction } from '@solana/web3.js';
import { heliusConnection } from '@/lib/helius';
import { addActivity } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { signedTransaction, activityData } = await request.json();

    if (!signedTransaction) {
      return NextResponse.json({ error: 'signedTransaction is required' }, { status: 400 });
    }

    // Deserialize the signed transaction
    const txBuffer = Buffer.from(signedTransaction, 'base64');
    const tx = VersionedTransaction.deserialize(txBuffer);

    // Broadcast the transaction via Helius RPC
    const signature = await heliusConnection.sendTransaction(tx, {
      skipPreflight: false,
      maxRetries: 3,
    });

    if (activityData && activityData.wallet) {
      addActivity({
        wallet: activityData.wallet,
        signature: signature,
        accountsCount: activityData.accountsCount,
        recoveredSol: activityData.recoveredSol,
        timestamp: Date.now()
      });
    }

    return NextResponse.json({ signature });
  } catch (error: unknown) {
    console.error('Error broadcasting transaction:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to broadcast transaction' }, { status: 500 });
  }
}
