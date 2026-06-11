export const STELLAR_TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const STELLAR_TESTNET_FRIENDBOT_URL = 'https://friendbot.stellar.org';

export type StellarNetworkConfig = {
  horizonUrl: string;
  friendbotUrl: string;
};

export const stellarTestnetConfig: StellarNetworkConfig = {
  horizonUrl: STELLAR_TESTNET_HORIZON_URL,
  friendbotUrl: STELLAR_TESTNET_FRIENDBOT_URL,
};
