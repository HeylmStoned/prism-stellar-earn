export type BridgeRail = 'cctp-v2' | 'near-intents';

export type SourceChain = 'arbitrum' | 'megaeth' | 'ethereum' | 'base' | 'other';

export type DepositRouteRequest = {
  userEvmAddress: `0x${string}`;
  sourceChain: SourceChain;
  sourceAsset: string;
  amount: string;
  targetStablebond: string;
};

export type DepositRouteQuote = {
  rail: BridgeRail;
  sourceChain: SourceChain;
  sourceAsset: string;
  settlementAsset: 'Stellar USDC';
  targetStablebond: string;
  estimatedSettlementSeconds: number;
  notes: string[];
};

export function chooseDepositRail(request: DepositRouteRequest): BridgeRail {
  if (request.sourceAsset.toUpperCase() === 'USDC' && request.sourceChain === 'arbitrum') {
    return 'cctp-v2';
  }

  return 'near-intents';
}

export function quoteDepositRoute(request: DepositRouteRequest): DepositRouteQuote {
  const rail = chooseDepositRail(request);

  return {
    rail,
    sourceChain: request.sourceChain,
    sourceAsset: request.sourceAsset,
    settlementAsset: 'Stellar USDC',
    targetStablebond: request.targetStablebond,
    estimatedSettlementSeconds: rail === 'cctp-v2' ? 20 : 45,
    notes:
      rail === 'cctp-v2'
        ? ['Canonical native USDC burn-and-mint route for supported Circle domains.']
        : ['Solver-settled route for broader source chain and asset coverage.'],
  };
}
