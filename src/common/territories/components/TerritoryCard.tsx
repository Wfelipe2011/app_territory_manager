/* eslint-disable @typescript-eslint/no-misused-promises */
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

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

export function TerritoryCard({
  territoryCard,
  index,
  actions,
}: TerritoryCardProps) {
  const router = useRouter();

  const redirect = () => {
    const query = new URLSearchParams();
    query.set('t', String(territoryCard.territoryId));
    router.push(`/territorio?${query.toString()}`);
  };

  return (
    <div
      className={clsx(
        { 'rounded-tl-none border-t-0 bg-transparent': index === 0 },
        '-ml-2 min-h-[220px] w-[calc(100%+12px)] rounded-b-[40px] rounded-l-[40px] rounded-t-[40px] rounded-br-none rounded-tr-none border p-2 pb-6 px-8 shadow-lg',
        'flex flex-col'
      )}
    >
      <div className='flex h-1/5 w-full items-center justify-between h-fit text-lg'>
        <h6 onClick={redirect}>{territoryCard.name}</h6>
        <HeaderButtons actions={actions} territoryCard={territoryCard} />
      </div>
      <div className='flex h-4/5 w-full gap-[10%]'>
        <div className='flex w-[45%] flex-col items-center justify-start gap-4 text-lg'>
          {territoryCard.positiveCompleted ||
            territoryCard.negativeCompleted ? (
            <>
              <div
                className={clsx(
                  {
                    'h-[calc(100%-20px)]': territoryCard?.name,
                    hidden: !territoryCard?.name,
                  },
                  'flex w-full justify-start pl-2'
                )}
              >
                <DoughnutChart
                  values={[
                    territoryCard.positiveCompleted,
                    territoryCard.negativeCompleted,
                  ]}
                />
              </div>
              <div className='flex h-4 w-full items-center justify-start gap-16 text-xs'>
                <div className='flex w-fit flex-col items-center gap-1'>
                  <div className='bg-primary h-3 w-6'></div>À fazer
                </div>
                <div className='flex w-fit flex-col items-center gap-1'>
                  <div className='bg-secondary h-3 w-6'></div>
                  Concluído
                </div>
              </div>
            </>
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <p className='text-xs text-gray-400'>Sem dados</p>
            </div>
          )}
        </div>

        <div className='flex justify-center flex-col gap-2 p-2'>
          <Input
            name='overseer'
            label=''
            placeholder='Dirigente'
            value={territoryCard.overseer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              actions.updateData(e, territoryCard.territoryId)
            }
          />
          <Input
            name='expirationTime'
            label=''
            placeholder='Prazo'
            type='date'
            value={
              territoryCard.signature.expirationDate?.includes('T')
                ? territoryCard.signature.expirationDate.split('T')[0]
                : territoryCard.signature.expirationDate
            }
            className={clsx({
              'bg-secondary': !territoryCard.signature.expirationDate,
            })}
            onChange={(e) =>
              actions.updateDateTime(e, territoryCard.territoryId)
            }
          />
          <Actions territoryCard={territoryCard} actions={actions} />
        </div>
      </div>
    </div>
  );
}



