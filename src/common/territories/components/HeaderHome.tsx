import Image from 'next/image';
import { Info, Search } from 'react-feather';

import image from '@/assets/territory_manager.png';
import { Input } from '@/ui';

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
            placeholder='Pesquise o território'
            className='shadow-md'
            value={search}
            onChange={handleChangeSearch}
            enterKeyHint='search'
            onKeyDown={handleSearch}
            icon={<Search size={16} />}
          />

        </div>
        <Info size={28} fill="rgb(121 173 87 / var(--tw-text-opacity))" className='text-gray-50' />
      </div>
    </div>
  );
}
