/* eslint-disable @typescript-eslint/no-misused-promises */
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';

import { ShareCopy } from '@/common/territory/ShareCopy';
import { DoughnutChart } from '@/ui/doughnutChart';

import { IActions, IBlock } from '../type';

interface BlockCardProps {
  block: IBlock;
  index: number;
  actions: IActions;
  territoryId: number;
}

export function BlockCard(props: BlockCardProps) {
  const { block, actions, territoryId } = props;
  const router = useRouter();

  const redirect = () => {
    const query = new URLSearchParams();
    query.set('b', String(block.id));
    query.set('t', String(territoryId));
    router.push(`/quadra?${query.toString()}`);
  };

  function sugestion(): string {
    let sugestion = '';
    if (block.negativeCompleted < 15) {
      sugestion = '+1 quadra'
    }
    if (block.negativeCompleted >= 15 && block.negativeCompleted < 25) {
      sugestion = '2 pares'
    }
    if (block.negativeCompleted >= 25 && block.negativeCompleted < 30) {
      sugestion = '3 pares'
    }
    if (block.negativeCompleted >= 30 && block.negativeCompleted < 60) {
      sugestion = '4 pares'
    }
    return sugestion;
  }

  return (
    <div
      className={clsx(
        'flex min-h-[260px] w-full rounded-b-[40px] rounded-l-[40px] rounded-t-[40px] rounded-br-none rounded-tr-none border p-3 shadow-lg',
      )}
    >
      <div className='flex flex-col justify-start h-full items-baseline w-1/2'>
        <h6 className='block text-xl ml-2 font-medium ' onClick={redirect}>
          <span className='ml-2'>
            {block.name}
          </span>
        </h6>

        <div className='flex flex-col w-full max-w-[170px] h-[200px]'>
          <DoughnutChart
            values={[block.positiveCompleted, block.negativeCompleted]}
          />
        </div>
        <div className='pt-2'>
          <span className='ml-4'>Sugestão: {sugestion()}</span>
        </div>
      </div>

      <div className='flex flex-col justify-between items-end w-1/2'>

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

        <div className='flex flex-col w-full p-4 gap-2'>

          <div className='flex items-center gap-2'>
            <div className='bg-secondary h-6 w-14'></div><span>À fazer: {block.negativeCompleted}</span>
          </div>

          <div className='flex items-center gap-2'>
            <div className='bg-primary h-6 w-14'></div><span>Concluído: {block.positiveCompleted}</span>
          </div>

        </div>

        <div className='flex w-full'>
          {
            block?.signature?.key ? (
              <TimeToExpire signature={block.signature} />
            ) : (
              <div className='p-4 mb-2'></div>
            )
          }
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
    <div className='flex flex-col items-center justify-center gap-1 mb-1 w-full'>
      <span className='text-md'>Tempo restante:</span>
      <span className='text-md font-semibold'>{expireIn}</span>
    </div>
  );
};

const TimeToExpire = memo(TimeToExpireComponent);