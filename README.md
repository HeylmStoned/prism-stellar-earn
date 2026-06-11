# Prism Stellar Earn

Public work-in-progress repository for Prism's Stellar Earn integration.

This repo intentionally contains only the Stellar-specific integration surface. It does not include the private Prism production frontend, backend orchestrator, portfolio engine, infrastructure, or unrelated chain integrations.

## Live POC

Product preview (embedded in Prism): [stellar.prismfi.cc/earn](https://stellar.prismfi.cc/earn)

Engineering demo (this repo, richer tooling): clone and run `npm run dev` on port 4200.

**What is actually live today**

| Area | Status |
| --- | --- |
| Earn UI / flow design | Preview only — shows what the product will look like |
| Etherfuse market cards (USTRY, etc.) | Preview only — buttons are disabled |
| EVM deposit / bridge | Not wired — “coming soon” |
| Stellar wallet sandbox (testnet) | **Works** — connect, Friendbot fund, balances, payments, tx history |
| USDC trustlines, path discovery, route simulator | Works in this repo’s standalone demo; not all on stellar.prismfi.cc yet |

The POC is **not** the full target experience yet. It is a credible product preview plus a **real Stellar testnet integration** proving wallet, Horizon, and on-chain signing. Deposit → bridge → USTRY allocation is what the Build award funds next.

## Repository Layout

```txt
apps/demo-earn/              Standalone public demo app
packages/stellar-wallet/     Stellar wallet, Horizon, Friendbot, and testnet payment helpers
packages/stellar-earn-core/  Bond metadata, account model, route types
packages/near-chainsig-spike/NEAR Chain Signatures validation scaffold
docs/                        Architecture summary (aligned to SCF submission)
```

## What This Repo Proves

1. Native Stellar wallet connect can be embedded into Prism through Stellar Wallets Kit.
2. A Stellar account can be created, read, funded, and used on testnet from the UI.
3. The Earn product can expose Etherfuse stablebond markets without requiring users to understand Stellar internals.
4. The main production path is designed to be EVM-first, with NEAR Chain Signatures enabling Stellar execution without requiring a separate Stellar wallet.

## What Remains Private

- Prism's production application shell.
- Cross-chain backend orchestration internals.
- Position engine and database implementation.
- Monitoring, API keys, infrastructure, and production configuration.
- Non-Stellar products such as swaps, GMX, prediction markets, and MegaETH-specific code.

## Development

```bash
npm install
npm run dev
```

The app runs on the default Next.js development port unless overridden by Next.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the public technical summary aligned to the SCF Build submission (account model, bridge layer, yield layer, deliverables mapping).

The demo embeds a live implementation pipeline at `#implementation-progress`.

## Public sharing

This repository is intended for public review (e.g. Stellar Community Fund). It contains:

- No API keys, sponsor keys, or production credentials (use `.env.example` only as a template).
- No private Prism backend, database, or orchestrator code.
- Only public Stellar endpoints (Horizon testnet/mainnet, Friendbot) and public asset issuer addresses.

Do not commit `.env` files. Production keys and sponsor wallets stay in the private Prism infrastructure.
