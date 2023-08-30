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
        'relative flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 p-6 border-gray-100 shadow-mg transition-all duration-300'
      )}
      onClick={() => actions.mark(house.id)}
    >
      <div className={clsx('')}>
        <span className='text-lg'>{house.number}</span>
        <div className='absolute bottom-1 right-1 text-[7px]'>
          {house.complement}
        </div>
      </div>
    </div>
  );
}
