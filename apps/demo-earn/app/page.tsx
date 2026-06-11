import React from 'react';
import { stablebondMarkets } from '@prism/stellar-earn-core';

import { ChainSignatureInspector } from '../components/ChainSignatureInspector';
import { DepositRouteSimulator } from '../components/DepositRouteSimulator';
import { ImplementationPipeline } from '../components/ImplementationPipeline';
import { StellarPathExplorer } from '../components/StellarPathExplorer';
import { StellarProductOverview } from '../components/StellarProductOverview';
import { StellarWalletSandbox } from '../components/StellarWalletSandbox';

const flowSteps = [
  {
    title: 'Deposit USDC',
    description: 'Start from the user\'s regular Prism EVM wallet. Native Stellar wallet connect remains available for Stellar-native users.',
  },
  {
    title: 'Bridge to Stellar',
    description: 'Route EVM USDC into Stellar settlement through CCTP V2 where possible, or NEAR Intents for broader chain and asset coverage.',
  },
  {
    title: 'Allocate to stablebonds',
    description: 'Swap Stellar USDC into Etherfuse stablebonds and show the resulting position inside Prism Earn.',
  },
];

export default function EarnPage() {
  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Prism Earn · preview POC</p>
        <h1>Stablebond yield from one Prism deposit</h1>
        <p className="lead">
          This page previews the target Earn experience. The deposit, bridge, and allocation flows are not live yet —
          scroll to the Stellar sandbox below for the working testnet integration (wallet, balances, payments).
        </p>
        <div className="actions">
          <a className="button" href="#implementation-progress">
            View implementation progress
          </a>
          <a className="button-secondary" href="#bond-selection">
            Explore markets
          </a>
          <a className="button-secondary" href="#stellar-wallet">
            Stellar sandbox
          </a>
        </div>
      </section>

      <StellarProductOverview />

      <ImplementationPipeline />

      <section className="grid-3">
        {flowSteps.map((step, index) => (
          <article className="card" key={step.title}>
            <p className="eyebrow">Step {index + 1}</p>
            <h2>{step.title}</h2>
            <p className="muted">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="panel" id="bond-selection">
        <div className="section-header">
          <div>
            <p className="eyebrow">Etherfuse bond selection</p>
            <h2>Choose your stablebond market</h2>
            <p className="muted">
              Prism Earn surfaces Etherfuse stablebonds as simple yield markets, starting with USTRY and expanding into
              multi-currency sovereign exposure.
            </p>
          </div>
          <a className="button-secondary" href="https://app.etherfuse.com/dashboard" rel="noreferrer" target="_blank">
            Etherfuse dashboard
          </a>
        </div>

        <div className="grid-2">
          {stablebondMarkets.map((bond) => (
            <article className="card" key={bond.symbol}>
              <div className="section-header">
                <div>
                  <p className="eyebrow">{bond.region}</p>
                  <h2>{bond.symbol}</h2>
                  <p className="muted">{bond.name}</p>
                </div>
                <span className="status">{bond.status === 'first-market' ? 'First market' : 'Coming soon'}</span>
              </div>
              <p className="muted">{bond.description}</p>
              <button className="disabled-button" disabled type="button">
                Coming soon
              </button>
            </article>
          ))}
        </div>
      </section>

      <DepositRouteSimulator />

      <StellarPathExplorer />

      <section className="panel" id="evm-first">
        <div className="section-header">
          <div>
            <p className="eyebrow">EVM-first access</p>
            <h2>Use Prism without installing a Stellar wallet</h2>
            <p className="muted">
              The target flow uses the user's existing Prism EVM wallet while NEAR Chain Signatures enables non-custodial
              Stellar execution behind the scenes. Users should not need Freighter or xBull for the mainstream Earn path.
            </p>
          </div>
        </div>
      </section>

      <ChainSignatureInspector />

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Strategy layer</p>
            <h2>DeFindex strategies</h2>
            <p className="muted">
              DeFindex aggregation can sit on top of the stablebond route once the core Stellar settlement and Etherfuse
              allocation flow is live.
            </p>
          </div>
          <a className="button-secondary" href="https://www.defindex.io/strategies" rel="noreferrer" target="_blank">
            View strategies
          </a>
        </div>
      </section>

      <section id="stellar-wallet">
        <p className="eyebrow">Native Stellar sandbox</p>
        <h2>Optional wallet demo</h2>
        <p className="muted">
          This testnet module is for Stellar-native users and engineering validation. The main Prism Earn path remains
          EVM-first.
        </p>
        <StellarWalletSandbox />
      </section>
    </div>
  );
}
