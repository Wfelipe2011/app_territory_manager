import { v4 as uuid } from 'uuid';

import { env } from '@/constant';

export type PublisherProfile = {
  identityKey: string;
  firstName: string;
  lastName: string;
  phoneLast4: string;
};

export function getOrCreateSessionUserId(key: string): string {
  if (typeof window === 'undefined') return uuid();
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const newId = uuid();
  window.sessionStorage.setItem(key, newId);
  return newId;
}

export function getOrCreatePublisherProfile(): PublisherProfile {
  if (typeof window === 'undefined') {
    return { identityKey: uuid(), firstName: '', lastName: '', phoneLast4: '' };
  }
  const existing = window.localStorage.getItem(env.storage.publisherProfile);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as Partial<PublisherProfile>;
      return {
        identityKey: parsed.identityKey || uuid(),
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        phoneLast4: parsed.phoneLast4 || '',
      };
    } catch {
      // perfil corrompido: cria um novo
    }
  }
  const profile: PublisherProfile = { identityKey: uuid(), firstName: '', lastName: '', phoneLast4: '' };
  window.localStorage.setItem(env.storage.publisherProfile, JSON.stringify(profile));
  return profile;
}

export function savePublisherProfile(profile: PublisherProfile): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(env.storage.publisherProfile, JSON.stringify(profile));
}

export function getTenantSignatureKey(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(env.storage.tenantSignatureKey) || '';
}

export function setTenantSignatureKey(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(env.storage.tenantSignatureKey, key);
}

export function getActiveGroupId(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(env.storage.activeGroupId) || '';
}

export function setActiveGroupId(groupId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(env.storage.activeGroupId, groupId);
}

export function getPublisherInitials(profile: PublisherProfile): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}
