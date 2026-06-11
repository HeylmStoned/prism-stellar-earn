export type ImplementationStatus = 'done' | 'wip' | 'planned';

export type DepositPipelineStep = {
  id: string;
  title: string;
  status: ImplementationStatus;
  layer: 'account' | 'bridge' | 'yield' | 'ux';
  description: string;
};

/** Tracks public implementation status against the Prism Stellar architecture doc. */
export const depositPipeline: DepositPipelineStep[] = [
  {
    id: 'native-wallet-connect',
    title: 'Native Stellar wallet connect',
    status: 'done',
    layer: 'ux',
    description: 'Freighter, xBull, and other wallets via Stellar Wallets Kit on testnet.',
  },
  {
    id: 'horizon-account-reads',
    title: 'Horizon account and balance reads',
    status: 'done',
    layer: 'account',
    description: 'Live testnet balances, funding state, and recent transaction history.',
  },
  {
    id: 'testnet-payment-flow',
    title: 'Wallet-signed testnet payments',
    status: 'done',
    layer: 'account',
    description: 'Build, sign, and submit native XLM payments through Horizon.',
  },
  {
    id: 'route-model',
    title: 'Bridge route selection model',
    status: 'wip',
    layer: 'bridge',
    description: 'Typed CCTP V2 vs NEAR Intents routing with interactive deposit quotes in the demo UI.',
  },
  {
    id: 'earn-readiness',
    title: 'Earn readiness checklist',
    status: 'done',
    layer: 'account',
    description: 'Maps live account state to Stellar reserves, trustlines, USDC settlement, and USTRY position requirements.',
  },
  {
    id: 'path-discovery',
    title: 'USDC → USTRY path discovery',
    status: 'wip',
    layer: 'yield',
    description: 'Live mainnet Horizon path queries for Stellar DEX allocation into Etherfuse USTRY.',
  },
  {
    id: 'trustline-onboarding',
    title: 'USDC and stablebond trustline onboarding',
    status: 'wip',
    layer: 'account',
    description: 'Build and wallet-sign changeTrust XDR for Circle USDC and Etherfuse USTRY targets.',
  },
  {
    id: 'fee-bump-sponsor',
    title: 'Fee-bump sponsor scaffold',
    status: 'wip',
    layer: 'account',
    description: 'Wrap inner Stellar transactions so Prism can sponsor fees without user XLM.',
  },
  {
    id: 'chain-signatures',
    title: 'NEAR Chain Signatures Stellar signing',
    status: 'wip',
    layer: 'account',
    description: 'Derive stable Ed25519 paths, hash Stellar XDR, and attach MPC signatures.',
  },
  {
    id: 'etherfuse-allocation',
    title: 'Etherfuse USTRY allocation',
    status: 'planned',
    layer: 'yield',
    description: 'Swap Stellar USDC into USTRY and surface positions inside Prism Earn.',
  },
  {
    id: 'position-indexing',
    title: 'Durable position indexing',
    status: 'planned',
    layer: 'yield',
    description: 'Index stablebond balances and redemption state for portfolio display.',
  },
  {
    id: 'evm-direct-deposit',
    title: 'EVM direct deposit',
    status: 'planned',
    layer: 'bridge',
    description: 'Deposit from Prism EVM wallet without installing a Stellar wallet.',
  },
];

export function pipelineSummary() {
  const done = depositPipeline.filter((step) => step.status === 'done').length;
  const wip = depositPipeline.filter((step) => step.status === 'wip').length;
  const planned = depositPipeline.filter((step) => step.status === 'planned').length;

  return { done, wip, planned, total: depositPipeline.length };
}
