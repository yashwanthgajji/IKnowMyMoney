export function formatCurrency(
  cents: number,
  symbol: string = '$',
  decimals: number = 2
): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const dollars = (absCents / 100).toFixed(decimals);

  // Add commas to the integer part
  const parts = dollars.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = parts.join('.');

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function parseAmountToCents(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '') return 0;
  // Clean string from currency symbols or commas
  const cleaned = amountStr.replace(/[^0-9.]/g, '');
  const floatVal = parseFloat(cleaned);
  if (isNaN(floatVal)) return 0;
  return Math.round(floatVal * 100);
}

export function centsToInputValue(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toFixed(2);
}
