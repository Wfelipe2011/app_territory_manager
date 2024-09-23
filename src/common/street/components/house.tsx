import clsx from 'clsx';
import toast from 'react-hot-toast';

import { House, IActions } from '../type';

type HouseProps = {
  house: House;
  actions: IActions;
  mode?: Mode;
};

type Mode = 'view' | 'edit';

export function HouseComponent({ house, actions, mode = 'view' }: HouseProps) {
  const { dontVisit: notHit, status, id, number, legend } = house;

  const handleMark = async () => {
    if (notHit) {
      toast.error("Casa não pode ser marcada!");
      return;
    }

    if (mode === 'edit') {
      await actions.mark(id);
      return;
    }

    try {
      await actions.mark(id);
      const action = status ? 'desmarcada' : 'marcada';
      toast.success(`Casa ${number} ${action} com sucesso!`);
    } catch (error) {
      toast.error(`Erro ao ${status ? "desmarcar" : "marcar"} casa ${number}!`);
    }
  };

  const containerClasses = clsx(
    {
      'bg-secondary/[0.2]': !notHit && !status,
      'bg-primary': !notHit && status,
      'bg-red-400': notHit,
    },
    'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 py-3 px-2 border-gray-50 shadow-mg transition-all duration-300',
    {
      'border-2 border-primary': mode === 'edit',
    }
  );

  const numberClasses = clsx(
    { 'text-gray-50': notHit || status },
    mode === 'edit' ? 'text-primary text-3xl' : 'mini:text-lg text-base',
    "leading-none"
  );

  const legendClasses = clsx(
    { 'text-gray-50': notHit || status },
    'mini:text-base text-sm'
  );

  return (
    <div className={containerClasses} onClick={handleMark}>
      <div className={clsx("font-semibold", mode === 'edit' ? 'text-primary' : 'text-gray-600')}>
        <span className={numberClasses}>{number}</span>
        {legend && <span className={legendClasses}>/{legend}</span>}
      </div>
    </div>
  );
}
