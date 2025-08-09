export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('fr-MA')} DH`;
}

export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[^\d.,]/g, '').replace(',', '.'));
}
