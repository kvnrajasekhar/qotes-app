/** 999 -> "999", 1200 -> "1.2k", 15000 -> "15k", 2_300_000 -> "2.3M". */
export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value < 1000) return String(Math.floor(value));
  const units: [number, string][] = [
    [1_000_000, 'M'],
    [1_000, 'k'],
  ];
  for (const [size, suffix] of units) {
    if (value >= size) {
      const scaled = value / size;
      const text = scaled >= 10 ? Math.floor(scaled).toString() : (Math.floor(scaled * 10) / 10).toString();
      return `${text}${suffix}`;
    }
  }
  return String(value);
}
