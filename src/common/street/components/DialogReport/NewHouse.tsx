import { Input, Textarea } from '@material-tailwind/react';
import { Dispatch, SetStateAction, useState } from 'react';

import { Reports } from '@/common/street/components/DialogReport';
import { Button } from '@/ui';

interface NewHouseProps {
  setReport: Dispatch<SetStateAction<Reports>>;
}

interface House {
  number: number;
  legend: string;
}

export function NewHouse({ setReport }: NewHouseProps) {
  const [house, setHouse] = useState<House>({ number: 0, legend: '' });

  const updateHouseNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    setHouse((prev) => ({ ...prev, number: value }));
  };
  const updateHouseLegend = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setHouse((prev) => ({ ...prev, legend: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(house);
  };

  const goBack = () => setReport('default');
  return (
    <form onSubmit={onSubmit} className='flex flex-col justify-between gap-8'>
      <div className='flex h-4/5 flex-col items-center justify-evenly gap-4'>
        <Input label='Número da casa' name='number' value={house.number} onChange={updateHouseNumber} min={0} />
        <Textarea label='Legenda' name='legend' value={house.legend} onChange={updateHouseLegend} />
      </div>
      <div className='flex items-center justify-between'>
        <Button.Root variant='inverse' type='button' onClick={goBack}>
          Voltar
        </Button.Root>
        <Button.Root variant='success' type='submit'>
          Enviar
        </Button.Root>
      </div>
    </form>
  );
}
