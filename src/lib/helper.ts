export function getFromLocalStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }
  return null;
}

export function getFromSessionStorage(): string | null {
  // if (typeof sessionStorage !== 'undefined') {
  //   return sessionStorage.getItem(key);
  // }
  return null;
}
