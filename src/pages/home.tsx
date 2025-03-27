import Image from 'next/image';
import { useRouter as useNavigation } from 'next/navigation';
import { useRouter } from 'next/router';
import { setCookie } from 'nookies';
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { changeTheme } from '@/lib/changeTheme';
import { openToken } from '@/lib/openToken';

import logo from '@/assets/logo.png';
import { Mode, RootModeScreen } from '@/common/loading';
import { env } from '@/constant';
import { TerritoryGateway } from '@/infra/Gateway/TerritoryGateway';
import { authState } from '@/states/auth';
import { Button } from '@/ui';

let debounce: NodeJS.Timeout;

export default function Home() {
  const { query } = useRouter();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<Mode>('loading');
  const _setAuthState = useSetRecoilState(authState);
  const [values, setValues] = useRecoilState(authState);
  const path = query.p as string;

  function setModeDebounce(signature) {
    setIsLoading('loading')
    clearTimeout(debounce);
    if (signature) {
      TerritoryGateway.in()
        .getSignature(signature)
        .then(({ data }) => {
          changeTheme(data.roundInfo);
          debounce = setTimeout(() => setIsLoading('screen'), 100);
        });
    } else {
      debounce = setTimeout(() => setIsLoading('screen'), 100);
    }
  }

  useEffect(() => {
    setModeDebounce(query.s);
    return () => clearTimeout(debounce);
  }, [query.s]);

  const saveSignature = async (signatureId: string) => {
    setIsLoading('loading');
    const { data, status } = await TerritoryGateway.in().getSignature(signatureId);
    if (status > 299) {
      setValues({ ...values, notFoundStatusCode: status });
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

    navigation.push(path);
  };

  return (
    <RootModeScreen mode={isLoading}>
      <div className='flex h-screen flex-col items-center justify-center bg-secondary p-4 pb-12'>
        <div className='mini:p-6 flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-gray-50 p-4 pb-8 shadow-xl'>
          <div className='bg-primary max-w-[250px] overflow-hidden rounded-full'>
            <Image src={logo} alt='Logo Território Digital' className='w-[200px] scale-125 p-3' />
          </div>

          <div className='my-4'>
            <p className='text-center text-lg text-gray-800'>Bem-vindo ao Território Digital</p>
            <p className='text-md text-center text-gray-800'>Clique no botão abaixo para acessar a área o território designado.</p>
          </div>

          <Button.Root disabled={Boolean(!query.s)} type='button' variant='primary' className='flex h-12 w-full !flex-row text-gray-50' onClick={() => void saveSignature(query.s as string)}>
            Entrar
          </Button.Root>
        </div>
      </div>
    </RootModeScreen>
  );
}
