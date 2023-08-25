'use client';

import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import ClientOnly from '@/common/cliente-only';
import { BlockCard, HeaderTerritory, useTerritory } from '@/common/territory';
import { authState } from '@/states/auth';
import { Body } from '@/ui';

export default function Territory() {
  const { query } = useRouter();
  const territoryIdQuery = query.t as string;
  const { territoryId: territoryIdState, overseer } = useRecoilValue(authState);
  const { territory, actions } = useTerritory(
    Number(territoryIdQuery || territoryIdState)
  );

  return (
    <div className={clsx('relative')}>
      <ClientOnly>
        <HeaderTerritory>Olá {overseer}</HeaderTerritory>
      </ClientOnly>
      <Body>
        <h2 className='flex h-10 w-full flex-col items-center pb-8 pt-4 text-center text-2xl'>
          {territory.territoryName}
          <hr className='w-3/5' />
        </h2>
        <div className='flex h-full w-full flex-col gap-4'>
          {territory.blocks?.map((block, index) => (
            <BlockCard
              key={block.id}
              block={block}
              index={index}
              actions={actions}
              territoryId={territory.territoryId}
            />
          ))}
        </div>
      </Body>
    </div>
  );
}
