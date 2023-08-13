import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Menu } from 'react-feather';

import { isMobileWidthSize } from '@/utils/is-mobile';

import { LinkButton } from '../../link';

export function Sidebar() {
  const [statusSidebar, setStatusSidebar] = useState<
    'open' | 'open-mobile' | 'close' | 'close-mobile'
  >(isMobileWidthSize() ? 'close-mobile' : 'open');

  useEffect(() => {
    if (statusSidebar === 'open-mobile') {
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflowX = 'auto';
    }
  }, [statusSidebar]);

  const changeStatusSidebar = () => {
    const isMobile = isMobileWidthSize();
    setStatusSidebar((statusSidebar) => {
      if (statusSidebar.includes('open')) {
        return isMobile ? 'close-mobile' : 'close';
      } else {
        return isMobile ? 'open-mobile' : 'open';
      }
    });
  };

  const changePage = () => {
    if (isMobileWidthSize()) {
      setStatusSidebar('close-mobile');
    }
  };

  return (
    <>
      <div
        className={clsx(
          {
            'relative w-[320px]': statusSidebar === 'open',
            'absolute top-20 h-[calc(100vh-80px)] w-64':
              statusSidebar === 'open-mobile',
            'min-h-full': statusSidebar !== 'open-mobile',
            'relative w-20': statusSidebar === 'close',
            'relative -ml-8 w-0 p-0': statusSidebar === 'close-mobile',
          },
          'flex flex-col gap-3 border-r-2 p-4 shadow-2xl drop-shadow-2xl transition-all duration-500'
        )}
      >
        <LinkButton
          onClick={changePage}
          className={clsx(
            'text-slate-700',
            {
              hidden: statusSidebar === 'close-mobile',
            },
            'hover:bg-green-200'
          )}
          variant='inverse'
          positionX='start'
          to='/'
        >
          Painel
        </LinkButton>
        <LinkButton
          onClick={changePage}
          disabled
          className={clsx(
            'text-slate-700',
            {
              hidden: statusSidebar === 'close-mobile',
            },
            'hover:bg-green-200'
          )}
          variant='inverse'
          positionX='start'
          to='/'
        >
          Uploads
        </LinkButton>
        <LinkButton
          onClick={changePage}
          className={clsx(
            'text-slate-700',
            {
              hidden: statusSidebar === 'close-mobile',
            },
            'hover:bg-green-200'
          )}
          variant='inverse'
          positionX='start'
          to='/usuarios'
        >
          Usuários
        </LinkButton>
        <div
          className='absolute -right-1 top-0 min-h-full w-1.5 cursor-ew-resize transition-all duration-500 hover:border-2 hover:border-blue-200 hover:bg-blue-300 hover:outline-4 hover:outline-blue-100'
          onClick={changeStatusSidebar}
        ></div>
      </div>
      {statusSidebar.includes('mobile') && (
        <div
          className='absolute left-4 top-14 z-40 cursor-pointer'
          onClick={changeStatusSidebar}
        >
          <Menu color='white' />
        </div>
      )}
    </>
  );
}
