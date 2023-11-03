import { driver } from "driver.js";
import Image from 'next/image';
import { Info, Search } from 'react-feather';

import "driver.js/dist/driver.css";

import image from '@/assets/territory_manager.png';
import { Input } from '@/ui';

const driverObj = driver({
  showProgress: true,
  steps: [
    { element: '#admin-filter-search', popover: { title: 'Pesquisar território', description: 'Pesquise o território diretamente por nome ou número.' } },
    { element: '#admin-filter-type', popover: { title: 'Filtrar por tipo', description: 'Filtre os territórios por tipo.' } },
    { element: '#admin-filter-round', popover: { title: 'Filtrar por rodada', description: 'Filtre os territórios por rodada.' } },
    { element: '#admin-chart', popover: { title: 'Gráfico', description: 'Acompanhe no gráfico os detalhes desse território. Porcentagem de conclusão e período em que foi trabalho.' } },
    { element: '#admin-overseer', popover: { title: 'Dirigente', description: 'Adicione o nome do dirigente que irá usar esse território e em seguida o período que ele estará disponível para ele.' } }
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
