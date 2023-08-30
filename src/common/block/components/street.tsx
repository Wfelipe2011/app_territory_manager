import clsx from 'clsx';
import { ArrowRight, MapPin } from 'react-feather';

import { Button } from '@/ui';

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
    const [territoryNumber, territoryName] = block.territoryName.split('-');
    const loc = `${territoryName} ${address.name}`;
    return loc;
  };

  const toMaps = () => {
    const loc = addressTo();
    const encoded = encodeURI(loc);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    window.open(mapsUrl, '_target');
  };

  const toMapsWithNavigator = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Use latitude e longitude como desejar
        //alert("Latitude: " + latitude + ", Longitude: " + longitude);
        const origin = `origin=${latitude},${longitude}`;
        const to = addressTo();
        const encoded = encodeURI(to);

        const destination = `destination=${encoded}`;
        const urlMaps = `https://www.google.com/maps/dir/?api=1&${origin}&${destination}`;
        //alert(urlMaps)
        window.open(urlMaps, '_target');
      });
    } else {
      alert('nao suportado');
    }
  };

  return (
    <div
      className={clsx(
        'flex h-20 w-full items-center rounded-b-[40px] rounded-l-[40px] rounded-t-[40px] rounded-br-none rounded-tr-none bg-white px-10 shadow-sm drop-shadow-xl'
      )}
    >
      <div className={clsx('flex w-11/12 flex-col items-start')}>
        <div className='flex items-center justify-start gap-2 w-full'>
          <MapPin className='cursor-pointer' onClick={toMapsWithNavigator} />
          <h6 onClick={() => void actions.goToStreet(address.id)} className='inline-block text-lg font-bold cursor-pointer w-full'>{address.name}</h6>
        </div>
        <p className='px-2'>
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
        <Button.Icon icon={ArrowRight} size={24} />
      </Button.Root>
    </div>
  );
}
