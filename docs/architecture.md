# Prism Stellar Earn — Technical Architecture

Public summary aligned with **Prism Technical Infrastructure Description v1.5 (June 2026)** for the Stellar Community Fund Build / Integration Track.

Product preview (Prism shell): [stellar.prismfi.cc/earn](https://stellar.prismfi.cc/earn) — UI preview + live Stellar testnet sandbox only; not the full deposit/allocation product yet.

## Introduction

Prism is a multichain consumer DeFi hub. This integration adds **Stellar as the settlement and issuance rail** for Prism's RWA yield module.

Assets are Stellar-native: Etherfuse sovereign stablebonds issued on Stellar, held on Stellar accounts, settled on Stellar.

**Design principle:** efficiency — minimum new surface area, maximum reuse of Prism's production infrastructure and battle-tested Stellar ecosystem components. Where a custom build and an ecosystem building block both solve a problem, the building block wins.

## What is already built (POC)

The POC at `stellar.prismfi.cc/earn` was built before requesting funding. It includes:

- **Product preview:** deposit entry, three-step flow (deposit USDC → route to Stellar → allocate to stablebonds), market selection (USTRY first, multi-currency expansion), position display in Prism UI. Product design is in place; live flows are what the Build award funds.
- **Functional Stellar wallet layer (testnet):** Stellar Wallets Kit connection, testnet account creation, on-ledger balance reads, ownership-proof signing.

This public repository contains a **standalone extract** of that Stellar integration surface plus engineering modules for bridge routing, path discovery, and NEAR Chain Signatures validation.

## 5.1 Account model and EVM user onboarding

Two user paths:

| Path | Users | Mechanism |
| --- | --- | --- |
| Stellar-native | Stellar wallet users | Stellar Wallets Kit (Creit Tech) — xBull and Freighter priority; Lobstr, Albedo, WalletConnect via the same module |
| EVM-native | Majority of Prism base | NEAR Chain Signatures derive a non-custodial Stellar account controlled by the user's EVM key — no new wallet or seed phrase |

Prism covers base reserve and asset trustlines through **sponsored reserves** (`BeginSponsoringFutureReserves` / `EndSponsoringFutureReserves`, `ChangeTrust`) and submits operations through **fee-bump transactions**, so users do not need to hold or spend XLM.

**Forward path:** Protocol 27 ("Zipper") introduces first-class authentication delegation for smart accounts. The account layer is designed so smart-account delegation can be adopted as a V1.x enhancement without changing deposit or yield flows.

## 5.2 Bridge layer — cross-chain USDC routing

Deposits route into Stellar through two complementary rails, selected by the backend per source chain and asset:

| Rail | Use when | Notes |
| --- | --- | --- |
| **Circle CCTP V2** | Native USDC from CCTP domains (e.g. Arbitrum) | Canonical 1:1 burn-and-mint; live on Stellar mainnet since May 2026; no wrapped assets or solver liquidity caps |
| **NEAR Intents** | Chains outside CCTP (e.g. MegaETH), non-USDC sources | User signs one EVM transaction; solver settles USDC on the user's Stellar account; solver caps may require splitting large transfers |

Withdrawal back to EVM uses the same routing in reverse. Transfers are tracked to finality; unconfirmed transfers surface a retry path in the UI.

Route selection is **backend logic**, not new bridge infrastructure.

## 5.3 RWA yield layer — tokenized stablebonds

Yield positions are denominated in **Etherfuse stablebonds** on Stellar:

- **V1 first market:** USTRY (US Treasury)
- **Expansion:** CETES, TESOURO, EUROB (multi-currency sovereign exposure)

**V1 uses no custom Soroban contracts.** Stablebonds are Stellar issued assets; subscription and redemption run through Etherfuse's flows, orchestrated by the backend.

Position accounting extends Prism's existing **position engine** with a Stellar adapter: relevant ledger events are read through **Stellar RPC** and indexed internally (RPC retains ~7 days of history; durable history lives in Prism's database per SDF ingest-and-index guidance).

The public POC uses **Horizon** for testnet reads and path discovery; production targets **Stellar RPC** as the primary entry point per current SDF guidance.

## Technology stack (summary)

| Layer | Components |
| --- | --- |
| Backend | Prism production backend (orchestration, deposit lifecycle, cross-chain tracking) extended with a Stellar service; Stellar RPC; Stellar SDK for `ChangeTrust`, sponsorship, payments, fee-bumps; internal indexer into existing database |
| Frontend | Prism React app; earn module; Stellar Wallets Kit |
| Tooling | Scaffold Stellar for any future contract work; Stellar Lab for exploration |
| Operations | Existing Prism cloud infrastructure; Tranche 3 adds Stellar monitoring (settlement latency, failure rate, trustline/sponsorship errors) |

## Architecture constraints

- **Non-custodial:** Prism never takes custody. Invisible Stellar accounts are derived via NEAR Chain Signatures; Prism sponsors reserves and fees but cannot move funds.
- **KYC/AML** stays with the regulated issuer under its license; Prism does not operate a KYC pipeline for this module.
- **Regulated distribution:** Prism is an interface to Etherfuse flows; Prism does not hold a securities distribution license.
- **Jurisdictional gating** per issuer distribution coverage.
- **Inbound flow screening** on each settlement path; flagged flows rejected before allocation.

## Design-to-deliverables mapping

| Tranche deliverable | Design section |
| --- | --- |
| T1 — Production-grade EVM-to-Stellar deposit flow | 5.2 Bridge layer |
| T1 — Stellar wallet connectivity (xBull, Freighter) | 5.1 Account model |
| T1 — RWA yield position engine | 5.3 Yield layer |
| T2 — End-to-end deposit and earn on testnet | 5.1 + 5.2 + 5.3 |
| T2 — Redemption and withdrawal flows | 5.2 + 5.3 |
| T2 — Position history indexer and portfolio integration | 5.3 + backend stack |
| T3 — Mainnet launch of Stellar earn module | All of section 5 |
| T3 — Production withdrawal route and monitoring | 5.2 + infrastructure |
| T3 — Documentation, rollout, professional user testing | Infrastructure |

## What this public repository contains

| In this repo | Not in this repo (private Prism) |
| --- | --- |
| Runnable demo app (`apps/demo-earn`) | Full Prism frontend shell |
| `@prism/stellar-wallet` — Wallets Kit, Horizon testnet, trustlines, paths | Production backend orchestrator |
| `@prism/stellar-earn-core` — markets, routes, readiness models | Position engine and production database |
| `@prism/near-chainsig-spike` — Ed25519 XDR signing scaffold | API keys, sponsor keys, monitoring |
| Testnet wallet POC | CCTP / NEAR Intents live execution |
| Mainnet path discovery (read-only) | Etherfuse production order flows |
