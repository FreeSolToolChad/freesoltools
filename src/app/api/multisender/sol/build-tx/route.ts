import { NextResponse } from 'next/server';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { heliusConnection } from '@/lib/helius';

interface TransferInput {
  address: string;
  amount: number; // Amount in SOL
}

export async function POST(request: Request) {
  try {
    const { walletAddress, transfers } = await request.json();

    if (!walletAddress || !transfers || !Array.isArray(transfers) || transfers.length === 0) {
      return NextResponse.json({ error: 'walletAddress and transfers array are required' }, { status: 400 });
    }

    const sender = new PublicKey(walletAddress);
    
    const { blockhash, lastValidBlockHeight } = await heliusConnection.getLatestBlockhash('confirmed');
    
    // Batch transfers into multiple transactions if needed (max ~20 per tx to stay under 1232 bytes)
    const MAX_TRANSFERS_PER_TX = 20;
    const serializedTransactions: string[] = [];

    for (let i = 0; i < transfers.length; i += MAX_TRANSFERS_PER_TX) {
      const batch = transfers.slice(i, i + MAX_TRANSFERS_PER_TX);
      
      const transaction = new Transaction({
        feePayer: sender,
        blockhash,
        lastValidBlockHeight,
      });

      for (const transfer of batch as TransferInput[]) {
        try {
          const recipient = new PublicKey(transfer.address);
          // Convert SOL to lamports
          const lamports = Math.floor(transfer.amount * 1_000_000_000);
          
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: sender,
              toPubkey: recipient,
              lamports,
            })
          );
        } catch {
          return NextResponse.json({ error: `Invalid address: ${transfer.address}` }, { status: 400 });
        }
      }

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      serializedTransactions.push(serializedTx.toString('base64'));
    }

    return NextResponse.json({ 
      transactions: serializedTransactions
    });
  } catch (error: unknown) {
    console.error('Error building SOL multisender transaction:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to build transaction' }, { status: 500 });
  }
}
