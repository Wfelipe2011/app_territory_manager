import clsx from 'clsx';

import { RootModeScreen } from '@/common/loading';
import {
  HeaderHome,
  TerritoryCard,
  useTerritories,
} from '@/common/territories';
import { Body } from '@/ui';

export default function Territorios() {
  const { search, territoryCards, isLoading, handleChangeSearch, actions, submitSearch } = useTerritories();

  return (
    <RootModeScreen mode={isLoading}>

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
    </RootModeScreen>
  );
}
