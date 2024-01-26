import { Button, Dialog, DialogBody, DialogHeader, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { X } from 'react-feather';

import { Mode, RootModeScreen } from '@/common/loading';
import { NewHouse } from '@/common/street/components/DialogReport/NewHouse';

interface DialogReportProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export type Reports = 'default' | 'newHouse' | 'changeSubtitle' | 'moveHouse' | 'removeHouse' | 'others';

export function DialogReport({ open, setOpen }: DialogReportProps) {
  const [isLoading, setIsLoading] = useState<Mode>('screen');
  const [report, setReport] = useState<Reports>('default');
  const handleOpen = () => setOpen(true);
  const handleClosed = () => {
    setOpen(false);
    setReport('default');
    // setIsLoading('loading');
  };

  function Render() {
    switch (report) {
      case 'default':
        return <Default setReport={setReport} />;
      case 'newHouse':
        return <NewHouse setReport={setReport} />;
      case 'changeSubtitle':
        return <div>changeSubtitle</div>;
      case 'moveHouse':
        return <div>moveHouse</div>;
      case 'removeHouse':
        return <div>removeHouse</div>;
      case 'others':
        return <div>others</div>;
      default:
        return <Default setReport={setReport} />;
    }
  }

  return (
    <div className='absolute right-0 top-0 z-20 m-6'>
      <Dialog open={open} handler={handleOpen}>
        <RootModeScreen mode={isLoading}>
          <div className='flex justify-between'>
            <DialogHeader>
              <div className='flex gap-2 p-2 '>
                <Typography variant='h5' color='blue-gray'>
                  Reportar
                </Typography>
              </div>
            </DialogHeader>
            <X className='m-4 cursor-pointer' onClick={handleClosed} />
          </div>
          <DialogBody>
            <Render />
          </DialogBody>
        </RootModeScreen>
      </Dialog>
    </div>
  );
}

interface DefaultProps {
  setReport: (report: Reports) => void;
}

function Default({ setReport }: DefaultProps) {
  const newHouse = () => {
    setReport('newHouse');
  };
  const changeSubtitle = () => {
    setReport('changeSubtitle');
  };
  const moveHouse = () => {
    setReport('moveHouse');
  };
  const removeHouse = () => {
    setReport('removeHouse');
  };
  const others = () => {
    setReport('others');
    // const mensagem = encodeURIComponent(
    //   `REPORTAR MUDANÇA\nOlá, gostaria de reportar uma mudança no território.\nTerritório: ${street.territoryName}\nQuadra: ${street.blockName}\nRua:  ${street.streetName}\nAlteração:`
    // );
    // const numeroTelefone = '5515981464391';
    // const link = `https://api.whatsapp.com/send?phone=${numeroTelefone}&text=${mensagem}`;
    // window.open(link);
  };

  return (
    <div className='flex flex-col items-center justify-between gap-4'>
      <ButtonOption onClick={newHouse}>
        <p>Adicionar casa</p>
      </ButtonOption>

      <ButtonOption disabled onClick={changeSubtitle}>
        <p>Alterar legenda</p>
      </ButtonOption>

      <ButtonOption disabled onClick={moveHouse}>
        <p>Mover Casa</p>
      </ButtonOption>

      <ButtonOption disabled onClick={removeHouse}>
        <p>Remover Casa</p>
      </ButtonOption>

      <ButtonOption onClick={others}>
        <p>Outros</p>
      </ButtonOption>
    </div>
  );
}

interface ButtonOptionProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function ButtonOption({ children, onClick, disabled }: ButtonOptionProps) {
  return (
    <Button onClick={onClick} disabled={disabled || false} className='h-12 w-full rounded-md bg-gray-200 text-black shadow-md'>
      {children}
    </Button>
  );
}
