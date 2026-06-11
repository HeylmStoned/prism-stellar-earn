"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  earnOnboardingAssets,
  evaluateEarnReadiness,
  formatStellarAssetId,
  stellarUsdcAssets,
  ustryMainnetAsset,
  type EarnReadinessStep,
} from '@prism/stellar-earn-core';
import {
  accountHasTrustline,
  buildChangeTrustXdr,
  buildFeeBumpXdr,
  buildNativePaymentXdr,
  DEFAULT_BASE_RESERVE_STROOPS,
  fetchBaseReserveStroops,
  fetchRecentTransactions,
  fetchStellarAccount,
  formatStellarAddress,
  formatTransactionDate,
  fundTestnetAccount,
  getAccountReserveSnapshot,
  getBalanceLabel,
  getErrorMessage,
  loadWalletKit,
  refreshSupportedWallets,
  submitSignedTransactionXdr,
  stellarTestnetConfig,
  type StellarAccount,
  type StellarTransaction,
  type StellarWalletInfo,
} from '@prism/stellar-wallet';

function readAssetBalance(account: StellarAccount, code: string, issuer: string): number {
  const row = account.balances.find((balance) => balance.asset_code === code && balance.asset_issuer === issuer);
  return row ? Number(row.balance) : 0;
}

const readinessStatusClass: Record<EarnReadinessStep['status'], string> = {
  complete: 'pipeline-status-done',
  'action-needed': 'pipeline-status-wip',
  blocked: 'pipeline-status-planned',
  info: 'pipeline-status-planned',
};

type WalletStatus = 'idle' | 'loading' | 'ready' | 'error';
type AccountStatus = 'idle' | 'loading' | 'funded' | 'unfunded' | 'error';

