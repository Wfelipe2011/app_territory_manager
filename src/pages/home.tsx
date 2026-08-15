import Image from 'next/image';
import { useRouter as useNavigation } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { changeTheme } from '@/lib/changeTheme';
import { setTenantSignatureKey } from '@/lib/helper';
import { getSignatureHandshake, saveSignatureCookies } from '@/lib/signatureHandshake';

import logo from '@/assets/logo.png';
import { Mode, RootModeScreen } from '@/common/loading';
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
  const path = query['p'] as string;
  const signature = query['s'] as string;

  function setModeDebounce(signature: string) {
    setIsLoading('loading');
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
    setModeDebounce(signature);
    return () => clearTimeout(debounce);
  }, [signature]);

  const saveSignature = async (signatureId: string) => {
    setIsLoading('loading');
    const handshake = await getSignatureHandshake(signatureId);
    if (handshake.status > 299 || !handshake.data) {
      setValues({ ...values, notFoundStatusCode: handshake.status });
      setIsLoading('not-found');
      return;
    }

    const { token, mode, decoded } = handshake.data;
    const isSala = path.startsWith('sala');
    if (isSala) {
      setTenantSignatureKey(signatureId);
    }
    saveSignatureCookies(signatureId, handshake.data, { preserveTerritoryContext: isSala });

    _setAuthState({
      token,
      territoryId: decoded.territoryId ?? 0,
      expirationTime: decoded.exp ?? 0,
      signatureId,
      roles: decoded.roles as any,
      ...(decoded.overseer ? { overseer: decoded.overseer } : {}),
      ...(decoded.blockId ? { blockId: decoded.blockId } : {}),
      ...(mode ? { mode } : {}),
    });

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

          <Button.Root
            disabled={!signature}
            type='button'
            variant='primary'
            className='flex h-12 w-full !flex-row text-gray-50'
            onClick={() => void saveSignature(signature)}
          >
            Entrar
          </Button.Root>
        </div>
      </div>
    </RootModeScreen>
  );
}
