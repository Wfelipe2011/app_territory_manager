import jwt_decode from 'jwt-decode';
import { AppProps } from 'next/app';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { setCookie } from 'nookies';
import { StrictMode } from 'react';
import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import '@/styles/globals.css';
// !STARTERCONF This is for demo purposes, remove @/styles/colors.css import immediately
import '@/styles/colors.css';

import { env } from '@/constant';
import { TerritoryGateway } from '@/infra/Gateway/TerritoryGateway';
import { authState } from '@/states/auth';
import { notify } from '@/utils/alert';

export default function App({ Component, pageProps, ...rest }: AppProps) {
  return (
    <StrictMode>
      <RecoilRoot>
        <Provider>
          <Component {...pageProps} {...rest} />
        </Provider>
      </RecoilRoot>
    </StrictMode>
  );
}

const Provider = ({ children }) => {
  const { token } = useRecoilValue(authState);
  const _setAuthState = useSetRecoilState(authState);
  const router = useNavigate();
  const { query } = useRouter();
  const signature = query.s;

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '' || path === '/login') return;
    if (!token) {
      if (signature) {
        void saveSignature(signature as string);
        return;
      }
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router, signature]);

  const saveSignature = async (signatureId: string | undefined) => {
    if (!signatureId) {
      logout();
      return;
    }
    const { data, status } = await TerritoryGateway.in().getSignature(
      signatureId
    );
    if (status > 299) {
      alert('Erro ao buscar assinatura');
      // logout();
      return;
    }
    const { token, mode } = data;
    const { overseer, territoryId, blockId, exp, roles } = openToken(token);
    _setAuthState({
      token,
      overseer,
      territoryId,
      blockId,
      expirationTime: exp,
      signatureId,
      mode,
      roles,
    });
    const configCookie = {
      maxAge: 30 * 24 * 60 * 60,
    };
    setCookie(null, env.storage.token, token, configCookie);
    setCookie(
      null,
      env.storage.territoryId,
      territoryId?.toString(),
      configCookie
    );
    setCookie(null, env.storage.overseer, overseer || '', configCookie);
    setCookie(
      null,
      env.storage.blockId,
      blockId?.toString() || '',
      configCookie
    );
    setCookie(null, env.storage.expirationTime, exp?.toString(), configCookie);
    setCookie(null, env.storage.signatureId, signatureId, configCookie);
    setCookie(null, env.storage.mode, mode, configCookie);
    setCookie(null, env.storage.roles, roles.join(','), configCookie);
  };

  const logout = () => {
    notify({
      title: 'Aceeso negado',
      message: 'Você não tem permissão para acessar essa página, faça login',
    });
    router.push('/');
  };

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

  return <>{children}</>;
};