export function StellarWalletSandbox() {
  const [status, setStatus] = useState<WalletStatus>('idle');
  const [address, setAddress] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<StellarWalletInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('idle');
  const [account, setAccount] = useState<StellarAccount | null>(null);
  const [transactions, setTransactions] = useState<StellarTransaction[]>([]);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [sendDestination, setSendDestination] = useState('');
  const [sendAmount, setSendAmount] = useState('1');
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [lastTrustlineXdr, setLastTrustlineXdr] = useState<string | null>(null);
  const [lastFeeBumpXdr, setLastFeeBumpXdr] = useState<string | null>(null);
  const [feeBumpAccount, setFeeBumpAccount] = useState('');
  const [baseReserveStroops, setBaseReserveStroops] = useState(DEFAULT_BASE_RESERVE_STROOPS);

  const onboardingAssets = earnOnboardingAssets('testnet');
  const testnetUsdc = stellarUsdcAssets.testnet;

  const sortedWallets = useMemo(
    () => [...wallets].sort((first, second) => Number(second.isAvailable) - Number(first.isAvailable)),
    [wallets],
  );

  const nativeBalance = account?.balances.find((balance) => balance.asset_type === 'native')?.balance;

  const reserveSnapshot = useMemo(() => {
    if (!account) return null;
    return getAccountReserveSnapshot(account, baseReserveStroops);
  }, [account, baseReserveStroops]);

  const earnReadiness = useMemo(() => {
    const usdcTrustline = account ? accountHasTrustline(account, testnetUsdc.code, testnetUsdc.issuer) : false;
    const ustryTrustline = account
      ? accountHasTrustline(account, ustryMainnetAsset.code, ustryMainnetAsset.issuer)
      : false;

    return evaluateEarnReadiness({
      accountExists: accountStatus === 'funded',
      usdcTrustlineActive: usdcTrustline,
      ustryTrustlineActive: ustryTrustline,
      usdcBalance: account ? readAssetBalance(account, testnetUsdc.code, testnetUsdc.issuer) : 0,
      ustryBalance: account ? readAssetBalance(account, ustryMainnetAsset.code, ustryMainnetAsset.issuer) : 0,
      minimumBalanceXlm: reserveSnapshot?.minimumBalanceXlm ?? 1,
      availableXlm: reserveSnapshot?.availableXlm ?? 0,
    });
  }, [account, accountStatus, reserveSnapshot, testnetUsdc.code, testnetUsdc.issuer]);

  const loadAccount = useCallback(async (stellarAddress: string) => {
    setAccountStatus('loading');
    setError(null);

    try {
      const [nextAccount, nextBaseReserve] = await Promise.all([
        fetchStellarAccount(stellarTestnetConfig.horizonUrl, stellarAddress),
        fetchBaseReserveStroops(stellarTestnetConfig.horizonUrl).catch(() => DEFAULT_BASE_RESERVE_STROOPS),
      ]);
      setBaseReserveStroops(nextBaseReserve);

      if (!nextAccount) {
        setAccount(null);
        setTransactions([]);
        setAccountStatus('unfunded');
        return;
      }

      const nextTransactions = await fetchRecentTransactions(stellarTestnetConfig.horizonUrl, stellarAddress);
      setAccount(nextAccount);
      setTransactions(nextTransactions);
      setAccountStatus('funded');
    } catch (accountError) {
      setAccount(null);
      setTransactions([]);
      setAccountStatus('error');
      setError(getErrorMessage(accountError, 'Failed to load Stellar account from Horizon'));
    }
  }, []);

  const refreshWalletState = useCallback(async () => {
    const { StellarWalletsKit } = await loadWalletKit();
    const [{ address: currentAddress }, supportedWallets] = await Promise.all([
      StellarWalletsKit.getAddress().catch(() => ({ address: '' })),
      refreshSupportedWallets(),
    ]);

    setWallets(supportedWallets);
    setAddress(currentAddress || null);
    if (currentAddress) await loadAccount(currentAddress);
  }, [loadAccount]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeWallet: (() => void) | undefined;
    let unsubscribeDisconnect: (() => void) | undefined;

    async function init() {
      setStatus('loading');

      try {
        const { StellarWalletsKit, defaultModules, SwkAppDarkTheme, KitEventType, Networks } = await loadWalletKit();

        StellarWalletsKit.init({
          modules: defaultModules(),
          theme: SwkAppDarkTheme,
          network: Networks.TESTNET,
          authModal: {
            showInstallLabel: true,
            hideUnsupportedWallets: false,
          },
        });

        unsubscribeState = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
          if (!isMounted) return;
          const nextAddress = event.payload.address || null;
          setAddress(nextAddress);
          if (nextAddress) void loadAccount(nextAddress);
        });
        unsubscribeWallet = StellarWalletsKit.on(KitEventType.WALLET_SELECTED, (event) => {
          if (!isMounted) return;
          setSelectedWalletId(event.payload.id || null);
        });
        unsubscribeDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
          if (!isMounted) return;
          setAddress(null);
          setSelectedWalletId(null);
          setLastSignature(null);
          setAccount(null);
          setTransactions([]);
          setAccountStatus('idle');
        });

        if (!isMounted) return;
        setStatus('ready');
        await refreshWalletState();
      } catch (initError) {
        if (!isMounted) return;
        setStatus('error');
        setError(getErrorMessage(initError, 'Failed to initialize Stellar Wallets Kit'));
      }
    }

    void init();

    return () => {
      isMounted = false;
      unsubscribeState?.();
      unsubscribeWallet?.();
      unsubscribeDisconnect?.();
    };
  }, [loadAccount, refreshWalletState]);

  async function connectWallet() {
    setBusyAction('connect');
    setError(null);

    try {
      const { StellarWalletsKit } = await loadWalletKit();
      const result = await StellarWalletsKit.authModal();
      setAddress(result.address);
      setLastSignature(null);
      toast.success('Stellar wallet connected');
      await loadAccount(result.address);
      await refreshWalletState();
    } catch (connectError) {
      const message = getErrorMessage(connectError, 'Failed to connect Stellar wallet');
      setError(message);
      if (!message.toLowerCase().includes('closed')) toast.error(message);
    } finally {
      setBusyAction(null);
    }
  }

  async function disconnectWallet() {
    const { StellarWalletsKit } = await loadWalletKit();
    await StellarWalletsKit.disconnect();
    setAddress(null);
    setSelectedWalletId(null);
    setLastSignature(null);
    setAccount(null);
    setTransactions([]);
    setAccountStatus('idle');
    toast.success('Stellar wallet disconnected');
  }

  async function verifyOwnership() {
    if (!address) {
      await connectWallet();
      return;
    }

    setBusyAction('proof');
    setError(null);

    try {
      const { StellarWalletsKit, Networks } = await loadWalletKit();
      const message = ['Prism Stellar Earn proof', `Address: ${address}`, `Timestamp: ${new Date().toISOString()}`].join('\n');
      const { signedMessage } = await StellarWalletsKit.signMessage(message, {
        address,
        networkPassphrase: Networks.TESTNET,
      });
      setLastSignature(signedMessage);
      toast.success('Stellar proof signed');
    } catch (proofError) {
      const message = getErrorMessage(proofError, 'Failed to sign proof');
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction(null);
    }
  }

  async function fundAccount() {
    if (!address) {
      await connectWallet();
      return;
    }

    setBusyAction('fund');
    setError(null);

    try {
      await fundTestnetAccount(stellarTestnetConfig.friendbotUrl, address);
      toast.success('Testnet account funded');
      await loadAccount(address);
    } catch (fundError) {
      const message = getErrorMessage(fundError, 'Failed to fund account with Friendbot');
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction(null);
    }
  }

  async function addTrustline(assetCode: string, assetIssuer: string) {
    if (!address) {
      await connectWallet();
      return;
    }

    setBusyAction(`trustline-${assetCode}`);
    setError(null);

    try {
      const { StellarWalletsKit, Networks } = await loadWalletKit();
      const txXdr = await buildChangeTrustXdr({
        horizonUrl: stellarTestnetConfig.horizonUrl,
        source: address,
        assetCode,
        assetIssuer,
      });
      setLastTrustlineXdr(txXdr);
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(txXdr, {
        address,
        networkPassphrase: Networks.TESTNET,
      });
      const hash = await submitSignedTransactionXdr(stellarTestnetConfig.horizonUrl, signedTxXdr);
      setSubmittedTxHash(hash);
      toast.success(`${assetCode} trustline submitted`);
      await loadAccount(address);
    } catch (trustlineError) {
      const message = getErrorMessage(trustlineError, `Failed to add ${assetCode} trustline`);
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction(null);
    }
  }

  async function buildFeeBumpPreview() {
    if (!address || !lastTrustlineXdr) {
      toast.error('Add a trustline first to generate an inner transaction XDR.');
      return;
    }

    const sponsor = feeBumpAccount.trim() || address;
    setBusyAction('fee-bump');
    setError(null);

    try {
      const feeBumpXdr = await buildFeeBumpXdr({
        horizonUrl: stellarTestnetConfig.horizonUrl,
        feeAccount: sponsor,
        innerTransactionXdr: lastTrustlineXdr,
      });
      setLastFeeBumpXdr(feeBumpXdr);
      toast.success('Fee-bump XDR scaffold built');
    } catch (feeBumpError) {
      const message = getErrorMessage(feeBumpError, 'Failed to build fee-bump XDR');
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction(null);
    }
  }

  async function sendPayment() {
    if (!address) {
      await connectWallet();
      return;
    }

    setBusyAction('send');
    setSubmittedTxHash(null);
    setError(null);

    try {
      const { StellarWalletsKit, Networks } = await loadWalletKit();
      const txXdr = await buildNativePaymentXdr({
        horizonUrl: stellarTestnetConfig.horizonUrl,
        source: address,
        destination: sendDestination.trim(),
        amount: sendAmount.trim(),
      });
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(txXdr, {
        address,
        networkPassphrase: Networks.TESTNET,
      });
      const hash = await submitSignedTransactionXdr(stellarTestnetConfig.horizonUrl, signedTxXdr);
      setSubmittedTxHash(hash);
      toast.success('Testnet payment submitted');
      await loadAccount(address);
    } catch (sendError) {
      const message = getErrorMessage(sendError, 'Failed to send testnet payment');
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="wallet-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Live Stellar testnet demo</p>
          <h2>Wallet, account, and onchain balances</h2>
          <p className="muted">
            Connect a supported Stellar wallet, create a testnet account with Friendbot, read balances through Horizon,
            sign a proof, and submit a payment transaction.
          </p>
        </div>
        {address ? (
          <button className="button-secondary" onClick={disconnectWallet} type="button">
            Disconnect
          </button>
        ) : (
          <button className="button" disabled={status === 'loading' || busyAction === 'connect'} onClick={connectWallet} type="button">
            {busyAction === 'connect' ? 'Connecting...' : status === 'loading' ? 'Loading wallets...' : 'Connect Stellar wallet'}
          </button>
        )}
      </div>

      <div className="grid-3">
        <div className="mini-card">
          <p className="eyebrow">Wallet</p>
          <h3>{address ? 'Connected' : status === 'error' ? 'Needs attention' : 'Not connected'}</h3>
          <p className="muted">{address ? formatStellarAddress(address) : 'Connect a Stellar wallet to continue.'}</p>
        </div>
        <div className="mini-card">
          <p className="eyebrow">Account</p>
          <h3>
            {accountStatus === 'funded'
              ? 'Funded'
              : accountStatus === 'unfunded'
                ? 'Ready to fund'
                : accountStatus === 'loading'
                  ? 'Checking Horizon'
                  : 'Waiting'}
          </h3>
          <p className="muted">{nativeBalance ? `${Number(nativeBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM` : 'Network: testnet'}</p>
        </div>
        <div className="mini-card">
          <p className="eyebrow">Selected wallet</p>
          <h3>{selectedWalletId || 'Wallets Kit'}</h3>
          <p className="muted">{lastSignature ? `Proof: ${lastSignature.slice(0, 34)}...` : 'Sign a proof to verify ownership.'}</p>
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">Earn readiness checklist</p>
        <h2>Stellar account state for Prism Earn</h2>
        <p className="muted">
          Each step maps to a real Stellar requirement: reserves, trustlines, issued-asset balances, and stablebond
          position.
        </p>
        <div className="pipeline-list">
          {earnReadiness.map((step) => (
            <article className="pipeline-row" key={step.id}>
              <div>
                <p className="eyebrow">{step.stellarConcept}</p>
                <h3>{step.title}</h3>
                <p className="muted">{step.detail}</p>
              </div>
              <span className={`pipeline-status ${readinessStatusClass[step.status]}`}>{step.status}</span>
            </article>
          ))}
        </div>
      </div>

      {reserveSnapshot ? (
        <div className="grid-3">
          <div className="mini-card">
            <p className="eyebrow">Subentries</p>
            <h3>{reserveSnapshot.subentryCount}</h3>
            <p className="muted">Trustlines and other account entries.</p>
          </div>
          <div className="mini-card">
            <p className="eyebrow">Minimum reserve</p>
            <h3>{reserveSnapshot.minimumBalanceXlm.toFixed(2)} XLM</h3>
            <p className="muted">Base reserve {reserveSnapshot.baseReserveXlm} XLM per entry.</p>
          </div>
          <div className="mini-card">
            <p className="eyebrow">Sponsorship</p>
            <h3>{reserveSnapshot.numSponsored} sponsored</h3>
            <p className="muted">{reserveSnapshot.numSponsoring} entries this account sponsors.</p>
          </div>
        </div>
      ) : null}

      {address ? (
        <div className="actions">
          {accountStatus === 'unfunded' ? (
            <button className="button" disabled={busyAction === 'fund'} onClick={fundAccount} type="button">
              {busyAction === 'fund' ? 'Funding...' : 'Fund account'}
            </button>
          ) : null}
          <button className="button-secondary" disabled={busyAction === 'proof'} onClick={verifyOwnership} type="button">
            {busyAction === 'proof' ? 'Signing...' : 'Verify ownership'}
          </button>
          <button className="button-secondary" disabled={accountStatus === 'loading'} onClick={() => loadAccount(address)} type="button">
            Refresh account
          </button>
        </div>
      ) : null}

      {address && accountStatus === 'funded' ? (
        <div className="card">
          <p className="eyebrow">Account onboarding WIP</p>
          <h2>Trustlines for Earn settlement</h2>
          <p className="muted">
            Prism sponsors reserves in production. This workbench builds real changeTrust transactions for Circle testnet
            USDC and documents the Etherfuse USTRY mainnet asset id for allocation work.
          </p>
          <div className="grid-2">
            {onboardingAssets.map((asset) => {
              const hasLine =
                asset.network === 'testnet' && account
                  ? accountHasTrustline(account, asset.code, asset.issuer)
                  : false;

              return (
                <div className="mini-card" key={formatStellarAssetId(asset)}>
                  <p className="eyebrow">{asset.label}</p>
                  <h3>{asset.code}</h3>
                  <p className="mono muted">{formatStellarAssetId(asset)}</p>
                  <p className="muted">
                    {asset.network === 'testnet'
                      ? hasLine
                        ? 'Trustline active on testnet.'
                        : 'Trustline missing on testnet.'
                      : 'Mainnet issuer metadata for yield allocation work.'}
                  </p>
                  {asset.network === 'testnet' ? (
                    <button
                      className="button-secondary"
                      disabled={busyAction !== null || hasLine}
                      onClick={() => addTrustline(asset.code, asset.issuer)}
                      type="button"
                    >
                      {hasLine ? 'Trustline ready' : busyAction === `trustline-${asset.code}` ? 'Signing...' : 'Add trustline'}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="quote-card">
            <p className="eyebrow">Fee-bump sponsor scaffold</p>
            <p className="muted">
              Wrap the last trustline transaction so a Prism sponsor account can pay fees instead of the user holding XLM.
            </p>
            <div className="simulator-grid">
              <label className="simulator-field">
                <span>Sponsor account (G...)</span>
                <input
                  onChange={(event) => setFeeBumpAccount(event.target.value)}
                  placeholder={address}
                  value={feeBumpAccount}
                />
              </label>
              <button className="button-secondary" disabled={!lastTrustlineXdr || busyAction === 'fee-bump'} onClick={buildFeeBumpPreview} type="button">
                {busyAction === 'fee-bump' ? 'Building...' : 'Build fee-bump XDR'}
              </button>
            </div>
            {lastFeeBumpXdr ? <p className="mono muted">Fee-bump XDR ready ({lastFeeBumpXdr.length} chars). Paste into Chain Signatures inspector.</p> : null}
          </div>
        </div>
      ) : null}

      {account?.balances.length ? (
        <div className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Live balances</p>
              <p className="muted">Read directly from Horizon testnet.</p>
            </div>
            <a className="button-secondary" href={`${stellarTestnetConfig.horizonUrl}/accounts/${address}`} rel="noreferrer" target="_blank">
              Open Horizon
            </a>
          </div>
          <div className="grid-3">
            {account.balances.map((balance) => (
              <div className="mini-card" key={`${balance.asset_type}:${balance.asset_code || 'XLM'}:${balance.asset_issuer || 'native'}`}>
                <h3>{getBalanceLabel(balance)}</h3>
                <p className="muted">{Number(balance.balance).toLocaleString(undefined, { maximumFractionDigits: 7 })}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {address ? (
        <div className="card">
          <p className="eyebrow">End-to-end payment</p>
          <h2>Send testnet XLM</h2>
          <p className="muted">Build a Stellar payment, sign it with the connected wallet, submit it to Horizon, and refresh balances.</p>
          <div className="grid-3">
            <input onChange={(event) => setSendDestination(event.target.value)} placeholder="Destination G..." value={sendDestination} />
            <input inputMode="decimal" onChange={(event) => setSendAmount(event.target.value)} value={sendAmount} />
            <button className="button" disabled={busyAction === 'send' || accountStatus !== 'funded'} onClick={sendPayment} type="button">
              {busyAction === 'send' ? 'Sending...' : 'Sign & send'}
            </button>
          </div>
          <div className="actions">
            <button className="button-secondary" onClick={() => setSendDestination(address)} type="button">
              Use my address
            </button>
            {submittedTxHash ? (
              <a className="button-secondary" href={`https://stellar.expert/explorer/testnet/tx/${submittedTxHash}`} rel="noreferrer" target="_blank">
                View submitted tx
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {accountStatus === 'funded' ? (
        <div className="card">
          <p className="eyebrow">Recent transactions</p>
          {transactions.length ? (
            <div className="grid-2">
              {transactions.map((transaction) => (
                <a className="mini-card" href={`https://stellar.expert/explorer/testnet/tx/${transaction.hash}`} key={transaction.id} rel="noreferrer" target="_blank">
                  <h3>{formatStellarAddress(transaction.hash)}</h3>
                  <p className="muted">
                    {transaction.successful ? 'Success' : 'Failed'} · {transaction.operation_count} operation
                    {transaction.operation_count === 1 ? '' : 's'} · {formatTransactionDate(transaction.created_at)}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No transactions yet.</p>
          )}
        </div>
      ) : null}

      {sortedWallets.length ? (
        <div>
          <p className="eyebrow">Supported Stellar wallets</p>
          <p className="muted">Ready means Wallets Kit can open that wallet flow from this browser.</p>
          <div className="grid-3">
            {sortedWallets.map((wallet) => (
              <a className="mini-card" href={wallet.url} key={wallet.id} rel="noreferrer" target="_blank">
                <strong>{wallet.name}</strong>
                <p className="muted">{wallet.isAvailable ? 'Ready' : 'Install'}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
    </section>
  );
}
