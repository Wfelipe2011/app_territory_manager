import clsx from 'clsx';

import { House, IActions } from '../type';

type HouseProps = {
  house: House;
  actions: IActions;
};

export function HouseComponent({ house, actions }: HouseProps) {
  return (
    <div
      className={clsx(
        {
          'bg-white': !house.status,
          'bg-primary': house.status,
        },
        'relative flex cursor-pointer flex-col items-center justify-center rounded-sm border border-gray-200 p-4 shadow-md transition-all duration-300 hover:shadow-lg'
      )}
      onClick={() => actions.mark(house.id)}
    >
      <div className={clsx('rounded-md p-2')}>
        <span className='text-xl'>{house.number}</span>
        <div className='absolute bottom-1 right-1 text-[7px]'>
          {house.complement}
        </div>
      </div>
    </div>
  );
}
