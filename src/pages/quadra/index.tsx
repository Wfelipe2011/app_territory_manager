import clsx from 'clsx';
import { InferGetServerSidePropsType } from 'next';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { useRecoilValue } from 'recoil';

import { Street, useBlock } from '@/common/block';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { authState } from '@/states/auth';
import { Body, Button, Header } from '@/ui';

export async function getServerSideProps(context) {
  console.log(`Executing getServerSideProps for ${context.req.url}`);
  const { query, req } = context;
  const blockId = query.b;
  const territoryId = query.t;
  const { ['@territoryManager/token']: tokenCookies } = req.cookies

  const data = await fetch(`${URL_API}/territories/${territoryId}/blocks/${blockId}`, {
    headers: {
      Authorization: `Bearer ${tokenCookies}`,
    },
  });
  const body = await data.json();
  return {
    props: {
      data: body,
      query
    }
  }
}

export default function Block(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { query, data } = props;
  const {
    blockId: blockIdState,
    territoryId: territoryIdState,
    roles,
  } = useRecoilValue(authState);
  const blockId = query.b;
  const territoryId = query.t;
  const { block, actions } = useBlock(
    Number(blockId || blockIdState),
    Number(territoryId || territoryIdState),
    data,
  );
  const navigate = useNavigate();

  const back = () => navigate.back();

  return (
    <div className={clsx('relative')}>
      <Header>
        <Button.Root
          className={clsx('left-2 !w-fit !p-2 !shadow-none', {
            hidden: roles?.includes('admin' || 'overseer'),
          })}
          variant='ghost'
          onClick={back}
        >
          <ArrowLeft />
        </Button.Root>
        <div>
          <h1 className='flex items-center text-xl font-semibold'>
            Olá Publicador(a),
          </h1>
          <p>Preencha as casas da quadra onde voce falou!</p>
          <hr className='my-2 h-0.5 w-1/2 bg-gray-700' />
          <h4 className='text-xl font-bold'>{block.territoryName}</h4>
          <h5 className='text-xl font-bold'>{block.blockName}</h5>
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
