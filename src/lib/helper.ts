import { v4 as uuid } from 'uuid';

export function getOrCreateSessionUserId(key: string): string {
  if (typeof window === 'undefined') return uuid();
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const newId = uuid();
  window.sessionStorage.setItem(key, newId);
  return newId;
}
