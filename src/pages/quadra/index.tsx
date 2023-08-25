import clsx from 'clsx';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { useRecoilValue } from 'recoil';

import { Street, useBlock } from '@/common/block';
import { authState } from '@/states/auth';
import { Body, Button, Header } from '@/ui';

export default function Block() {
  const { query } = useRouter();
  const {
    blockId: blockIdState,
    territoryId: territoryIdState,
    roles,
  } = useRecoilValue(authState);
  const { b: blockIdQuery, t: territoryIdQuery } = {
    b: query.b,
    t: query.t,
  };
  const { block, actions } = useBlock(
    Number(blockIdQuery || blockIdState),
    Number(territoryIdQuery || territoryIdState)
  );
  const navigate = useNavigate();

  const back = () => navigate.back();

  return (
    <div className={clsx('relative')}>
      <Header>
        <div>
          <h1 className='flex items-center text-xl font-semibold'>
            <Button.Root
              className={clsx('left-2 !w-fit !p-2 !shadow-none', {
                hidden: !roles?.includes('admin'),
              })}
              variant='ghost'
              onClick={back}
            >
              <ArrowLeft />
            </Button.Root>
            Olá Publicador(a),
          </h1>
          <p>Preencha as casas da quadra onde voce falou!</p>
          <hr className='my-2 h-0.5 w-1/2 bg-gray-700' />
          <h4 className='text-2xl font-bold'>{block.territoryName}</h4>
          <h5 className='text-2xl font-bold'>{block.blockName}</h5>
        </div>
      </Header>
      <Body>
        <div className='h-6 w-full'></div>
        <div className='flex flex-col gap-2'>
          {block.addresses?.map((address) => {
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
  );
}
