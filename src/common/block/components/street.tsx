import clsx from 'clsx';

import { Button } from '@/ui';

import { NavigateNext } from './navigate_next'
import { PinDrop } from './pin_drop'
import { IActions, IAddress, IBlock } from '../type';

interface AddressProps {
  block: Omit<IBlock, 'addresses'>;
  address: IAddress;
  actions: IActions;
}

export function Street({ address, actions, block }: AddressProps) {
  const FIRST_HOUSE = address?.houses[0];
  const LAST_HOUSE = address?.houses[address?.houses.length - 1];

  const addressTo = () => {
    const [_, territoryName] = block.territoryName.split('-');
    const middleHouse = Math.round(address?.houses.length / 2);
    const loc = `${territoryName} ${address.name} ${address?.houses[middleHouse]}`;
    return loc;
  };

  const toMapsWithNavigator = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const origin = `origin=${latitude},${longitude}`;
        const to = addressTo();
        const encoded = encodeURI(to);

        const destination = `destination=${encoded}`;
        const urlMaps = `https://www.google.com/maps/dir/?api=1&${origin}&${destination}`;
        window.open(urlMaps, '_target');
      });
    } else {
      alert('nao suportado');
    }
  };

  return (
    <div
      className={clsx(
        'flex h-20 w-full items-center justify-center rounded-b-[40px] rounded-l-[40px] rounded-t-[40px] rounded-br-none rounded-tr-none bg-white p-4 gap-3 shadow-sm drop-shadow-xl '
      )}
    >
      <div className='flex items-center flex-col p-2 px-3  rounded-full cursor-pointer bg-secondary' onClick={toMapsWithNavigator} >
        <PinDrop />
      </div>
      <div onClick={() => void actions.goToStreet(address.id)} className={clsx('flex w-11/12 flex-col items-start cursor-pointer')}>
        <h6 className='inline-block text-lg font-semibold w-full text-gray-900'>{address.name}</h6>
        <p className='text-md text-gray-600'>
          N° de {FIRST_HOUSE} à {LAST_HOUSE}
        </p>
      </div>
      <Button.Root
        variant='ghost'
        className={clsx(
          '!shadow-non text-primary flex h-8 w-1/12 items-center justify-center !p-0 font-bold'
        )}
        onClick={() => void actions.goToStreet(address.id)}
      >
        <Button.Icon icon={NavigateNext} size={24} />
      </Button.Root>
    </div>
  );
}
