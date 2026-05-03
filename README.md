# FreeSolTools — 0% Solana Token Account Closer

FreeSolTools is an open-source Solana utility built to help users close empty token accounts and reclaim locked SOL rent with **0% service fees**.

The goal of this project is simple:

> Become the first fully open-source, 0% Solana token account closing service, with the front end hosted at [FreeSolTools.com](https://freesoltools.com).

## What It Does

On Solana, token accounts can hold small amounts of rent-exempt SOL, even after the token balance is empty.

FreeSolTools scans your wallet for empty token accounts and lets you safely close them, sending the reclaimed SOL back to your wallet.

## Key Features

- **0% service fee**
- **Open-source codebase**
- **Client-side wallet signing**
- **No private keys ever requested**
- **No account creation required**
- **No hidden fees**
- **Simple front end hosted on FreeSolTools.com**
- **Built for transparency and trust**

## Why This Exists

Many Solana users have empty token accounts sitting in their wallets without realizing those accounts still contain reclaimable SOL rent.

Some existing tools charge users a percentage of the SOL they recover.

FreeSolTools is built as a transparent alternative:

- Users keep 100% of the SOL they reclaim
- The source code is public
- The tool is simple, focused, and easy to verify

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
