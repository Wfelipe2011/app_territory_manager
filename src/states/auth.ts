import { parseCookies } from 'nookies';
import { atom } from 'recoil';

import { env } from '@/constant';

type AuthState = {
  token: string;
  overseer?: string;
  territoryId: number;
  blockId?: number;
  expirationTime: number;
  signatureId?: string;
  mode?: string;
  roles?: Partial<Roles>[];
  notFoundStatusCode?: number;
};

type Roles = 'admin' | 'publisher' | 'overseer';

const { token, blockId, expirationTime, mode, overseer, roles, signatureId, territoryId } = env.storage;

const {
  [token]: tokenCookies,
  [blockId]: blockIdCookies,
  [expirationTime]: expirationTimeCookies,
  [mode]: modeCookies,
  [overseer]: overseerCookies,
  [roles]: rolesCookies,
  [signatureId]: signatureIdCookies,
  [territoryId]: territoryIdCookies,
} = parseCookies();

export const authState = atom<AuthState>({
  key: 'authState',
  default: {
    token: tokenCookies || '',
    overseer: overseerCookies || '',
    territoryId: Number(territoryIdCookies) || 0,
    blockId: Number(blockIdCookies) || 0,
    expirationTime: Number(expirationTimeCookies) || 0,
    signatureId: signatureIdCookies || '',
    mode: modeCookies || '',
    roles: (() => {
      const storage = rolesCookies || ('' as string);
      if (!storage) return [];
      const roles: Partial<Roles>[] = storage?.includes(',') ? (storage.split(',') as any) : [storage];
      return roles;
    })(),
  },
});
