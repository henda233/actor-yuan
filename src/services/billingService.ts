export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  inputPrice: number,
  outputPrice: number,
): number {
  return (inputTokens * inputPrice + outputTokens * outputPrice) / 1_000_000;
}

export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return stripTrailingZero(v.toFixed(1)) + 'K';
  }
  if (n < 1_000_000_000) {
    const v = n / 1_000_000;
    return stripTrailingZero(v.toFixed(1)) + 'M';
  }
  const v = n / 1_000_000_000;
  return stripTrailingZero(v.toFixed(1)) + 'B';
}

function stripTrailingZero(s: string): string {
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

export function formatCost(n: number): string {
  return `¥${n.toFixed(2)}`;
}
