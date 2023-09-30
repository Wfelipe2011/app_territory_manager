/* eslint-disable @typescript-eslint/no-misused-promises */
import clsx from 'clsx';

import { Actions } from '@/common/territories/components/Actions';
import { HeaderButtons } from '@/common/territories/components/HeaderButtons';
import { Input, InputSelect } from '@/ui';
import { DoughnutChart } from '@/ui/doughnutChart';

import { IActions, ITerritoryCard } from '../type';

interface TerritoryCardProps {
  territoryCard: ITerritoryCard;
  index: number;
  actions: IActions;
}

export function TerritoryCard({ territoryCard, index, actions }: TerritoryCardProps) {
  const getDate = () => {
    const date = territoryCard.signature.expirationDate?.includes('T')
      ? territoryCard.signature.expirationDate.split('T')[0]
      : territoryCard.signature.expirationDate;
    return date ?? undefined;
  }

  return (
    <div
      className={clsx(
        { 'rounded-tl-none border-t-0 bg-transparent': index === 0 },
        '-ml-2 min-h-[260px] w-[calc(100%+12px)] rounded-b-[40px] rounded-l-[40px] rounded-t-[40px] rounded-br-none rounded-tr-none border p-2 px-8 pb-6 shadow-lg',
        'flex flex-col'
      )}
    >
      <div className='flex h-full w-full items-center justify-between'>
        <h6 className='ml-2 block text-xl font-medium'>{territoryCard.name}</h6>
        <HeaderButtons actions={actions} territoryCard={territoryCard} />
      </div>
      <div className='flex h-4/5 w-full gap-[10%]'>
        <div className='flex w-[45%] flex-col items-center justify-start gap-4 text-lg'>
          {territoryCard.positiveCompleted || territoryCard.negativeCompleted ? (
            <>
              <div className='flex h-[200px] w-full max-w-[170px] flex-col'>
                <DoughnutChart values={[territoryCard.positiveCompleted, territoryCard.negativeCompleted]} />
              </div>
              <div className='flex h-4 w-full items-center justify-between gap-2 text-xs'>
                <div className='flex w-full flex-col items-center gap-1'>
                  <div className='bg-primary h-3 w-1/2'></div>Concluído
                </div>
                <div className='flex w-full flex-col items-center gap-1'>
                  <div className='bg-secondary h-3 w-1/2'></div>À fazer
                </div>
              </div>
            </>
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <p className='text-xs text-gray-400'>Sem dados</p>
            </div>
          )}
        </div>

        <div className='flex flex-col justify-center gap-2 p-2'>
          <Input
            name='overseer'
            label=''
            placeholder='Dirigente'
            value={territoryCard?.overseer || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => actions.updateData(e, territoryCard.territoryId)}
          />
          <Input
            name='expirationTime'
            label=''
            placeholder='Prazo'
            type='date'
            value={getDate()}
            className={clsx({
              'bg-secondary': !territoryCard.signature.expirationDate,
            })}
            onChange={(e) => actions.updateDateTime(e, territoryCard.territoryId)}
          />
          <Actions territoryCard={territoryCard} actions={actions} />
        </div>
      </div>
    </div>
  );
}
