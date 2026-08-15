import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import toast from 'react-hot-toast';

import type { PublisherProfile } from '@/lib/helper';
import { savePublisherProfile } from '@/lib/helper';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

import { Button } from '@/ui';
import { useKeyboardFix } from '@/utils/useKeyboardFix';

type PublisherProfileDrawerProps = {
  profile: PublisherProfile;
  trigger: React.ReactNode;
  onSave?: (profile: PublisherProfile) => void;
};

export function PublisherProfileDrawer({ profile, trigger, onSave }: PublisherProfileDrawerProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phoneLast4, setPhoneLast4] = useState(profile.phoneLast4);

  useKeyboardFix(() => {
    const drawerContent = document.getElementById('profile_drawer_content');
    if (drawerContent) {
      drawerContent.style.marginBottom = '1rem';
      drawerContent.style.height = 'auto';
    }
  });

  useEffect(() => {
    if (!open) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhoneLast4(profile.phoneLast4);
  }, [open, profile.firstName, profile.lastName, profile.phoneLast4]);

  const onChangePhone = (value: string) => {
    setPhoneLast4(value.replace(/\D/g, '').slice(0, 4));
  };

  const onSubmit = () => {
    if (!firstName.trim()) {
      toast.error('Informe o seu nome');
      return;
    }
    if (phoneLast4.length !== 4) {
      toast.error('Informe os 4 últimos dígitos do celular');
      return;
    }
    const updated: PublisherProfile = {
      ...profile,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneLast4,
    };
    savePublisherProfile(updated);
    onSave?.(updated);
    setOpen(false);
    toast.success('Perfil atualizado');
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent id='profile_drawer_content' className='w-full bg-white'>
        <div className='flex w-full items-center justify-between px-6 pt-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Meu perfil</h3>
          <X className='cursor-pointer text-gray-600' onClick={() => setOpen(false)} />
        </div>
        <div className='flex flex-col gap-4 px-6 py-6'>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-700'>Nome</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='Nome' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-700'>Sobrenome</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Sobrenome' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-700'>Últimos 4 dígitos do celular</label>
            <Input
              value={phoneLast4}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder='0000'
              inputMode='numeric'
              maxLength={4}
            />
          </div>
          <Button.Root type='button' className='w-full text-white' onClick={onSubmit}>
            Salvar
          </Button.Root>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
