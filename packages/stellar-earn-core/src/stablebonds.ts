export type StablebondStatus = 'first-market' | 'coming-soon';

export type StablebondMarket = {
  symbol: string;
  name: string;
  region: string;
  issuer: 'Etherfuse';
  settlementAsset: 'Stellar USDC';
  description: string;
  status: StablebondStatus;
};

export const stablebondMarkets: StablebondMarket[] = [
  {
    symbol: 'USTRY',
    name: 'US Treasury stablebond',
    region: 'United States',
    issuer: 'Etherfuse',
    settlementAsset: 'Stellar USDC',
    description: 'Dollar-denominated tokenized treasury exposure from Etherfuse, designed as the first Prism Earn market.',
    status: 'first-market',
  },
  {
    symbol: 'CETES',
    name: 'Mexican treasury stablebond',
    region: 'Mexico',
    issuer: 'Etherfuse',
    settlementAsset: 'Stellar USDC',
    description: 'Future local-currency sovereign exposure for users seeking diversified RWA yield.',
    status: 'coming-soon',
  },
  {
    symbol: 'TESOURO',
    name: 'Brazilian treasury stablebond',
    region: 'Brazil',
    issuer: 'Etherfuse',
    settlementAsset: 'Stellar USDC',
    description: 'Planned expansion into Brazilian sovereign yield through Stellar settlement rails.',
    status: 'coming-soon',
  },
  {
    symbol: 'EUROB',
    name: 'European bond exposure',
    region: 'Europe',
    issuer: 'Etherfuse',
    settlementAsset: 'Stellar USDC',
    description: 'Euro-denominated stablebond access for multi-currency RWA strategies.',
    status: 'coming-soon',
  },
];
