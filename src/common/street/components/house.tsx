import clsx from 'clsx';
import toast from 'react-hot-toast';

import { House, IActions } from '../type';

type HouseProps = {
  house: House;
  actions: IActions;
};

export function HouseComponent({ house, actions }: HouseProps) {
  const notHit = house.dontVisit

  return (
    <div
      className={clsx(
        {
          'bg-secondary/[0.2]': !notHit && !house.status,
          'bg-primary': !notHit && house.status,
        },
        {
          'bg-red-400': notHit
        },
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 py-3 px-2 border-gray-50 shadow-mg transition-all duration-300'
      )}

      onClick={() => {
        if (!notHit) {
          toast.promise(
            actions.mark(house.id),
            {
              loading: 'Salvando...',
              success: <b>Casa {house.number} {house.status ? "marcada" : "desmarcada"} com sucesso!</b>,
              error: (value) => {
                return (
                  <div>
                    <b>Erro ao {!house.status ? "marcar" : "desmarcar"} casa {house.number}!</b>
                    <br />
                    <span>{value.message}</span>
                  </div>
                )
              },

            },
            {
              error: {
                duration: 2000,
              }
            }
          );
        } else {
          toast.error("Casa não pode ser marcada!")
        }
      }}
    >
      <div className="text-gray-600 font-semibold">
        <span
          className={clsx(
            { 'text-gray-50': notHit || house.status, },
            'mini:text-lg text-base'
          )}
        >{house.number}</span>
        <span
          className={clsx(
            { 'text-gray-50': notHit || house.status, },
            'mini:text-base text-sm'
          )}
        >{house.legend ? `/${house.legend}` : ''}</span>
      </div>
    </div >
  );
}
