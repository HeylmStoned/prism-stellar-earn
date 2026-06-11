import * as StellarSdk from '@stellar/stellar-sdk';

export type BuildNativePaymentXdrInput = {
  horizonUrl: string;
  source: string;
  destination: string;
  amount: string;
};

export async function buildNativePaymentXdr(input: BuildNativePaymentXdrInput): Promise<string> {
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(input.destination)) {
    throw new Error('Enter a valid Stellar public key.');
  }

  if (!Number.isFinite(Number(input.amount)) || Number(input.amount) <= 0) {
    throw new Error('Enter an amount greater than 0.');
  }

  const server = new StellarSdk.Horizon.Server(input.horizonUrl);
  const sourceAccount = await server.loadAccount(input.source);

  return new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: input.destination,
        asset: StellarSdk.Asset.native(),
        amount: input.amount,
      }),
    )
    .setTimeout(180)
    .build()
    .toXDR();
}

export async function submitSignedTransactionXdr(horizonUrl: string, signedTxXdr: string): Promise<string> {
  const server = new StellarSdk.Horizon.Server(horizonUrl);
  const signedTransaction = new StellarSdk.Transaction(signedTxXdr, StellarSdk.Networks.TESTNET);
  const result = await server.submitTransaction(signedTransaction);

  return result.hash;
}
