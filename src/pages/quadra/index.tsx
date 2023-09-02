import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import { Street, useBlock } from '@/common/block';
import { RootModeScreen } from '@/common/loading';
import { authState } from '@/states/auth';
import { Body, Header } from '@/ui';

export default function Block() {
  const { query } = useRouter();
  const {
    blockId: blockIdState,
    territoryId: territoryIdState,
    roles,
  } = useRecoilValue(authState);
  const blockId = query.b;
  const territoryId = query.t;
  const { block, actions, isLoading } = useBlock(
    Number(blockId || blockIdState),
    Number(territoryId || territoryIdState),
  );

  return (
    <RootModeScreen mode={isLoading}>
      <div className={clsx('relative')}>
        <Header>
          <div>
            <h1 className='flex items-center text-xl font-semibold'>
              Olá Publicador(a),
            </h1>
            <p className='text-gray-700'>Preencha as casas da quadra onde voce falou!</p>
            <hr className='my-2 w-1/2 h-0.5 bg-gray-800' />
            <h4 className='text-xl font-semibold text-gray-700'>{block?.territoryName}</h4>
            <h5 className='text-xl font-semibold text-gray-700'>{block?.blockName}</h5>
          </div>
        </Header>
        <Body>
          <div className='h-6 w-full'></div>
          <div className='flex flex-col gap-2'>
            {block?.addresses?.map((address) => {
              const { addresses, ...blockWithoutAddress } = block;
              return (
                <Street
                  block={blockWithoutAddress}
                  key={address.id}
                  address={address}
                  actions={actions}
                />
              );
            })}
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}
