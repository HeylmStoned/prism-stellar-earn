import type { StellarBalance } from './types';

export const formatStellarAddress = (address: string): string => `${address.slice(0, 6)}...${address.slice(-6)}`;

export function getBalanceLabel(balance: StellarBalance): string {
  if (balance.asset_type === 'native') return 'XLM';
  return balance.asset_code || balance.asset_type;
}

export function formatTransactionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
