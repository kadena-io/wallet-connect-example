An example app written in [Next.js](https://nextjs.org/) to show how to work
with Kadena and Wallet Connect V2.

## Current issues

At the moment some wallets overwrite the nonce that's sent in the
SigningRequest. Ideally you would like to just get the signature from the
wallet, and send the transaction that you created in the dApp, but that's not
possible when the nonce gets overwritten before the signing happens. To
circumvent this, we currently send the complete (and signed) transaction that is
returned from the wallet.

## Getting Started

Install dependencies:

```bash
npm i
# or
yarn
# or
pnpm i
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.
