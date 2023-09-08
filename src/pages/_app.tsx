import { AppProps } from 'next/app';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { destroyCookie, setCookie } from 'nookies';
import { useEffect, useState } from 'react';
import { RecoilRoot } from 'recoil';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import '@/styles/globals.css';
import '@/styles/colors.css';
import '@/styles/spiral.css';

import { openToken } from '@/lib/openToken';

import { Mode, RootModeScreen } from '@/common/loading';
import { env } from '@/constant';
import { TerritoryGateway } from '@/infra/Gateway/TerritoryGateway';
import NotFound from '@/pages/not-found';
import { authState } from '@/states/auth';

export default function App({ Component, pageProps, ...rest }: AppProps) {
  return (
    <RecoilRoot>
      <ValidatorCookies>
        <Provider>
          <Component {...pageProps} {...rest} />
        </Provider>
      </ValidatorCookies>
    </RecoilRoot>
  );
}

const ValidatorCookies = ({ children }) => {
  const _setAuthState = useSetRecoilState(authState);
  const [render, setRender] = useState(false);
  useEffect(() => {
    const keysCookie = Object.keys(env.storage);
    keysCookie.forEach((key) => {
      destroyCookie(null, env.storage[key]);
    });
    _setAuthState({
      token: '',
      overseer: '',
      territoryId: 0,
      blockId: 0,
      expirationTime: 0,
      signatureId: '',
      mode: '',
      roles: [],
    });
    setRender(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!render) {
    return <NotFound />;
  }

  return <>{children}</>;
};

const Provider = ({ children }) => {
  const { query } = useRouter();
  const _setAuthState = useSetRecoilState(authState);

  const { token } = useRecoilValue(authState);
  const [isLoading, setIsLoading] = useState<Mode>('loading');
  const router = useNavigate();
  const signature = query.s;

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '' || path === '/login') return setIsLoading('screen');
    if (signature) {
      void saveSignature(signature as string);
      return;
    } else {
      setIsLoading('screen');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router, signature]);

  const saveSignature = async (signatureId: string) => {
    const { data, status } = await TerritoryGateway.in().getSignature(signatureId);
    if (status > 299) {
      setIsLoading('not-found');
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
    setCookie(null, env.storage.territoryId, territoryId?.toString(), configCookie);
    setCookie(null, env.storage.overseer, overseer || '', configCookie);
    setCookie(null, env.storage.blockId, blockId?.toString() || '', configCookie);
    setCookie(null, env.storage.expirationTime, exp?.toString(), configCookie);
    setCookie(null, env.storage.signatureId, signatureId, configCookie);
    setCookie(null, env.storage.mode, mode, configCookie);
    setCookie(null, env.storage.roles, roles.join(','), configCookie);
    setIsLoading('screen');
  };

  return <RootModeScreen mode={isLoading}>{children}</RootModeScreen>;
};
