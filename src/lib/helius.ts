import { Connection } from '@solana/web3.js';

// The Helius API key is configured from the environment or uses the fallback provided in the PRD.
// Using this directly in the backend code prevents exposure on the frontend.
const HELIUS_API_KEY = process.env.HELIUS_API_KEY
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Create a singleton connection instance for the backend
export const heliusConnection = new Connection(HELIUS_RPC_URL, 'confirmed');
