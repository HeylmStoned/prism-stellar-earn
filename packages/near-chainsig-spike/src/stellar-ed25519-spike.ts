import * as StellarSdk from '@stellar/stellar-sdk';

export type StellarChainSignaturePlan = {
  nearAccountId: string;
  derivationPath: string;
  stellarPublicKey: string;
  unsignedXdr: string;
  signaturePayload: Uint8Array;
};

export type StellarMpcSignature = {
  stellarPublicKey: string;
  signatureBase64: string;
};

export function deriveStableStellarPath(userEvmAddress: `0x${string}`, product = 'prism-earn'): string {
  return `${product}:${userEvmAddress.toLowerCase()}:stellar-ed25519`;
}

export async function createUnsignedNativePaymentXdr(input: {
  horizonUrl: string;
  sourcePublicKey: string;
  destinationPublicKey: string;
  amount: string;
}): Promise<string> {
  const server = new StellarSdk.Horizon.Server(input.horizonUrl);
  const sourceAccount = await server.loadAccount(input.sourcePublicKey);

  return new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: input.destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: input.amount,
      }),
    )
    .setTimeout(180)
    .build()
    .toXDR();
}

export function getStellarSignaturePayload(unsignedXdr: string): Uint8Array {
  const transaction = new StellarSdk.Transaction(unsignedXdr, StellarSdk.Networks.TESTNET);
  return transaction.hash();
}

export function attachEd25519SignatureToXdr(unsignedXdr: string, signature: StellarMpcSignature): string {
  const transaction = new StellarSdk.Transaction(unsignedXdr, StellarSdk.Networks.TESTNET);
  transaction.addSignature(signature.stellarPublicKey, signature.signatureBase64);
  return transaction.toXDR();
}

export async function buildChainSignaturePlan(input: {
  nearAccountId: string;
  userEvmAddress: `0x${string}`;
  stellarPublicKey: string;
  unsignedXdr: string;
}): Promise<StellarChainSignaturePlan> {
  return {
    nearAccountId: input.nearAccountId,
    derivationPath: deriveStableStellarPath(input.userEvmAddress),
    stellarPublicKey: input.stellarPublicKey,
    unsignedXdr: input.unsignedXdr,
    signaturePayload: getStellarSignaturePayload(input.unsignedXdr),
  };
}

// Integration boundary:
// 1. Call NEAR MPC contract with nearAccountId, derivationPath, and signaturePayload.
// 2. Receive the Ed25519 public key and signature bytes.
// 3. Call attachEd25519SignatureToXdr().
// 4. Submit signed XDR to Horizon.
