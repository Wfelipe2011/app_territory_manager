/* eslint-disable @typescript-eslint/no-misused-promises */
import clsx from 'clsx';
import { memo, useCallback, useEffect, useState } from 'react';
import { User, Users } from 'react-feather';

import { ShareCopy } from '@/common/territory/ShareCopy';
import { DoughnutChart } from '@/ui/doughnutChart';

import { IActions, IBlock } from '../type';

interface BlockCardProps {
  block: IBlock;
  index: number;
  actions: IActions;
  territoryId: number;
}

export function BlockCard({ block, actions, territoryId }: BlockCardProps) {
  function sugestion(): string {
    let sugestion = '';
    if (block.negativeCompleted < 15) {
      sugestion = '+1 quadra';
    }
    if (block.negativeCompleted >= 15 && block.negativeCompleted < 25) {
      sugestion = '2 pares';
    }
    if (block.negativeCompleted >= 25 && block.negativeCompleted < 30) {
      sugestion = '3 pares';
    }
    if (block.negativeCompleted >= 30 && block.negativeCompleted < 60) {
      sugestion = '4 pares';
    }
    return sugestion;
  }

  return (
    <div className={clsx('flex min-h-[260px] w-full rounded-b-[40px] rounded-l-[40px] rounded-t-[40px] rounded-br-none rounded-tr-none border p-3 shadow-lg')}>
      <div className='flex h-full w-1/2 flex-col items-baseline justify-start'>
        <h6 className='ml-2 block text-xl font-medium'>
          <span className='ml-2'>{block.name}</span>
        </h6>

        <div className='flex h-[200px] w-full max-w-[170px] flex-col'>
          <DoughnutChart values={[block.positiveCompleted, block.negativeCompleted]} />
        </div>
        <div className='w-full'>
          {!block.signature?.key ? (
            <div className='flex w-full items-center justify-center gap-2'>Sugestão: {sugestion()}</div>
          ) : (
            <div className='flex w-full items-center justify-center gap-2'>
              <TimeToExpire signature={block.signature} />
            </div>
          )}
        </div>
      </div>

      <div className='flex w-1/2 flex-col items-end justify-between'>
        <div className='flex w-full justify-end'>
          <ShareCopy
            actions={actions}
            id={block.id}
            message={{
              title: 'Prezado(a) publicador(a)',
              text: 'Segue o link para a quadra que você está designado(a) para pregar:',
              url: `${window.location.origin}/quadra?s=${block?.signature?.key}`,
            }}
            signatureKey={block?.signature?.key}
            key={block.id}
          />
        </div>

        <div className='flex w-full flex-col gap-2 p-4'>
          <div className='flex items-center gap-2'>
            <div className='bg-secondary h-6 w-14'></div>
            <span>À fazer: {block.negativeCompleted}</span>
          </div>

          <div className='flex items-center gap-2'>
            <div className='bg-primary h-6 w-14'></div>
            <span>Concluído: {block.positiveCompleted}</span>
          </div>
        </div>

        <div className='flex w-full'>
          {block?.signature?.key ? (
            <div className='flex w-full items-end justify-end gap-2 p-2 font-semibold'>
              {block.connections}
              {block.connections === 1 ? <User className='stroke-primary fill-primary' /> : <Users className='stroke-primary fill-primary' />}
              {/* <div className='h-2 w-2 animate-pulse rounded-full bg-green-700'></div> */}
            </div>
          ) : (
            <div className='mb-2 p-4'></div>
          )}
        </div>
      </div>
    </div>
  );
}

const TimeToExpireComponent = ({ signature }: { signature: IBlock['signature'] }) => {
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
    // verifica se o tempo já expirou ou é negativo e parar o contador
    if (diff <= 0) {
      setExpireIn('00:00:00');
      return;
    }
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
    <div className='mb-1 flex w-full flex-col items-center justify-center gap-1'>
      <span className='text-md'>Tempo restante:</span>
      <span className='text-md font-semibold'>{expireIn}</span>
    </div>
  );
};

const TimeToExpire = memo(TimeToExpireComponent);
