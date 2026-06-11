export type PrismStellarAccessMode = 'evm-chain-signatures' | 'native-stellar-wallet';

export type PrismStellarAccount = {
  userEvmAddress?: `0x${string}`;
  stellarPublicKey: string;
  accessMode: PrismStellarAccessMode;
  reserveSponsor?: string;
  feeBumpSponsor?: string;
};

export type TrustlineRequirement = {
  assetCode: string;
  issuer: string;
  reserveSponsorRequired: boolean;
};

export const requiredTrustlinesForStablebond = (assetCode: string, issuer: string): TrustlineRequirement[] => [
  {
    assetCode: 'USDC',
    issuer,
    reserveSponsorRequired: true,
  },
  {
    assetCode,
    issuer,
    reserveSponsorRequired: true,
  },
];
