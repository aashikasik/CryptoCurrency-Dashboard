

const WATCHLIST_KEY = 'crypto_watchlist';

export function getWatchlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveWatchlist(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
}

export function toggleWatchlist(id: string) {
  const list = getWatchlist();
  const idx = list.indexOf(id);
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(id);
  }
  saveWatchlist(list);
  return list;
}

export function isWatched(id: string): boolean {
  return getWatchlist().includes(id);
}
