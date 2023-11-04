import { driver } from "driver.js";
import Image from 'next/image';
import { Info, Search } from 'react-feather';

import "driver.js/dist/driver.css";

import image from '@/assets/territory_manager.png';
import { Input } from '@/ui';

const driverObj = driver({
  showProgress: true,
  steps: [
    { element: '#admin-filter-search', popover: { title: 'Pesquisar Território', description: 'Encontre o território por nome ou número.' } },
    { element: '#admin-filter-type', popover: { title: 'Filtrar por Tipo', description: 'Filtre os territórios de acordo com o tipo.' } },
    { element: '#admin-filter-round', popover: { title: 'Filtrar por Rodada', description: 'Filtre os territórios de acordo com a rodada.' } },
    { element: '#admin-chart', popover: { title: 'Gráfico', description: 'Visualize no gráfico os detalhes deste território, incluindo a porcentagem de conclusão e o período de trabalho.' } },
    { element: '#admin-overseer', popover: { title: 'Dirigente', description: 'Adicione o nome do dirigente que utilizará este território e especifique o período de disponibilidade para ele.' } }
  ],
  nextBtnText: 'Próximo',
  prevBtnText: 'Anterior',
  doneBtnText: 'Finalizar',
  progressText: '{{current}} de {{total}}',
});

interface IHeaderHomeProps {
  search: string;
  handleChangeSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitSearch: () => void;
}

let timeout: NodeJS.Timeout;

export function HeaderHome({
  search,
  handleChangeSearch,
  submitSearch,
}: IHeaderHomeProps) {

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      submitSearch();
    }, 500);
  };

  return (
    <div className='p-4 '>
      <div className='flex justify-between items-center'>
        <div className='flex gap-3 items-center'>
          <div className='max-w-[70px] overflow-hidden rounded-full '>
            <Image src={image} alt='logo' className='w-full' />
          </div>

          <Input
            id="admin-filter-search"
            placeholder='Pesquise o território'
            className='shadow-md'
            value={search}
            onChange={handleChangeSearch}
            enterKeyHint='search'
            onKeyDown={handleSearch}
            icon={<Search size={16} />}
          />

        </div>
        <Info onClick={() => driverObj.drive()} size={28} fill="rgb(121 173 87 / var(--tw-text-opacity))" className='text-gray-50 cursor-pointer' />
      </div>
    </div>
  );
}
