import React from 'react';

const pillars = [
  {
    title: 'Stellar accounts, not opaque custody',
    detail:
      'Each user maps to a real Stellar account with issued-asset balances. Prism can sponsor reserves and fees so users never manage XLM manually.',
  },
  {
    title: 'Native Circle USDC settlement',
    detail:
      'Bridged deposits settle as Circle USDC on Stellar — the same settlement asset Etherfuse and Stellar DeFi expect.',
  },
  {
    title: 'Etherfuse stablebonds on Stellar',
    detail:
      'USTRY and future markets are Stellar issued assets with trustlines. V1 avoids custom Soroban bond contracts.',
  },
  {
    title: 'Path payments for allocation',
    detail:
      'USDC → USTRY allocation uses Stellar path payments and/or Etherfuse ramp orders, surfaced as a simple Earn market.',
  },
];

const operations = [
  { op: 'createAccount', role: 'Sponsor creates user account when needed' },
  { op: 'changeTrust', role: 'Opt in to USDC and USTRY issued assets' },
  { op: 'pathPaymentStrictSend', role: 'Swap settlement USDC into USTRY on Stellar' },
  { op: 'feeBump', role: 'Prism sponsor pays fees so users stay XLM-free' },
];

export function StellarProductOverview() {
  return (
    <section className="panel" id="stellar-product">
      <div className="section-header">
        <div>
          <p className="eyebrow">Stellar-native product</p>
          <h2>Built on Stellar mechanics, not just Stellar branding</h2>
          <p className="muted">
            Prism Earn is designed around Stellar account reserves, trustlines, issued assets, path payments, and
            sponsorship. The public repo demonstrates each layer with live Horizon reads and real transaction building.
          </p>
        </div>
        <a
          className="button-secondary"
          href="https://github.com/HeylmStoned/prism-stellar-earn/blob/main/docs/architecture.md"
          rel="noreferrer"
          target="_blank"
        >
          Architecture doc
        </a>
      </div>

      <div className="grid-2">
        {pillars.map((pillar) => (
          <article className="mini-card" key={pillar.title}>
            <h3>{pillar.title}</h3>
            <p className="muted">{pillar.detail}</p>
          </article>
        ))}
      </div>

      <div className="quote-card">
        <p className="eyebrow">Stellar operation map</p>
        <div className="pipeline-list">
          {operations.map((row) => (
            <article className="pipeline-row" key={row.op}>
              <div>
                <h3>{row.op}</h3>
                <p className="muted">{row.role}</p>
              </div>
              <span className="pipeline-status pipeline-status-wip">V1</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
