/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';
import { driver } from 'driver.js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ArrowLeft, HelpCircle, Share2 } from 'react-feather';
import toast from 'react-hot-toast';

import 'driver.js/dist/driver.css';

import { changeTheme } from '@/lib/changeTheme';
import { getActiveGroupId, getTenantSignatureKey } from '@/lib/helper';

import { IconContainer } from '@/components/Atoms/IconContainer';

import { Street, useBlock } from '@/common/block';
import { RootModeScreen } from '@/common/loading';
import { DialogMap } from '@/common/territory/components/DialogMap';
import { waitingRoomGateway } from '@/infra/Gateway/WaitingRoomGateway';
import { Body, Header } from '@/ui';

export default function Block() {
  const router = useRouter();
  const { query } = useRouter();
  const { block_id, round, territory_id } = query as { territory_id: string; block_id: string; round: string };

  const { block, actions, isLoading } = useBlock(block_id, territory_id, round);

  const shareFromWaitingRoom = async () => {
    const tenantKey = getTenantSignatureKey();
    const activeGroupId = getActiveGroupId();
    if (!tenantKey || !activeGroupId) {
      toast.error('Abra a sala de espera antes de compartilhar');
      return;
    }
    const { status, data } = await waitingRoomGateway.createBlockSignature(activeGroupId, block_id, tenantKey);
    if (status > 299) {
      toast.error('Não foi possível gerar o link de compartilhamento');
      return;
    }
    const key = data.key as string;
    const queryRound = new URLSearchParams({ round });
    const query = new URLSearchParams({ p: `territorio/${territory_id}/quadra/${block_id}?${queryRound.toString()}`, s: key });
    const url = `${window.location.origin}/home?${query.toString()}`;
    const message = {
      title: '*DESIGNAÇÃO DE TERRITÓRIO*\n\nPrezado(a) publicador(a)',
      text: `*DESIGNAÇÃO DE TERRITÓRIO*\n\nSegue o link para a *${block?.blockName}* que você está designado(a) para pregar:`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(message);
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência');
    } catch {
      toast.error('Não foi possível compartilhar');
    }
  };

  const driverAction = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { element: '#overseer-image', popover: { title: 'Imagem', description: 'Aqui você encontra a imagem do território.' } },
        {
          element: '#publisher-gps',
          popover: { title: 'GPS', description: 'Clique aqui para abrir o GPS e ser direcionado para a localização da quadra.' },
        },
        {
          element: '#publisher-details',
          popover: { title: 'Detalhes', description: 'Visualize os detalhes do endereço e marque as casas nesta seção.' },
        },
      ],
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
    });
    driverObj.drive();
  };

  useEffect(() => {
    changeTheme();
  }, []);

  return (
    <RootModeScreen mode={isLoading}>
      <HelpCircle
        onClick={driverAction}
        size={50}
        fill='current'
        className='text-gray-50 z-10 cursor-pointer fixed bottom-0 right-0 m-4 fill-primary'
      />
      <div className={clsx('relative')}>
        {block.imageUrl && (
          <DialogMap
            title={block.territoryName}
          >
            <img className='h-full w-full object-cover object-center' src={block.imageUrl} alt='Imagem do Território' />
          </DialogMap>
        )}
        <Header>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex w-full items-center gap-2'>
              <IconContainer
                icon={<ArrowLeft size={22} className='cursor-pointer text-primary' onClick={() => router.push('/sala')} />}
              />
              <div>
                <h1 className='flex items-center text-xl font-semibold'>Olá Publicador(a),</h1>
                <p className='text-gray-700'>Preencha as casas da quadra onde voce falou!</p>
              </div>
            </div>
            <hr className='my-2 w-1/2 h-0.5 bg-gray-800' />
            <div className='flex w-full items-center justify-between'>
              <div>
                <h4 className='text-xl font-semibold text-gray-700'>{block?.territoryName}</h4>
                <h5 className='text-xl font-semibold text-gray-700'>{block?.blockName}</h5>
              </div>
              <IconContainer
                icon={<Share2 size={22} className='cursor-pointer text-gray-700' onClick={() => void shareFromWaitingRoom()} />}
              />
            </div>
          </div>
        </Header>
        <Body>
          <div className='h-6 w-full'></div>
          <div className='flex flex-col gap-2 pb-20'>
            {block?.addresses?.map((address) => (
              <Street key={address.id} address={address} actions={actions} />
            ))}
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}
