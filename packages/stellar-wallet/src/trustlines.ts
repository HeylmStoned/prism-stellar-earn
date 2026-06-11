import * as StellarSdk from '@stellar/stellar-sdk';

import type { StellarAccount } from './types';

export function accountHasTrustline(account: StellarAccount, assetCode: string, assetIssuer: string): boolean {
  return account.balances.some(
    (balance) =>
      balance.asset_type !== 'native' && balance.asset_code === assetCode && balance.asset_issuer === assetIssuer,
  );
}

export async function buildChangeTrustXdr(input: {
  horizonUrl: string;
  source: string;
  assetCode: string;
  assetIssuer: string;
  limit?: string;
}): Promise<string> {
  const server = new StellarSdk.Horizon.Server(input.horizonUrl);
  const sourceAccount = await server.loadAccount(input.source);
  const asset = new StellarSdk.Asset(input.assetCode, input.assetIssuer);

  return new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset,
        limit: input.limit ?? '922337203685.4775807',
      }),
    )
    .setTimeout(180)
    .build()
    .toXDR();
}
