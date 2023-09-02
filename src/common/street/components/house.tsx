import clsx from 'clsx';

import { House, IActions } from '../type';

type HouseProps = {
  house: House;
  actions: IActions;
};

export function HouseComponent({ house, actions }: HouseProps) {
  // 110/2/CM => house
  // dividir após /
  const [numberHouse, ...rest] = house.number.split('/')
  const complement = house.number.split('/')
  return (
    <div
      className={clsx(
        {
          'bg-secondary/[0.2]': !house.status,
          'bg-primary': house.status,
        },
        'relative flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 py-3 px-3  border-gray-50 shadow-mg transition-all duration-300'
      )}
      onClick={() => actions.mark(house.id)}
    >
      <div className="text-gray-600 font-semibold">
        <span className='text-lg'>{numberHouse}</span>
        <span className='text-sm'>{rest ? " " + rest.join('/') : ""}</span>
      </div>
    </div>
  );
}
