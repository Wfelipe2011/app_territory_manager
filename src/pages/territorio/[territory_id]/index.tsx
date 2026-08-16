/* eslint-disable @next/next/no-img-element */
'use client';

import clsx from 'clsx';
import { driver } from 'driver.js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { HelpCircle, Users } from 'react-feather';

import "driver.js/dist/driver.css";

import { changeTheme } from '@/lib/changeTheme';

import { RootModeScreen } from '@/common/loading';
import { BlockCard, useTerritory } from '@/common/territory';
import { DialogMap } from '@/common/territory/components/DialogMap';
import { useWaitingRoomRoom } from '@/common/waitingRoom/useWaitingRoomRoom';
import { Body, Header, SubHeader } from '@/ui';

export default function Territory() {
  const { query } = useRouter()
  const { territory_id: territoryId, round } = query as { territory_id: string, round: string };
  const { territory, getTerritories, actions, isLoading } = useTerritory(territoryId, round);
  const router = useRouter();
  const { active, publishers, assignments, assign, removeAssignment } = useWaitingRoomRoom({
    onConnected: () => void getTerritories(territoryId, round),
    onPresenceChanged: () => void getTerritories(territoryId, round),
    onAssignmentsChanged: () => void getTerritories(territoryId, round),
    onBlockUpdated: () => void getTerritories(territoryId, round),
  });

  useEffect(() => {
    if (!territory?.territoryId) return;
    const interval = setInterval(() => {
      getTerritories(territoryId, round);
    }, 1000 * 30);
    return () => {
      clearInterval(interval);
    };
  }, [getTerritories, round, territory?.territoryId, territoryId]);

  const reload = () => {
    getTerritories(territoryId, round);
  }

  const driverAction = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { element: '#overseer-image', popover: { title: 'Imagem', description: 'Aqui você encontra a imagem do território.' } },
        { element: '#overseer-chart', popover: { title: 'Gráfico', description: 'Acompanhe no gráfico os detalhes deste território, incluindo a porcentagem de conclusão.' } },
        { element: '#overseer-sugestion', popover: { title: 'Sugestão', description: 'Aqui você encontra uma sugestão de quantos pares podem ser colocados nesta quadra.' } },
        { element: '#overseer-share', popover: { title: 'Compartilhar', description: 'Aqui você encontra o link para compartilhar este território com os publicadores.' } },
        { element: '#overseer-connections', popover: { title: 'Atribuir publicadores', description: 'Aqui você atribui os publicadores da sala de espera para trabalharem nesta quadra.' } },
        { element: '#overseer-time', popover: { title: 'Expiração', description: 'Acompanhe em tempo real o tempo de expiração do link de compartilhamento.' } },
      ],
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
    });
    driverObj.drive()
  }

  useEffect(() => {
    changeTheme();
  }, []);

  return (
    <RootModeScreen mode={isLoading}>
      <HelpCircle
        onClick={driverAction}
        size={50}
        fill='current'
        role='img'
        aria-label='Ajuda'
        className='fixed bottom-0 right-0 z-10 m-4 mb-safe-bottom cursor-pointer fill-primary text-gray-50'
      />
      <div className={clsx('relative')}>
        <Header
          title='Olá Dirigente,'
          subtitle='Gerencie as quadras deste território.'
          onBack={() => router.push('/sala')}
          backLabel='Voltar para a sala'
          action={
            territory.imageUrl && (
              <DialogMap
                inline
                title={territory.territoryName}
              >
                <img
                  className="h-full w-full object-cover object-center"
                  src={territory.imageUrl}
                  alt="Imagem do Território"
                />
              </DialogMap>
            )
          }
        />

        <SubHeader
          title={territory.territoryName}
          action={
            active && (
              <span className='flex items-center gap-1 text-sm text-gray-600'>
                <Users size={14} className='text-primary' />
                {publishers.length} publicador{publishers.length === 1 ? '' : 'es'} na sala
              </span>
            )
          }
        />
        <Body>
          <div className='flex h-full w-full flex-col gap-4 p-4 pb-24'>
            {territory.blocks?.map((block) => (
              <BlockCard key={block.id} block={block} actions={actions} territoryId={territory.territoryId} round={round} reload={reload} room={{ active, publishers, assignments, onAssign: assign, onRemove: removeAssignment }} />
            ))}
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}

