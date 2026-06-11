import type { StellarAccount, StellarTransaction } from './types';

export async function fetchStellarAccount(horizonUrl: string, address: string): Promise<StellarAccount | null> {
  const response = await fetch(`${horizonUrl}/accounts/${address}`, {
    headers: { Accept: 'application/json' },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Horizon returned ${response.status}`);
  }

  return (await response.json()) as StellarAccount;
}

export async function fetchRecentTransactions(
  horizonUrl: string,
  address: string,
  limit = 5,
): Promise<StellarTransaction[]> {
  const response = await fetch(`${horizonUrl}/accounts/${address}/transactions?order=desc&limit=${limit}`, {
    headers: { Accept: 'application/json' },
  });

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error(`Horizon transactions returned ${response.status}`);
  }

  const payload = (await response.json()) as {
    _embedded?: {
      records?: StellarTransaction[];
    };
  };

  return payload._embedded?.records || [];
}

export async function fetchBaseReserveStroops(horizonUrl: string): Promise<number> {
  const response = await fetch(`${horizonUrl}/ledgers?order=desc&limit=1`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Horizon ledgers returned ${response.status}`);
  }

  const payload = (await response.json()) as {
    _embedded?: {
      records?: Array<{ base_reserve_in_stroops?: number }>;
    };
  };

  const baseReserve = payload._embedded?.records?.[0]?.base_reserve_in_stroops;
  if (!baseReserve) {
    throw new Error('Horizon did not return base_reserve_in_stroops');
  }

  return baseReserve;
}
