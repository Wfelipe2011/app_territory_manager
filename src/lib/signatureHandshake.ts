import { setCookie } from 'nookies';

import { openToken } from '@/lib/openToken';

import { env } from '@/constant';
import { TerritoryGateway } from '@/infra/Gateway/TerritoryGateway';

export type SignatureHandshakeData = {
  token: string;
  mode?: string;
  decoded: {
    overseer: string | undefined;
    territoryId: number | undefined;
    blockId: number | undefined;
    round: number | undefined;
    exp: number | undefined;
    roles: string[];
  };
};

export type SignatureHandshakeResult = { status: number; data?: undefined } | { status: number; data: SignatureHandshakeData };

const configCookie = { maxAge: 30 * 24 * 60 * 60 };

export async function getSignatureHandshake(signatureId: string): Promise<SignatureHandshakeResult> {
  const { data, status } = await TerritoryGateway.in().getSignature(signatureId);
  if (status > 299) return { status };
  const { token, mode } = data as { token: string; mode?: string };
  return {
    status,
    data: {
      token,
      decoded: openToken(token),
      ...(mode !== undefined ? { mode } : {}),
    },
  };
}

export function saveSignatureCookies(
  signatureId: string,
  handshake: SignatureHandshakeData,
  options: { preserveTerritoryContext?: boolean } = {}
): void {
  const { token, mode, decoded } = handshake;
  const preserve = options.preserveTerritoryContext ?? false;

  const setIfPresent = (name: string, value: string | number | undefined): void => {
    if (value === undefined || value === null || value === '') {
      // JWT de tenant não carrega contexto de território: mantém os cookies existentes do dirigente
      if (preserve) return;
      setCookie(null, name, '', configCookie);
      return;
    }
    setCookie(null, name, value.toString(), configCookie);
  };

  setCookie(null, env.storage.token, token, configCookie);
  setCookie(null, env.storage.signatureId, signatureId, configCookie);
  setIfPresent(env.storage.territoryId, decoded.territoryId);
  setIfPresent(env.storage.overseer, decoded.overseer);
  setIfPresent(env.storage.blockId, decoded.blockId);
  setIfPresent(env.storage.expirationTime, decoded.exp);
  setIfPresent(env.storage.round, decoded.round);
  setIfPresent(env.storage.mode, mode);
  setCookie(null, env.storage.roles, (decoded.roles ?? []).join(','), configCookie);
}
