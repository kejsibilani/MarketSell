export function formatNumber(value: number | string | null | undefined, decimals = 0) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  const negative = num < 0;
  const abs = Math.abs(num);
  const fixed = abs.toFixed(decimals);
  const parts = fixed.split('.');
  // Insert apostrophe as thousands separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return (negative ? '-' : '') + parts.join('.');
}

export default formatNumber;
