import { v4 as uuid } from 'uuid';

export function getFromLocalStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }
  return null;
}

export function getFromSessionStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return window.sessionStorage.getItem(key);
  }
  return null;
}

export function getOrCreateSessionUserId(key: string): string {
  if (typeof window === 'undefined') return uuid();
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const newId = uuid();
  window.sessionStorage.setItem(key, newId);
  return newId;
}
