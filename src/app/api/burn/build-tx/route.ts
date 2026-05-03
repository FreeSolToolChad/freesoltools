import { NextResponse } from 'next/server';
import { PublicKey, VersionedTransaction, TransactionMessage, TransactionInstruction, AddressLookupTableAccount } from '@solana/web3.js';
import { createCloseAccountInstruction, createBurnInstruction, createHarvestWithheldTokensToMintInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { heliusConnection } from '@/lib/helius';

const JUPITER_API = 'https://quote-api.jup.ag/v6';

export async function POST(request: Request) {
  try {
    const { walletAddress, accountsToBurn } = await request.json();

    if (!walletAddress || !accountsToBurn || !Array.isArray(accountsToBurn) || accountsToBurn.length === 0) {
      return NextResponse.json({ error: 'walletAddress and accountsToBurn array are required' }, { status: 400 });
    }

    const owner = new PublicKey(walletAddress);
    
    const { blockhash } = await heliusConnection.getLatestBlockhash('confirmed');
    
    const transactionsToSign: string[] = []; // Array of base64 encoded transactions

    // Group accounts into: empty (just close), and with balance (swap then close)
    const emptyAccounts: { pubkey: string; mint: string; amount?: string; }[] = [];
    const accountsWithBalance: { pubkey: string; mint: string; amount?: string; }[] = [];

    for (const acc of accountsToBurn) {
      if (!acc.amount || acc.amount === '0' || acc.mint === 'So11111111111111111111111111111111111111112') {
        // Empty accounts AND WSOL accounts go here.
        // Closing a WSOL account natively unwraps it, returning balance + rent to the user safely.
        emptyAccounts.push(acc);
      } else {
        accountsWithBalance.push(acc);
      }
    }

    // 1. Process accounts with balance (Jupiter Swaps)
    // To avoid transaction size limits, we'll create one transaction per swap
    for (const acc of accountsWithBalance) {
      const inputMint = acc.mint;
      const outputMint = 'So11111111111111111111111111111111111111112'; // Native SOL
      const amount = acc.amount; // string in raw lamports/decimals

      // Get Quote
      const quoteResponse = await fetch(
        `${JUPITER_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=500` // 5% slippage for dust
      ).catch(e => {
        console.error("Jupiter fetch failed for quote", e);
        return null;
      });
      
      if (!quoteResponse || !quoteResponse.ok) {
        console.warn(`Could not get quote for ${inputMint}, might be untradable. Skipping swap and burning instead.`);
        
        // Fallback: Burn the token directly and close the account
        let programId = TOKEN_PROGRAM_ID;
        try {
           const accInfo = await heliusConnection.getAccountInfo(new PublicKey(acc.pubkey));
           if (accInfo && accInfo.owner.toBase58() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
              programId = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
           }
        } catch {}
        
        const fallbackInstructions: TransactionInstruction[] = [
          createBurnInstruction(
            new PublicKey(acc.pubkey),
            new PublicKey(acc.mint),
            owner,
            BigInt(acc.amount || '0'),
            [],
            programId
          )
        ];

        if (programId.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))) {
          fallbackInstructions.push(
            createHarvestWithheldTokensToMintInstruction(
              new PublicKey(acc.mint),
              [new PublicKey(acc.pubkey)],
              programId
            )
          );
        }

        fallbackInstructions.push(
          createCloseAccountInstruction(
            new PublicKey(acc.pubkey),
            owner,
            owner,
            [],
            programId
          )
        );
        
        const messageV0 = new TransactionMessage({
          payerKey: owner,
          recentBlockhash: blockhash,
          instructions: fallbackInstructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        transactionsToSign.push(Buffer.from(transaction.serialize()).toString('base64'));
        continue;
      }

      const quoteData = await quoteResponse.json();

      // Get Swap Instructions
      const instructionsResponse = await fetch(`${JUPITER_API}/swap-instructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: owner.toBase58(),
          dynamicComputeUnitLimit: true,
        })
      }).catch(e => {
        console.error("Jupiter fetch failed for instructions", e);
        return null;
      });

      if (!instructionsResponse || !instructionsResponse.ok) {
        console.warn(`Could not get swap instructions for ${inputMint}`);
        
        // Fallback: Burn the token directly and close the account
        let programId = TOKEN_PROGRAM_ID;
        try {
           const accInfo = await heliusConnection.getAccountInfo(new PublicKey(acc.pubkey));
           if (accInfo && accInfo.owner.toBase58() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
              programId = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
           }
        } catch {}
        
        const fallbackInstructions: TransactionInstruction[] = [
          createBurnInstruction(
            new PublicKey(acc.pubkey),
            new PublicKey(acc.mint),
            owner,
            BigInt(acc.amount || '0'),
            [],
            programId
          )
        ];

        if (programId.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))) {
          fallbackInstructions.push(
            createHarvestWithheldTokensToMintInstruction(
              new PublicKey(acc.mint),
              [new PublicKey(acc.pubkey)],
              programId
            )
          );
        }

        fallbackInstructions.push(
          createCloseAccountInstruction(
            new PublicKey(acc.pubkey),
            owner,
            owner,
            [],
            programId
          )
        );
        
        const messageV0 = new TransactionMessage({
          payerKey: owner,
          recentBlockhash: blockhash,
          instructions: fallbackInstructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        transactionsToSign.push(Buffer.from(transaction.serialize()).toString('base64'));
        continue;
      }

      const instructionsData = await instructionsResponse.json();

      if (instructionsData.error) {
        console.warn(`Jupiter error: ${instructionsData.error}`);
        
        // Fallback: Burn the token directly and close the account
        let programId = TOKEN_PROGRAM_ID;
        try {
           const accInfo = await heliusConnection.getAccountInfo(new PublicKey(acc.pubkey));
           if (accInfo && accInfo.owner.toBase58() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
              programId = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
           }
        } catch {}
        
        const fallbackInstructions: TransactionInstruction[] = [
          createBurnInstruction(
            new PublicKey(acc.pubkey),
            new PublicKey(acc.mint),
            owner,
            BigInt(acc.amount || '0'),
            [],
            programId
          )
        ];

        if (programId.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))) {
          fallbackInstructions.push(
            createHarvestWithheldTokensToMintInstruction(
              new PublicKey(acc.mint),
              [new PublicKey(acc.pubkey)],
              programId
            )
          );
        }

        fallbackInstructions.push(
          createCloseAccountInstruction(
            new PublicKey(acc.pubkey),
            owner,
            owner,
            [],
            programId
          )
        );
        
        const messageV0 = new TransactionMessage({
          payerKey: owner,
          recentBlockhash: blockhash,
          instructions: fallbackInstructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        transactionsToSign.push(Buffer.from(transaction.serialize()).toString('base64'));
        continue;
      }

      const {
        computeBudgetInstructions,
        setupInstructions,
        swapInstruction: swapInstructionPayload,
        cleanupInstruction,
        addressLookupTableAddresses
      } = instructionsData;

      // Helper to deserialize instruction
      const deserializeInstruction = (instruction: { programId: string, accounts: { pubkey: string, isSigner: boolean, isWritable: boolean }[], data: string } | null) => {
        if (!instruction) return null;
        return new TransactionInstruction({
          programId: new PublicKey(instruction.programId),
          keys: instruction.accounts.map((key) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
          })),
          data: Buffer.from(instruction.data, 'base64'),
        });
      };

      const instructions: TransactionInstruction[] = [];
      
      computeBudgetInstructions.forEach((ix: { programId: string, accounts: { pubkey: string, isSigner: boolean, isWritable: boolean }[], data: string }) => instructions.push(deserializeInstruction(ix)!));
      setupInstructions.forEach((ix: { programId: string, accounts: { pubkey: string, isSigner: boolean, isWritable: boolean }[], data: string }) => instructions.push(deserializeInstruction(ix)!));
      if (swapInstructionPayload) instructions.push(deserializeInstruction(swapInstructionPayload)!);
      if (cleanupInstruction) instructions.push(deserializeInstruction(cleanupInstruction)!);

      // After Jupiter swap, we MUST close the account to get the rent back.
      // Since we used ExactIn with the full balance, the token balance will be exactly 0.
      // We just need to harvest fees for Token-2022 before closing.
      let programId = TOKEN_PROGRAM_ID;
      try {
         const accInfo = await heliusConnection.getAccountInfo(new PublicKey(acc.pubkey));
         if (accInfo && accInfo.owner.toBase58() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
            programId = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
         }
      } catch {}

      if (programId.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))) {
        instructions.push(
          createHarvestWithheldTokensToMintInstruction(
            new PublicKey(acc.mint),
            [new PublicKey(acc.pubkey)],
            programId
          )
        );
      }

      instructions.push(
        createCloseAccountInstruction(
          new PublicKey(acc.pubkey),
          owner,
          owner,
          [],
          programId
        )
      );

      // Fetch Address Lookup Tables
      const getAddressLookupTableAccounts = async (keys: string[]) => {
        const addressLookupTableAccountInfos = await heliusConnection.getMultipleAccountsInfo(
          keys.map((key) => new PublicKey(key))
        );
        return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
          if (accountInfo) {
            acc.push(
              new AddressLookupTableAccount({
                key: new PublicKey(keys[index]),
                state: AddressLookupTableAccount.deserialize(accountInfo.data),
              })
            );
          }
          return acc;
        }, [] as AddressLookupTableAccount[]);
      };

      const addressLookupTableAccounts = await getAddressLookupTableAccounts(addressLookupTableAddresses || []);

      // Build Versioned Transaction
      const messageV0 = new TransactionMessage({
        payerKey: owner,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message(addressLookupTableAccounts);

      const transaction = new VersionedTransaction(messageV0);
      
      transactionsToSign.push(Buffer.from(transaction.serialize()).toString('base64'));
    }

    // 2. Process empty accounts (Legacy logic, combine into one TX if possible)
    if (emptyAccounts.length > 0) {
      // Chunk empty accounts into groups of 20 to avoid size limits
      const chunkSize = 20;
      for (let i = 0; i < emptyAccounts.length; i += chunkSize) {
        const chunk = emptyAccounts.slice(i, i + chunkSize);
        
        const instructions: TransactionInstruction[] = [];

        for (const acc of chunk) {
          const accountPubkey = new PublicKey(acc.pubkey);
          
          // Fetch account info to determine if it's standard or 2022
          let programId = TOKEN_PROGRAM_ID;
          try {
             const accInfo = await heliusConnection.getAccountInfo(accountPubkey);
             if (accInfo && accInfo.owner.toBase58() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
                programId = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
             }
          } catch(e) {
             console.warn("Could not fetch account info for", acc.pubkey, e);
          }

          if (programId.equals(new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'))) {
            instructions.push(
              createHarvestWithheldTokensToMintInstruction(
                new PublicKey(acc.mint),
                [accountPubkey],
                programId
              )
            );
          }

          instructions.push(
            createCloseAccountInstruction(
              accountPubkey,
              owner,
              owner,
              [],
              programId
            )
          );
        }

        const messageV0 = new TransactionMessage({
          payerKey: owner,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        transactionsToSign.push(Buffer.from(transaction.serialize()).toString('base64'));
      }
    }

    return NextResponse.json({ transactions: transactionsToSign });
  } catch (error: unknown) {
    console.error('Error building burn transaction:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to build transaction' }, { status: 500 });
  }
}
