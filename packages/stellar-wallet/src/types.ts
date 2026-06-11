export type StellarBalance = {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
};

export type StellarAccount = {
  id: string;
  sequence: string;
  balances: StellarBalance[];
  subentry_count?: number;
  num_sponsoring?: number;
  num_sponsored?: number;
};

export type StellarTransaction = {
  id: string;
  hash: string;
  created_at: string;
  successful: boolean;
  operation_count: number;
  fee_charged: string;
  ledger: number;
};

export type StellarWalletInfo = {
  id: string;
  name: string;
  isAvailable: boolean;
  url: string;
};
