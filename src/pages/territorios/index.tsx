import clsx from 'clsx';
import { InferGetServerSidePropsType } from 'next';

import {
  HeaderHome,
  TerritoryCard,
  useTerritories,
} from '@/common/territories';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { Body } from '@/ui';

export async function getServerSideProps(context) {
  console.log(`Executing getServerSideProps for ${context.req.url}`);
  const { query, req } = context;
  const { ['@territoryManager/token']: tokenCookies } = req.cookies

  const data = await fetch(`${URL_API}/territories`, {
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

export default function Territorios(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { search, territoryCards, handleChangeSearch, actions, submitSearch } =
    useTerritories(props.data);

  return (
    <div className={clsx('relative')}>
      <HeaderHome
        search={search}
        handleChangeSearch={handleChangeSearch}
        submitSearch={submitSearch}
      />
      <Body>
        <div className='flex h-full w-full flex-col gap-4 my-8'>
          {territoryCards?.map((territoryCard, index) => (
            <TerritoryCard
              key={territoryCard.territoryId}
              territoryCard={territoryCard}
              index={index}
              actions={actions}
            />
          ))}
        </div>
      </Body>
    </div>
  );
}
