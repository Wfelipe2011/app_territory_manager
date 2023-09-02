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
          'bg-gray-100': !house.status,
          'bg-primary': house.status,
        },
        'relative flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 py-2 px-4  border-gray-50 shadow-mg transition-all duration-300'
      )}
      onClick={() => actions.mark(house.id)}
    >
      <div className="text-gray-600 font-semibold">
        <span className='text-lg'>{house.number}</span>
      </div>
    </div>
  );
}
