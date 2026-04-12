// utils/index.js

/** Format a number as USD currency string. */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Format a date string or Date object to readable form. */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Get 1-2 uppercase initials from a name. */
export function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || '?';
}

// Deterministic colour based on member index
const AVATAR_COLORS = [
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAECE7', color: '#712B13' },
  { bg: '#EAF3DE', color: '#27500A' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E6F1FB', color: '#0C447C' },
  { bg: '#FCEBEB', color: '#791F1F' },
  { bg: '#FBEAF0', color: '#72243E' },
];

export function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

/** Store/retrieve the last-used tripId from localStorage so users can return. */
export function saveRecentTrip(tripId) {
  try { localStorage.setItem('splittrip_recent', tripId); } catch {}
}
export function getRecentTrip() {
  try { return localStorage.getItem('splittrip_recent'); } catch { return null; }
}
