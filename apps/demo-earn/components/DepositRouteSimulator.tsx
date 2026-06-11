"use client";

import React, { useMemo, useState } from 'react';
import { quoteDepositRoute, type SourceChain } from '@prism/stellar-earn-core';

const chains: SourceChain[] = ['arbitrum', 'megaeth', 'ethereum', 'base', 'other'];
const assets = ['USDC', 'ETH', 'USDT'];

export function DepositRouteSimulator() {
  const [sourceChain, setSourceChain] = useState<SourceChain>('arbitrum');
  const [sourceAsset, setSourceAsset] = useState('USDC');
  const [amount, setAmount] = useState('1000');
  const [targetStablebond, setTargetStablebond] = useState('USTRY');
  const [evmAddress, setEvmAddress] = useState('0x1111111111111111111111111111111111111111');

  const quote = useMemo(
    () =>
      quoteDepositRoute({
        userEvmAddress: evmAddress as `0x${string}`,
        sourceChain,
        sourceAsset,
        amount,
        targetStablebond,
      }),
    [amount, evmAddress, sourceAsset, sourceChain, targetStablebond],
  );

  return (
    <section className="panel" id="deposit-simulator">
      <div className="section-header">
        <div>
          <p className="eyebrow">Bridge layer WIP</p>
          <h2>Deposit route simulator</h2>
          <p className="muted">
            Typed route selection for CCTP V2 and NEAR Intents. Production orchestration stays private; this module proves
            the routing model and quote surface.
          </p>
        </div>
      </div>

      <div className="simulator-grid">
        <label className="simulator-field">
          <span>EVM address</span>
          <input onChange={(event) => setEvmAddress(event.target.value)} value={evmAddress} />
        </label>
        <label className="simulator-field">
          <span>Source chain</span>
          <select onChange={(event) => setSourceChain(event.target.value as SourceChain)} value={sourceChain}>
            {chains.map((chain) => (
              <option key={chain} value={chain}>{chain}</option>
            ))}
          </select>
        </label>
        <label className="simulator-field">
          <span>Source asset</span>
          <select onChange={(event) => setSourceAsset(event.target.value)} value={sourceAsset}>
            {assets.map((asset) => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
        </label>
        <label className="simulator-field">
          <span>Amount</span>
          <input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} value={amount} />
        </label>
        <label className="simulator-field">
          <span>Target stablebond</span>
          <input onChange={(event) => setTargetStablebond(event.target.value)} value={targetStablebond} />
        </label>
      </div>

      <div className="quote-card">
        <div className="grid-3">
          <div className="mini-card">
            <p className="eyebrow">Selected rail</p>
            <h3>{quote.rail === 'cctp-v2' ? 'Circle CCTP V2' : 'NEAR Intents'}</h3>
            <p className="muted">{quote.notes[0]}</p>
          </div>
          <div className="mini-card">
            <p className="eyebrow">Settlement</p>
            <h3>{quote.settlementAsset}</h3>
            <p className="muted">{quote.sourceChain} {quote.sourceAsset} → {quote.targetStablebond}</p>
          </div>
          <div className="mini-card">
            <p className="eyebrow">ETA</p>
            <h3>{quote.estimatedSettlementSeconds}s</h3>
            <p className="muted">Demo estimate for grant review UI.</p>
          </div>
        </div>
        <p className="muted quote-note">
          Next step: wire this quote into private backend orchestration and live CCTP / NEAR Intents providers.
        </p>
      </div>
    </section>
  );
}
