/** Two decimals with a dot, matching the receipt layout in docs/DESIGN.md. */
export function formatAmount(value: number): string {
  return value.toFixed(2);
}
