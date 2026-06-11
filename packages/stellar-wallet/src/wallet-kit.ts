import type { StellarWalletInfo } from './types';

export async function loadWalletKit() {
  const [{ StellarWalletsKit }, { defaultModules }, { SwkAppDarkTheme, KitEventType, Networks }] = await Promise.all([
    import('@creit-tech/stellar-wallets-kit/sdk'),
    import('@creit-tech/stellar-wallets-kit/modules/utils'),
    import('@creit-tech/stellar-wallets-kit/types'),
  ]);

  return { StellarWalletsKit, defaultModules, SwkAppDarkTheme, KitEventType, Networks };
}

export async function refreshSupportedWallets(): Promise<StellarWalletInfo[]> {
  const { StellarWalletsKit } = await loadWalletKit();
  const supportedWallets = await StellarWalletsKit.refreshSupportedWallets();

  return supportedWallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    isAvailable: wallet.isAvailable,
    url: wallet.url,
  }));
}
