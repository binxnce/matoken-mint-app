# MATOKEN Digital Press 📀 Pressing music albums to the blockchain

> Press/Mint music albums on Polygon with this development testbed for minting tokens in the MATOKEN packaged album format

> Modified from Polygon NFTminter by Aman Raj https://github.com/hack3r-0m/NFTminter

### Instructions for running locally

In the `/contracts` package:

- start a local blockchain by running `npm run chain`
- deploy `NFTMinter` contract via `npx hardhat --network localhost ./scripts/deploy.js`

In the `/react-app` package:

- make sure to have a `.env.local` file with the following content:

```bash
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_API_KEY=

NEXT_PUBLIC_INFURA_PROJECT_ID=

NEXT_PUBLIC_NFT_MINTER_ADDRESS=
```

- run via `npm run dev`
