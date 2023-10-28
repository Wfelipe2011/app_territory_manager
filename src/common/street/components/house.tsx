import clsx from 'clsx';
import toast from 'react-hot-toast';

import { House, IActions } from '../type';

type HouseProps = {
  house: House;
  actions: IActions;
};

export function HouseComponent({ house, actions }: HouseProps) {
  const [numberHouse, ...rest] = house.number.split('/')
  const complement = house.number.split('/')
  const notHit = house.legend === "Não Bater"

  return (
    <div
      className={clsx(
        {
          'bg-secondary/[0.2]': !house.status,
          'bg-primary': house.status,
        },
        {
          'bg-red-400': notHit
        },
        'relative flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 py-3 px-2  border-gray-50 shadow-mg transition-all duration-300'
      )}

      onClick={() => {
        if (!notHit) {
          toast.promise(
            actions.mark(house.id),
            {
              loading: 'Salvando...',
              success: <b>Casa {numberHouse} {house.status ? "marcada" : "desmarcada"} com sucesso!</b>,
              error: <b>Erro ao {house.status ? "marcada" : "desmarcada"} casa {numberHouse}!</b>
            }
          );
        } else {
          toast.error("Casa não pode ser marcada!")
        }
      }}
    >
      <div className="text-gray-600 font-semibold">
        <span className='text-lg'>{numberHouse}</span>
        <span className='text-sm'>{rest ? " " + rest.join('/') : ""}</span>
      </div>
    </div>
  );
}
