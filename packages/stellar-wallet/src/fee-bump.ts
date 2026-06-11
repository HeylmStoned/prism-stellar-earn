import * as StellarSdk from '@stellar/stellar-sdk';

export async function buildFeeBumpXdr(input: {
  horizonUrl: string;
  feeAccount: string;
  innerTransactionXdr: string;
  fee?: string;
}): Promise<string> {
  const innerTransaction = new StellarSdk.Transaction(input.innerTransactionXdr, StellarSdk.Networks.TESTNET);

  return StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
    input.feeAccount,
    input.fee ?? StellarSdk.BASE_FEE,
    innerTransaction,
    StellarSdk.Networks.TESTNET,
  )
    .toXDR();
}
