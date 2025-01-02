import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Dialog, DialogBody, DialogHeader } from '@material-tailwind/react';
import { House, IActions } from '../type';
import { useState } from 'react';

type HouseProps = {
  house: House;
  actions: IActions;
};

export function HouseComponent({ house, actions }: HouseProps) {
  const [open, handleOpen] = useState(false);
  const notHit = house.dontVisit

  const handleHouseClick = () => {
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
          );
        },
      },
      {
        error: {
          duration: 2000,
        }
      }
    );
  }

  return (
    <>
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
            handleOpen(true);
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
      </div>

      <Dialog
        className="!max-w-[250px] !min-w-[250px] !p-2"
        open={open} handler={handleOpen}>
        <div className='flex justify-between'>
          <DialogHeader>Você tem certeza?</DialogHeader>
        </div>
        <DialogBody>
          <div className="flex justify-center">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mr-2 w-full"
              onClick={async () => {
                handleHouseClick();
                handleOpen(false);
              }}
            >
              SIM
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded w-full"
              onClick={() => handleOpen(false)}
            >
              NÃO
            </button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}
