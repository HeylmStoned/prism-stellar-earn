export async function fundTestnetAccount(friendbotUrl: string, address: string): Promise<void> {
  const response = await fetch(`${friendbotUrl}?addr=${encodeURIComponent(address)}`);

  if (!response.ok) {
    throw new Error(`Friendbot returned ${response.status}`);
  }
}
