/* eslint-disable @typescript-eslint/no-misused-promises */
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';
import { Share2 } from 'react-feather';

import { Button } from '@/ui';
import { DoughnutChart } from '@/ui/doughnutChart';

import { IActions, IBlock } from '../type';

interface BlockCardProps {
  block: IBlock;
  index: number;
  actions: IActions;
  territoryId: number;
}

export function BlockCard({
  index,
  actions,
  block,
  territoryId,
}: BlockCardProps) {
  const router = useRouter();
  const ALL_HOUSES = block.negativeCompleted + block.positiveCompleted;
  const AVAILABLE_HOUSES = block.negativeCompleted;

  const redirect = () => {
    const query = new URLSearchParams();
    query.set('b', String(block.id));
    query.set('t', String(territoryId));
    router.push(`/quadra?${query.toString()}`);
  };

  return (
    <div
      className={clsx(
        { 'rounded-tl-none border-t-0 bg-transparent': index === 0 },
        '-ml-2 min-h-[200px] w-[calc(100%+12px)] rounded-b-[40px] rounded-l-[40px] rounded-t-[40px] rounded-br-none rounded-tr-none border p-2 px-8 pb-6 shadow-lg',
        'flex flex-col'
      )}
    >
      <h6 className='h-fit text-lg' onClick={redirect}>
        {block.name}
      </h6>
      <div className='flex h-4/5 w-full gap-[10%]'>
        <div className='flex w-[45%] flex-col items-center justify-start gap-4 text-lg'>
          <div
            className={clsx(
              {
                'h-[calc(100%-20px)]': block?.name,
                hidden: !block?.name,
              },
              'flex w-full justify-start pl-2'
            )}
          >
            <DoughnutChart
              values={[block.positiveCompleted, block.negativeCompleted]}
            />
          </div>
          <div className='flex h-4 w-full items-center justify-start gap-12 text-xs'>
            <div className='flex w-fit flex-col items-center gap-1'>
              <div className='bg-primary h-3 w-6'></div>À fazer
            </div>
            <div className='flex w-fit flex-col items-center gap-1'>
              <div className='bg-secondary h-3 w-6'></div>
              Concluído
            </div>
          </div>
        </div>

        <div className='flex w-[45%] flex-col justify-between'>
          <div className='flex h-2/3 w-full flex-col items-end justify-around'>
            <span>total de casas: {ALL_HOUSES}</span>
            <span>casas disponíveis: {AVAILABLE_HOUSES}</span>
          </div>
          {block?.signature?.key ? (
            <TimeToExpire signature={block.signature} />
          ) : (
            <div className={clsx('flex h-1/3  items-center justify-end')}>
              <Button.Root
                variant='secondary'
                className={clsx(
                  'justify-center !fill-gray-700 !stroke-gray-700 text-gray-700 shadow-xl'
                )}
                onClick={() => actions.share(block.id)}
              >
                Enviar <Share2 size={18} />
              </Button.Root>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TimeToExpireComponent = ({
  signature,
}: {
  signature: IBlock['signature'];
}) => {
  const [expireIn, setExpireIn] = useState<string>('');

  const timeToExpire = useCallback((endDate: string) => {
    const date = new Date(endDate);
    if (!endDate) return;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hoursNumber = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutesNumber = Math.floor((diff / 1000 / 60) % 60);
    const secondsNumber = Math.floor((diff / 1000) % 60);
    const hours = String(hoursNumber).padStart(2, '0');
    const minutes = String(minutesNumber).padStart(2, '0');
    const seconds = String(secondsNumber).padStart(2, '0');
    setExpireIn(`${hours}:${minutes}:${seconds}`);
  }, []);

  useEffect(() => {
    if (!signature) return;
    const interval = setInterval(() => {
      timeToExpire(signature?.expirationDate || '');
    }, 1000);
    return () => clearInterval(interval);
  }, [signature, signature?.expirationDate, timeToExpire]);

  return (
    <div className='flex items-center justify-end gap-1'>
      <span className='text-xs'>Tempo restante:</span>{' '}
      <span className='text-xs font-semibold'>{expireIn}</span>
    </div>
  );
};

const TimeToExpire = memo(TimeToExpireComponent);
