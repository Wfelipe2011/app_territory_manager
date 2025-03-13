'use client';

import jwt_decode from 'jwt-decode';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { setCookie } from 'nookies';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { Mode, RootModeScreen } from '@/common/loading';
import { env } from '@/constant';
import { authState } from '@/states/auth';

export default function HomePage() {
  const _setAuthState = useSetRecoilState(authState);
  const [isLoading, setIsLoading] = useState<Mode>('loading');
  const router = useRouter();

  const authenticate = useCallback(async (token: string): Promise<void> => {
    setIsLoading('loading')

    const { overseer, territoryId, blockId, exp, roles } = openToken(token);
    _setAuthState({
      token: token,
      overseer,
      territoryId,
      blockId,
      expirationTime: exp,
      signatureId: '',
      mode: 'default',
      roles,
    });
    const configCookie = {
      maxAge: 60 * 60 * 24 * 30,
    };
    setCookie(undefined, env.storage.token, token, configCookie);
    setCookie(undefined, env.storage.mode, 'default', configCookie);
    setCookie(undefined, env.storage.territoryId, String(territoryId), configCookie);
    setCookie(undefined, env.storage.blockId, String(blockId), configCookie);
    setCookie(undefined, env.storage.overseer, String(overseer), configCookie);
    const rolesToSave = roles?.join(',');
    setCookie(undefined, env.storage.roles, JSON.stringify(rolesToSave), configCookie);
    setCookie(undefined, env.storage.expirationTime, String(exp), configCookie);
    router.push('/territorios');
    setIsLoading('screen');
  }, [_setAuthState, router])

  const openToken = (token: string) => {
    const tokenDecoded = jwt_decode<{
      overseer?: string;
      territoryId: number;
      blockId?: number;
      exp: number;
      roles: string[];
    }>(token);
    return {
      overseer: tokenDecoded?.overseer,
      territoryId: tokenDecoded?.territoryId,
      blockId: tokenDecoded?.blockId,
      exp: tokenDecoded?.exp,
      roles: tokenDecoded?.roles as any,
    };
  };

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const token = search.get('token');
    if (token) {
      authenticate(token)
    } else {
      const redirect = window.location.href;
      window.location.href = `https://web-territory-manager.vercel.app?redirect=${redirect}`;
    }
  }, [authenticate])

  return (
    <main>
      <Head>
        <title>Territory Manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RootModeScreen mode={isLoading}>
        <></>
      </RootModeScreen>
    </main>
  );
}
