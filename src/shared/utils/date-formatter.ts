const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** Compact relative time for feed rows: "now", "5m", "2h", "3d", "2w", then "Oct 3" / "Oct 3, 2024". */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 45) return 'now';
  if (seconds < HOUR) return `${Math.max(1, Math.round(seconds / MINUTE))}m`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h`;
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)}d`;
  if (seconds < 5 * WEEK) return `${Math.floor(seconds / WEEK)}w`;

  const date = new Date(then);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
