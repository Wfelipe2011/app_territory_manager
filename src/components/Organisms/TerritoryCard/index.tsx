/* eslint-disable @typescript-eslint/no-misused-promises */
import { Input } from '@material-tailwind/react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { Actions } from '@/components/Atoms/Actions';
import HeaderTerritoryCard from '@/components/Molecules/HeaderTerritoryCard';

import { ITerritoryActions } from '@/common/territories/useTerritories';
import { Period, PeriodBR } from '@/enum/Period';
import { DoughnutChart } from '@/ui/doughnutChart';

import { ITerritoryCard } from './type';

interface TerritoryCardProps extends React.ComponentPropsWithoutRef<'div'> {
  data: ITerritoryCard;
  actions: ITerritoryActions;
  onShareClick: () => void;
}

export function TerritoryCard({ data, actions, onShareClick }: TerritoryCardProps) {
  const [overseer, setOverseer] = useState<string>();
  const [date, setDate] = useState<string>();

  useEffect(() => {

    if (!data.overseer) setOverseer('');
    if (!data.signature?.key) setOverseer('');
    setOverseer(data.overseer)
    setDate(dayjs(data.signature.expirationDate).format('YYYY-MM-DD'))

    return () => {
      setOverseer('');
      setDate('');
    }
  }, [data]);

  return (
    <div
      className={clsx(
        'flex min-h-[260px] max-w-[450px] w-full flex-col rounded-lg border p-4 shadow-md',
        data.signature.key && 'shadow-primary border-primary shadow-sm'
      )}
    >
      <HeaderTerritoryCard
        data={data}
        className=''
        onShareClick={onShareClick}
      />

      <div className='flex h-4/5 w-full gap-3'>
        <div className='relative flex w-[45%] flex-col items-center justify-start gap-4 text-lg'>
          {data.positiveCompleted.length || data.negativeCompleted ? (
            <>

              <div id='admin-chart' className='flex h-[210px] w-full max-w-[150px] flex-col py-4'>
                <DoughnutChart
                  labels={[PeriodBR.MORNING, PeriodBR.AFTERNOON, PeriodBR.EVENING, PeriodBR.WEEKEND, 'A fazer']}
                  values={[...calculatePeriodCounts(data.positiveCompleted), data.negativeCompleted]}
                  backgroundColor={[...getColors().map((item) => item.bg)]}
                  borderColor={[...getColors().map((item) => item.border)]}
                />
              </div>
              <div className='absolute -bottom-2 left-0 flex w-[150%] flex-wrap gap-2'>
                {calculatePeriodCounts(data.positiveCompleted).map((item, index) => {
                  if (item === 0) return null;
                  const color = getColors()[index].bg;
                  const border = getColors()[index].border;
                  return (
                    <div className='flex items-center gap-2' key={index}>
                      <div
                        className='flex h-4 w-4 items-center justify-center rounded-full'
                        style={{ backgroundColor: color, border: `1px solid ${border}` }}
                      ></div>
                      <p className='text-xs text-gray-400'>{PeriodBR[Object.keys(Period)[index]]}</p>
                    </div>
                  );
                })}
                <div className='flex items-center gap-2'>
                  <div
                    className='flex h-4 w-4 items-center justify-center rounded-full'
                    style={{ backgroundColor: getColors()[4].bg, border: `1px solid ${getColors()[4].border}` }}
                  ></div>
                  <p className='text-xs text-gray-400'>A fazer</p>
                </div>
              </div>
            </>
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <p className='text-xs text-gray-400'>Sem dados</p>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-2 p-2 py-5 w-44'>
          <Input
            id='admin-overseer'
            name='overseer'
            label='Nome Dirigente'
            value={overseer}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              actions.updateData(e, data.territoryId);
              setOverseer(e.target.value);
            }}
            containerProps={{ className: "!min-w-[100px]" }}
          />
          <Input
            id='admin-expirationTime'
            name='expirationTime'
            label='Duração do acesso'
            type='date'
            value={date}
            className={clsx({
              'bg-secondary': !data.signature.expirationDate,
            })}
            onChange={(e) => {
              actions.updateDateTime(e, data.territoryId);
              setDate(e.target.value);
            }}
            containerProps={{ className: "!min-w-[100px]" }}
          />
          <Actions changeOverseer={setOverseer} key={data.territoryId} territoryCard={data} actions={actions} />
        </div>
      </div>
    </div>
  );
}


interface CalculatePeriodCountsProps {
  date: Date;
  period: Period;
}

function calculatePeriodCounts(positiveCompleted: CalculatePeriodCountsProps[]): number[] {
  const counts = {
    [Period.MORNING]: 0,
    [Period.AFTERNOON]: 0,
    [Period.EVENING]: 0,
    [Period.WEEKEND]: 0,
  };

  positiveCompleted.forEach((item) => {
    switch (item.period) {
      case Period.MORNING:
        counts[Period.MORNING] += 1;
        break;
      case Period.AFTERNOON:
        counts[Period.AFTERNOON] += 1;
        break;
      case Period.EVENING:
        counts[Period.EVENING] += 1;
        break;
      case Period.WEEKEND:
        counts[Period.WEEKEND] += 1;
        break;
      default:
        break;
    }
  });

  return Object.values(counts);
};

function getColors() {
  return [
    {
      bg: 'rgba(255, 206, 86, 0.2)',
      border: 'rgba(255, 206, 86, 1)',
    },
    {
      bg: 'rgba(255, 159, 64, 0.2)',
      border: 'rgba(255, 159, 64, 1)',
    },
    {
      bg: 'rgba(54, 162, 235, 0.2)',
      border: 'rgba(54, 162, 235, 1)',
    },
    {
      bg: '#d2f8dc',
      border: '#4ee474',
    },
    {
      bg: '#e7e7e7',
      border: '#d3d3d3',
    },
  ];
};