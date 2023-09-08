'use client';

import clsx from 'clsx';
import { parseCookies } from 'nookies';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { RootModeScreen } from '@/common/loading';
import { BlockCard, useTerritory } from '@/common/territory';
import { env } from '@/constant';
import { authState } from '@/states/auth';
import { Body, Header } from '@/ui';

export default function Territory() {
  const { territoryId } = env.storage;
  const { [territoryId]: territoryIdCookies } = parseCookies();
  const { territoryId: territoryIdState } = useRecoilValue(authState);
  const { territory, getTerritories, actions, isLoading } = useTerritory(Number(territoryIdState));

  useEffect(() => {
    const interval = setInterval(() => {
      const territoryId = Number(territoryIdState) || Number(territoryIdCookies);
      getTerritories(territoryId);
    }, 1000 * 30);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <RootModeScreen mode={isLoading}>
      <div className={clsx('relative')}>
        <Header>
          {/* <Button.Root
            className={clsx('left-2 !w-fit !p-2 !shadow-none', {
              hidden: roles?.includes('admin' || 'overseer'),
            })}
            variant='ghost'
            onClick={back}
          >
            <ArrowLeft />
          </Button.Root> */}
          <div className='flex flex-col gap-2'>
            <h1 className='flex items-center text-xl font-semibold'>Olá Dirigente,</h1>
            <p className='flex items-center text-[20px] font-normal'>Gerencie aqui as quadras do território e compartilhe com os publicadores.</p>
          </div>
        </Header>
        <div className='mt-2 p-4 text-center text-2xl font-bold text-gray-600'>{territory.territoryName}</div>
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
