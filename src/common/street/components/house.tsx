import { Dialog, DialogBody, DialogHeader } from '@material-tailwind/react';
import clsx from 'clsx';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { LetterIcon } from '@/assets/icons/LetterIcon';

import { House, IActions } from '../type';

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
            'bg-blue-gray-100': house.reportType,
          },
          {
            'bg-red-400': notHit
          },
          'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 py-2 px-1 border-gray-100 shadow-mg transition-all duration-300 h-[64px]'
        )}

        onClick={() => {
          if (!notHit) {
            handleOpen(true);
          } else {
            toast.error("Casa não pode ser marcada!")
          }
        }}
      >
        <HouseManager house={house} />
      </div>

      <Dialog
        className="!max-w-[250px] !min-w-[250px] !p-2"
        open={open} handler={handleOpen}>
        <div className='flex justify-between'>
          <DialogHeader>Você tem certeza?</DialogHeader>
        </div>
        <DialogBody>
          <div className="flex justify-center gap-2">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded w-full"
              onClick={() => handleOpen(false)}
            >
              NÃO
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
              onClick={async () => {
                handleHouseClick();
                handleOpen(false);
              }}
            >
              SIM
            </button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}

function HouseManager({ house }: { house: House }) {
  if (house.leaveLetter && !house.dontVisit) {
    return <HouseNumberAndLetter house={house} notHit={house.dontVisit} />;
  }
  return <HouseNumber house={house} notHit={house.dontVisit} />;
}

function HouseNumber({ house, notHit }: { house: House, notHit: boolean }) {
  return (
    <div className="text-gray-600 font-semibold">
      <span
        className={clsx({ 'text-gray-50': notHit || house.status, }, 'text-xl')}
      >{house.number}</span>
      <span
        className={clsx(
          { 'text-gray-50': notHit || house.status, },
          'mini:text-base text-sm'
        )}
      >{house.legend ? `/${house.legend}` : ''}</span>
    </div>
  )
}

function HouseNumberAndLetter({ house, notHit }: { house: House, notHit: boolean }) {
  return (
    <div className="text-gray-600 font-semibold">
      <div className='absolute top-0 right-0 w-6 h-6'>
        <LetterIcon className={clsx("size-6", { "fill-primary": !house.status, "fill-gray-50": house.status })} />
      </div>
      <span
        className={clsx({ 'text-gray-50': notHit || house.status, }, 'text-xl')}
      >{house.number} </span>
      <span
        className={clsx(
          { 'text-gray-50': notHit || house.status, },
          'mini:text-base text-md'
        )}
      >{house.legend ? `/${house.legend}` : ''}</span>
    </div>
  )
}