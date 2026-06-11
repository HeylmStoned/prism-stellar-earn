import { stellarUsdcAssets, ustryMainnetAsset } from './assets';

export type EarnReadinessStatus = 'complete' | 'action-needed' | 'blocked' | 'info';

export type EarnReadinessStep = {
  id: string;
  title: string;
  stellarConcept: string;
  status: EarnReadinessStatus;
  detail: string;
};

export type EarnReadinessInput = {
  accountExists: boolean;
  usdcTrustlineActive: boolean;
  ustryTrustlineActive: boolean;
  usdcBalance: number;
  ustryBalance: number;
  minimumBalanceXlm: number;
  availableXlm: number;
};

export function evaluateEarnReadiness(input: EarnReadinessInput): EarnReadinessStep[] {
  const usdc = stellarUsdcAssets.testnet;
  const ustry = ustryMainnetAsset;

  return [
    {
      id: 'stellar-account',
      title: 'Stellar account exists',
      stellarConcept: 'Account + minimum reserve',
      status: input.accountExists ? 'complete' : 'action-needed',
      detail: input.accountExists
        ? `Account funded. Minimum reserve ~${input.minimumBalanceXlm.toFixed(2)} XLM; ${input.availableXlm.toFixed(2)} XLM spendable.`
        : 'Create the Stellar account via Friendbot or sponsored createAccount in production.',
    },
    {
      id: 'usdc-trustline',
      title: 'Circle USDC trustline',
      stellarConcept: 'changeTrust',
      status: !input.accountExists
        ? 'blocked'
        : input.usdcTrustlineActive
          ? 'complete'
          : 'action-needed',
      detail: input.usdcTrustlineActive
        ? `${usdc.code} trustline active (${usdc.issuer.slice(0, 8)}...).`
        : `Opt in to ${usdc.label} before receiving bridged settlement USDC.`,
    },
    {
      id: 'usdc-balance',
      title: 'Settlement USDC on Stellar',
      stellarConcept: 'Issued asset balance',
      status: !input.accountExists
        ? 'blocked'
        : input.usdcBalance > 0
          ? 'complete'
          : 'info',
      detail:
        input.usdcBalance > 0
          ? `${input.usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} USDC ready for allocation.`
          : 'Await CCTP / NEAR Intents settlement into Stellar USDC.',
    },
    {
      id: 'ustry-trustline',
      title: 'USTRY trustline',
      stellarConcept: 'changeTrust for Etherfuse asset',
      status: !input.accountExists ? 'blocked' : input.ustryTrustlineActive ? 'complete' : 'info',
      detail: input.ustryTrustlineActive
        ? `${ustry.code} trustline active on this account.`
        : `Production uses mainnet issuer ${ustry.issuer.slice(0, 8)}...; Etherfuse can bundle claim + trustline via ramp API.`,
    },
    {
      id: 'ustry-position',
      title: 'Stablebond position',
      stellarConcept: 'pathPaymentStrictSend / Etherfuse ramp',
      status: !input.accountExists
        ? 'blocked'
        : input.ustryBalance > 0
          ? 'complete'
          : 'info',
      detail:
        input.ustryBalance > 0
          ? `${input.ustryBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} USTRY held on Stellar.`
          : 'Allocate USDC into USTRY via Stellar path payment or Etherfuse order flow.',
    },
  ];
}
