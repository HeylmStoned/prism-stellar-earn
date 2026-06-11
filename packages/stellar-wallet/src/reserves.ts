import type { StellarAccount } from './types';

/** Stellar base reserve per ledger entry (stroops). Testnet/mainnet currently 0.5 XLM. */
export const DEFAULT_BASE_RESERVE_STROOPS = 5000000;

export type AccountReserveSnapshot = {
  subentryCount: number;
  numSponsoring: number;
  numSponsored: number;
  baseReserveXlm: number;
  minimumBalanceXlm: number;
  availableXlm: number;
  nativeBalanceXlm: number;
};

export function stroopsToXlm(stroops: number): number {
  return stroops / 10_000_000;
}

/**
 * Minimum balance = (2 + subentries - sponsored) * base_reserve.
 * See Stellar account reserve documentation.
 */
export function estimateMinimumBalanceXlm(
  subentryCount: number,
  numSponsored = 0,
  baseReserveStroops = DEFAULT_BASE_RESERVE_STROOPS,
): number {
  const effectiveSubentries = Math.max(0, subentryCount - numSponsored);
  const entries = 2 + effectiveSubentries;
  return stroopsToXlm(entries * baseReserveStroops);
}

export function getAccountReserveSnapshot(
  account: StellarAccount,
  baseReserveStroops = DEFAULT_BASE_RESERVE_STROOPS,
): AccountReserveSnapshot {
  const subentryCount = account.subentry_count ?? 0;
  const numSponsoring = account.num_sponsoring ?? 0;
  const numSponsored = account.num_sponsored ?? 0;
  const nativeBalance = account.balances.find((balance) => balance.asset_type === 'native');
  const nativeBalanceXlm = nativeBalance ? Number(nativeBalance.balance) : 0;
  const baseReserveXlm = stroopsToXlm(baseReserveStroops);
  const minimumBalanceXlm = estimateMinimumBalanceXlm(subentryCount, numSponsored, baseReserveStroops);

  return {
    subentryCount,
    numSponsoring,
    numSponsored,
    baseReserveXlm,
    minimumBalanceXlm,
    availableXlm: Math.max(0, nativeBalanceXlm - minimumBalanceXlm),
    nativeBalanceXlm,
  };
}
