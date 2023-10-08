'use client';

import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { RootModeScreen } from '@/common/loading';
import { BlockCard, useTerritory } from '@/common/territory';
import { Body, Header } from '@/ui';

export default function Territory() {
  const { query } = useRouter()

  const territoryId = Number(query?.territory_id || 0)
  const { territory, getTerritories, actions, isLoading } = useTerritory(territoryId);

  useEffect(() => {
    if (territory) {
      const interval = setInterval(() => {
        getTerritories(territoryId);
      }, 1000 * 30);
      return () => {
        clearInterval(interval);
      };
    }
  }, [query]);

  return (
    <RootModeScreen mode={isLoading}>
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
              <BlockCard key={block.id} block={block} index={index} actions={actions} territoryId={territory.territoryId} />
            ))}
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}
