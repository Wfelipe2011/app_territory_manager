'use client';

import clsx from 'clsx';
import { InferGetServerSidePropsType } from 'next';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { useRecoilValue } from 'recoil';

import { BlockCard, useTerritory } from '@/common/territory';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { authState } from '@/states/auth';
import { Body, Button, Header } from '@/ui';

export async function getServerSideProps(context) {
  console.log(`Executing getServerSideProps for ${context.req.url}`);
  const { query, req } = context;
  const territoryId = query.t;
  const { ['@territoryManager/token']: tokenCookies } = req.cookies

  const data = await fetch(`${URL_API}/territories/${territoryId}`, {
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

export default function Territory(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { query } = props

  const territoryIdQuery = query.t as string;
  const { territoryId: territoryIdState, overseer, roles, } = useRecoilValue(authState);
  const { territory, actions } = useTerritory(
    Number(territoryIdQuery || territoryIdState), props.data
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
            Olá {overseer && "Dirigente"},
          </h1>
          <p>Compartilhe as quadras digitais com os publicadores.</p>
          <hr className='my-2 h-0.5 w-1/2 bg-gray-700' />
          <h4 className='text-xl font-bold'>{territory.territoryName}</h4>
        </div>
      </Header>
      <Body>

        <div className='flex h-full w-full flex-col gap-4  my-8'>
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
