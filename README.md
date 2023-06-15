An example app written in [Next.js](https://nextjs.org/) to show how to work
with Kadena and Wallet Connect V2.

## Current issues

At the moment some wallets overwrite the nonce that's sent in the
SigningRequest. For `sign` we allow this, as the wallet should be able to alter
for example the gasPrice and gasLimit. For `quickSign` we explicitly check if
the hash of the unsigned transaction matches the one from the signed
transaction. By doing this you're 100% sure that the transaction that was sent
from the dApp is the transaction that is signed by the wallet

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
