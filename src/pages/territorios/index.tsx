import clsx from 'clsx';

import { HeaderHome, TerritoryCard } from '@/common/territory/components';
import { useTerritory } from '@/common/territory/useHome';
import { Body } from '@/ui';

export default function Territorios() {
  const { search, territoryCards, handleChangeSearch, actions, submitSearch } =
    useTerritory();

  return (
    <div className={clsx('relative')}>
      <HeaderHome
        search={search}
        handleChangeSearch={handleChangeSearch}
        submitSearch={submitSearch}
      />
      <Body>
        <div className='flex h-full w-full flex-col gap-4'>
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
