"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { stellarUsdcAssets, ustryMainnetAsset } from '@prism/stellar-earn-core';
import {
  fetchStrictSendPaths,
  formatStellarAddress,
  getErrorMessage,
  type StellarPathRecord,
} from '@prism/stellar-wallet';

const MAINNET_HORIZON = 'https://horizon.stellar.org';

function formatPath(path: StellarPathRecord['path']): string {
  if (!path.length) return 'Direct';
  return path
    .map((hop) => {
      if (hop.asset_type === 'native') return 'XLM';
      return hop.asset_code || hop.asset_type;
    })
    .join(' → ');
}

export function StellarPathExplorer() {
  const [sendAmount, setSendAmount] = useState('100');
  const [paths, setPaths] = useState<StellarPathRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usdc = stellarUsdcAssets.mainnet;
  const ustry = ustryMainnetAsset;

  const loadPaths = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const records = await fetchStrictSendPaths({
        horizonUrl: MAINNET_HORIZON,
        sourceAmount: sendAmount.trim(),
        sourceAssetCode: usdc.code,
        sourceAssetIssuer: usdc.issuer,
        destinationAssetCode: ustry.code,
        destinationAssetIssuer: ustry.issuer,
      });
      setPaths(records.slice(0, 5));
    } catch (pathError) {
      setPaths([]);
      setError(getErrorMessage(pathError, 'Failed to query Stellar path payments'));
    } finally {
      setLoading(false);
    }
  }, [sendAmount, usdc.code, usdc.issuer, ustry.code, ustry.issuer]);

  useEffect(() => {
    void loadPaths();
  }, [loadPaths]);

  return (
    <section className="panel" id="stellar-paths">
      <div className="section-header">
        <div>
          <p className="eyebrow">Yield layer WIP</p>
          <h2>Live Stellar path discovery — USDC → USTRY</h2>
          <p className="muted">
            Read-only mainnet Horizon query for the allocation step: how Stellar USDC moves into Etherfuse USTRY through
            the Stellar DEX path payment graph.
          </p>
        </div>
        <button className="button-secondary" disabled={loading} onClick={() => loadPaths()} type="button">
          {loading ? 'Querying Horizon...' : 'Refresh paths'}
        </button>
      </div>

      <div className="simulator-grid">
        <label className="simulator-field">
          <span>Send max (USDC)</span>
          <input inputMode="decimal" onChange={(event) => setSendAmount(event.target.value)} value={sendAmount} />
        </label>
        <div className="mini-card">
          <p className="eyebrow">Settlement asset</p>
          <p className="mono muted">{usdc.code}:{formatStellarAddress(usdc.issuer)}</p>
        </div>
        <div className="mini-card">
          <p className="eyebrow">Target stablebond</p>
          <p className="mono muted">{ustry.code}:{formatStellarAddress(ustry.issuer)}</p>
        </div>
      </div>

      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

      {paths.length ? (
        <div className="pipeline-list">
          {paths.map((path, index) => (
            <article className="pipeline-row" key={`${path.destination_amount}-${index}`}>
              <div>
                <h3>{Number(path.source_amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} USDC → {Number(path.destination_amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} USTRY</h3>
                <p className="muted">Route: {formatPath(path.path)}</p>
              </div>
              <span className="pipeline-status pipeline-status-done">Horizon</span>
            </article>
          ))}
        </div>
      ) : (
        !loading && !error && <p className="muted">No paths returned for this amount. Try a different USDC input.</p>
      )}

      <p className="muted quote-note">
        Production allocation combines this Stellar path payment model with Etherfuse ramp orders where needed. The demo
        proves we are building against real Stellar liquidity paths, not mock yield numbers.
      </p>
    </section>
  );
}
