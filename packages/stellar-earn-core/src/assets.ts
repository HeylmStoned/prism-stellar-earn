export type StellarNetwork = 'mainnet' | 'testnet';

export type StellarIssuedAsset = {
  code: string;
  issuer: string;
  network: StellarNetwork;
  label: string;
};

/** Circle USDC on Stellar — canonical settlement asset for Prism Earn. */
export const stellarUsdcAssets: Record<StellarNetwork, StellarIssuedAsset> = {
  mainnet: {
    code: 'USDC',
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    network: 'mainnet',
    label: 'Circle USDC',
  },
  testnet: {
    code: 'USDC',
    issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    network: 'testnet',
    label: 'Circle testnet USDC',
  },
};

/** Etherfuse USTRY mainnet issuer (public registry). Testnet identifiers come from Etherfuse sandbox API. */
export const ustryMainnetAsset: StellarIssuedAsset = {
  code: 'USTRY',
  issuer: 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
  network: 'mainnet',
  label: 'Etherfuse USTRY',
};

export function formatStellarAssetId(asset: StellarIssuedAsset): string {
  return `${asset.code}:${asset.issuer}`;
}

export function earnOnboardingAssets(network: StellarNetwork = 'testnet'): StellarIssuedAsset[] {
  return [stellarUsdcAssets[network], ustryMainnetAsset];
}
