import { NextResponse } from 'next/server';
import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountIdempotentInstruction,
  getMint
} from '@solana/spl-token';
import { heliusConnection } from '@/lib/helius';

interface TransferInput {
  address: string;
  amount: number; // Amount in UI tokens
}

export async function POST(request: Request) {
  try {
    const { walletAddress, tokenMint, transfers } = await request.json();

    if (!walletAddress || !tokenMint || !transfers || !Array.isArray(transfers) || transfers.length === 0) {
      return NextResponse.json({ error: 'walletAddress, tokenMint, and transfers array are required' }, { status: 400 });
    }

    const sender = new PublicKey(walletAddress);
    const mint = new PublicKey(tokenMint);
    
    // Fetch token decimals
    const mintInfo = await getMint(heliusConnection, mint);
    const decimals = mintInfo.decimals;

    // Get sender's ATA
    const senderATA = await getAssociatedTokenAddress(mint, sender);

    const { blockhash, lastValidBlockHeight } = await heliusConnection.getLatestBlockhash('confirmed');
    
    // Batch transfers into multiple transactions if needed (max ~10-15 per tx for tokens due to ATA creation)
    const MAX_TRANSFERS_PER_TX = 10;
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
          
          // Calculate raw token amount
          const rawAmount = BigInt(Math.floor(transfer.amount * Math.pow(10, decimals)));
          
          // Get recipient's ATA
          const recipientATA = await getAssociatedTokenAddress(mint, recipient);
          
          // Add instruction to create ATA if it doesn't exist (Idempotent)
          transaction.add(
            createAssociatedTokenAccountIdempotentInstruction(
              sender, // payer
              recipientATA, // ata
              recipient, // owner
              mint // mint
            )
          );

          // Add transfer instruction
          transaction.add(
            createTransferInstruction(
              senderATA, // source
              recipientATA, // destination
              sender, // owner
              rawAmount // amount
            )
          );
        } catch {
          return NextResponse.json({ error: `Invalid address or amount: ${transfer.address}` }, { status: 400 });
        }
      }

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      serializedTransactions.push(serializedTx.toString('base64'));
    }

    return NextResponse.json({ 
      transactions: serializedTransactions,
      decimals
    });
  } catch (error: unknown) {
    console.error('Error building Token multisender transaction:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to build transaction' }, { status: 500 });
  }
}
