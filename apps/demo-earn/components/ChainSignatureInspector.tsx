"use client";

import React, { useMemo, useState } from 'react';
import { deriveStableStellarPath, getStellarSignaturePayload } from '@prism/near-chainsig-spike';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function ChainSignatureInspector() {
  const [evmAddress, setEvmAddress] = useState('0x1111111111111111111111111111111111111111');
  const [stellarPublicKey, setStellarPublicKey] = useState('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
  const [nearAccountId, setNearAccountId] = useState('prism-earn.testnet');
  const [unsignedXdr, setUnsignedXdr] = useState('');

  const derivationPath = useMemo(
    () => deriveStableStellarPath(evmAddress as `0x${string}`),
    [evmAddress],
  );

  const signaturePayloadHex = useMemo(() => {
    if (!unsignedXdr.trim()) return '';
    try {
      return bytesToHex(getStellarSignaturePayload(unsignedXdr.trim()));
    } catch {
      return '';
    }
  }, [unsignedXdr]);

  const plan = useMemo(() => {
    if (!unsignedXdr.trim() || !signaturePayloadHex) return null;

    return {
      nearAccountId,
      derivationPath,
      stellarPublicKey: stellarPublicKey.trim(),
      signaturePayload: getStellarSignaturePayload(unsignedXdr.trim()),
    };
  }, [derivationPath, nearAccountId, signaturePayloadHex, stellarPublicKey, unsignedXdr]);

  return (
    <section className="panel" id="chain-signatures">
      <div className="section-header">
        <div>
          <p className="eyebrow">Account model WIP</p>
          <h2>NEAR Chain Signatures inspector</h2>
          <p className="muted">
            Engineering surface for the EVM-first path: derive a stable Stellar Ed25519 account path, hash unsigned XDR,
            and prepare the MPC signature payload NEAR Chain Signatures will sign.
          </p>
        </div>
      </div>

      <div className="simulator-grid">
        <label className="simulator-field">
          <span>EVM address</span>
          <input onChange={(event) => setEvmAddress(event.target.value)} value={evmAddress} />
        </label>
        <label className="simulator-field">
          <span>NEAR account id</span>
          <input onChange={(event) => setNearAccountId(event.target.value)} value={nearAccountId} />
        </label>
        <label className="simulator-field">
          <span>Derived Stellar path</span>
          <input readOnly value={derivationPath} />
        </label>
        <label className="simulator-field">
          <span>Stellar public key</span>
          <input onChange={(event) => setStellarPublicKey(event.target.value)} value={stellarPublicKey} />
        </label>
      </div>

      <label className="simulator-field xdr-field">
        <span>Unsigned Stellar transaction XDR</span>
        <textarea
          onChange={(event) => setUnsignedXdr(event.target.value)}
          placeholder="Paste an unsigned testnet transaction XDR from the trustline or payment workbench below."
          rows={4}
          value={unsignedXdr}
        />
      </label>

      {plan ? (
        <div className="quote-card">
          <div className="grid-2">
            <div className="mini-card">
              <p className="eyebrow">Signature payload</p>
              <p className="mono">{bytesToHex(plan.signaturePayload)}</p>
            </div>
            <div className="mini-card">
              <p className="eyebrow">MPC request shape</p>
              <p className="muted">
                nearAccountId: {plan.nearAccountId}
                <br />
                derivationPath: {plan.derivationPath}
                <br />
                stellarPublicKey: {plan.stellarPublicKey}
              </p>
            </div>
          </div>
          <p className="muted quote-note">
            Next step: call the NEAR MPC contract with this payload, receive Ed25519 signature bytes, attach to XDR, and
            submit to Horizon without a native Stellar wallet.
          </p>
        </div>
      ) : (
        <p className="muted">Paste a valid unsigned testnet XDR to inspect the Chain Signatures signing payload.</p>
      )}
    </section>
  );
}
