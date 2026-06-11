import * as StellarSdk from '@stellar/stellar-sdk';

export type StellarPathRecord = {
  source_amount: string;
  destination_amount: string;
  path: Array<{
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  }>;
};

export async function fetchStrictSendPaths(input: {
  horizonUrl: string;
  sourceAmount: string;
  sourceAssetCode: string;
  sourceAssetIssuer: string;
  destinationAssetCode: string;
  destinationAssetIssuer: string;
}): Promise<StellarPathRecord[]> {
  const server = new StellarSdk.Horizon.Server(input.horizonUrl);
  const sourceAsset = new StellarSdk.Asset(input.sourceAssetCode, input.sourceAssetIssuer);
  const destinationAsset = new StellarSdk.Asset(input.destinationAssetCode, input.destinationAssetIssuer);

  const result = await server.strictSendPaths(sourceAsset, input.sourceAmount, [destinationAsset]).call();

  return result.records.map((record) => ({
    source_amount: record.source_amount,
    destination_amount: record.destination_amount,
    path: record.path,
  }));
}

export async function buildPathPaymentStrictSendXdr(input: {
  horizonUrl: string;
  networkPassphrase: string;
  source: string;
  destination: string;
  sendAssetCode: string;
  sendAssetIssuer: string;
  sendAmount: string;
  destAssetCode: string;
  destAssetIssuer: string;
  destMin: string;
  path: StellarPathRecord['path'];
}): Promise<string> {
  const server = new StellarSdk.Horizon.Server(input.horizonUrl);
  const sourceAccount = await server.loadAccount(input.source);
  const sendAsset = new StellarSdk.Asset(input.sendAssetCode, input.sendAssetIssuer);
  const destAsset = new StellarSdk.Asset(input.destAssetCode, input.destAssetIssuer);
  const pathAssets = input.path.map((hop) => {
    if (hop.asset_type === 'native') return StellarSdk.Asset.native();
    if (!hop.asset_code || !hop.asset_issuer) {
      throw new Error('Invalid intermediate path asset.');
    }
    return new StellarSdk.Asset(hop.asset_code, hop.asset_issuer);
  });

  return new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: input.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset,
        sendAmount: input.sendAmount,
        destination: input.destination,
        destAsset,
        destMin: input.destMin,
        path: pathAssets,
      }),
    )
    .setTimeout(180)
    .build()
    .toXDR();
}
