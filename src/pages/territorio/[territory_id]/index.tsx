'use client';

import clsx from 'clsx';
import { driver } from 'driver.js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { HelpCircle } from 'react-feather';

import "driver.js/dist/driver.css";

import { RootModeScreen } from '@/common/loading';
import { BlockCard, useTerritory } from '@/common/territory';
import { Body, Header } from '@/ui';

const driverObj = driver({
  showProgress: true,
  steps: [
    { element: '#overseer-chart', popover: { title: 'Gráfico', description: 'Acompanhe no gráfico os detalhes deste território, incluindo a porcentagem de conclusão.' } },
    { element: '#overseer-share', popover: { title: 'Compartilhar', description: 'Compartilhe este território com outros publicadores.' } },
    { element: '#overseer-connections', popover: { title: 'Conexões', description: 'Acompanhe em tempo real quantos publicadores estão trabalhando nesta quadra.' } },
  ],
  nextBtnText: 'Próximo',
  prevBtnText: 'Anterior',
  doneBtnText: 'Finalizar',
  progressText: '{{current}} de {{total}}',
});

export default function Territory() {
  const { query } = useRouter()
  const { territory_id: territoryId, round } = query as { territory_id: string, round: string };
  const { territory, getTerritories, actions, isLoading } = useTerritory(territoryId, round);

  useEffect(() => {
    if (territory) {
      const interval = setInterval(() => {
        getTerritories(territoryId, round);
      }, 1000 * 30);
      return () => {
        clearInterval(interval);
      };
    }
  }, [getTerritories, query, round, territory, territoryId]);

  return (
    <RootModeScreen mode={isLoading}>
      <HelpCircle onClick={() => driverObj.drive()} size={50} fill="rgb(121 173 87 / 1)" className='text-gray-50 z-10 cursor-pointer fixed bottom-0 right-0 m-4' />
      <div className={clsx('relative')}>
        <Header>
          <div className='flex flex-col gap-2'>
            <h1 className='flex items-center text-xl font-semibold'>Olá Dirigente,</h1>
            <p className='flex items-center text-[20px] font-normal'>Gerencie aqui as quadras do território e compartilhe com os publicadores.</p>
          </div>
        </Header>

        <div className='mt-2 p-4 text-center text-2xl font-bold text-gray-600' >{territory.territoryName}</div>
        <Body>
          <div className='flex h-full w-full flex-col  gap-4'>
            {territory.blocks?.map((block, index) => (
              <BlockCard key={block.id} block={block} index={index} actions={actions} territoryId={territory.territoryId} round={round} />
            ))}
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}
