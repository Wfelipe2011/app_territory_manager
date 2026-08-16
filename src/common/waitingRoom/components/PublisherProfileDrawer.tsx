import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import toast from 'react-hot-toast';

import type { PublisherProfile } from '@/lib/helper';
import { savePublisherProfile } from '@/lib/helper';

import { IconContainer } from '@/components/Atoms/IconContainer';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

import { Button } from '@/ui';
import { useKeyboardFix } from '@/utils/useKeyboardFix';

import { PublisherAvatar } from './PublisherAvatar';

type PublisherProfileDrawerProps = {
  profile: PublisherProfile;
  trigger: React.ReactNode;
  onSave?: (profile: PublisherProfile) => void;
};

export function PublisherProfileDrawer({ profile, trigger, onSave }: PublisherProfileDrawerProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
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
    setPhoneLast4(profile.phoneLast4);
  }, [open, profile.firstName, profile.phoneLast4]);

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
        <div className='flex w-full items-center justify-between p-6 pb-0'>
          <h2 className='text-xl font-semibold text-primary-text'>Meu perfil</h2>
          <IconContainer icon={<X size={20} aria-hidden='true' />} aria-label='Fechar' onClick={() => setOpen(false)} />
        </div>
        <div className='flex flex-col gap-4 p-6'>
          <div className='flex items-center gap-3'>
            <PublisherAvatar profile={profile} size='lg' />
            <div className='flex min-w-0 flex-col'>
              <span className='truncate text-lg font-semibold text-primary-text'>
                {profile.firstName.trim() || 'Publicador'}
              </span>
              <span className='text-sm text-muted'>
                {profile.phoneLast4 ? `**** ${profile.phoneLast4}` : 'Identificação na sala de espera'}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <label htmlFor='drawer-first-name' className='text-sm text-primary-text'>
              Nome
            </label>
            <Input
              id='drawer-first-name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder='Apenas o primeiro nome'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label htmlFor='drawer-phone-last4' className='text-sm text-primary-text'>
              Últimos 4 dígitos do celular
            </label>
            <Input
              id='drawer-phone-last4'
              value={phoneLast4}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder='0000'
              inputMode='numeric'
              maxLength={4}
            />
          </div>
          <Button.Root type='button' className='w-full' onClick={onSubmit}>
            Salvar
          </Button.Root>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
