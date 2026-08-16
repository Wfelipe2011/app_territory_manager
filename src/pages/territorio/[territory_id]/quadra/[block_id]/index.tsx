/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';
import { driver } from 'driver.js';
import jwt_decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HelpCircle, Share2, Users, X } from 'react-feather';
import toast from 'react-hot-toast';

import 'driver.js/dist/driver.css';

import { changeTheme } from '@/lib/changeTheme';
import type { PublisherProfile } from '@/lib/helper';
import {
  getActiveGroupId,
  getOrCreatePublisherProfile,
  getTenantSignatureKey,
  savePublisherProfile,
} from '@/lib/helper';

import { IconContainer } from '@/components/Atoms/IconContainer';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

import { Street, useBlock } from '@/common/block';
import { RootModeScreen } from '@/common/loading';
import { DialogMap } from '@/common/territory/components/DialogMap';
import { PublisherCard } from '@/common/waitingRoom/components';
import type { WaitingRoomPublisher } from '@/common/waitingRoom/type';
import { useWaitingRoomSSE } from '@/common/waitingRoom/useWaitingRoomSSE';
import { env } from '@/constant';
import { waitingRoomGateway } from '@/infra/Gateway/WaitingRoomGateway';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { Body, Button, Header, SubHeader } from '@/ui';

export default function Block() {
  const router = useRouter();
  const { query } = useRouter();
  const { block_id, round, territory_id } = query as { territory_id: string; block_id: string; round: string };

  const { block, actions, isLoading } = useBlock(block_id, territory_id, round);

  const blockKey = useMemo(() => parseCookies()[env.storage.signatureId] || '', []);
  const groupId = useMemo(() => {
    const token = parseCookies()[env.storage.token];
    if (!token) return '';
    try {
      const decoded = jwt_decode<{ groupId?: string }>(token);
      return decoded.groupId || '';
    } catch {
      return '';
    }
  }, []);

  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState<WaitingRoomPublisher[]>([]);
  const [peersOpen, setPeersOpen] = useState(false);

  const enabled = !!groupId && !!blockKey;

  useEffect(() => {
    setProfile(getOrCreatePublisherProfile());
  }, []);

  const getPeers = useCallback(async () => {
    if (!groupId || !blockKey) return;
    const { status, data } = await waitingRoomGateway.getRoom(groupId, blockKey);
    if (status > 299) {
      setPeers([]);
      return;
    }
    if (data?.role === 'publisher') setPeers(data.peers ?? []);
  }, [blockKey, groupId]);

  const joinRoom = useCallback(async () => {
    if (!groupId || !blockKey || !profile) return;
    const { status } = await waitingRoomGateway.joinGroup(groupId, blockKey, {
      firstName: profile.firstName,
      phoneLast4: profile.phoneLast4,
    });
    if (status <= 299) {
      setJoined(true);
      void getPeers();
    }
  }, [blockKey, getPeers, groupId, profile]);

  useEffect(() => {
    if (!enabled || !profile?.firstName || joined) return;
    void joinRoom();
  }, [enabled, joinRoom, joined, profile?.firstName]);

  useEffect(() => {
    if (!enabled || !profile?.firstName) return;
    void getPeers();
  }, [enabled, getPeers, profile?.firstName]);

  const sseUrl = useMemo(() => {
    if (!groupId || !blockKey || !profile?.firstName) return null;
    return `${URL_API}/realtime/waiting-room/${groupId}?s=${encodeURIComponent(blockKey)}`;
  }, [blockKey, groupId, profile?.firstName]);

  useWaitingRoomSSE(sseUrl, {
    onConnected: () => void getPeers(),
    onPresenceChanged: () => void getPeers(),
    onAssignmentsChanged: () => void getPeers(),
  });

  useEffect(() => {
    if (!enabled || !profile?.firstName) return;
    const heartbeat = setInterval(() => {
      void waitingRoomGateway.heartbeat(groupId, blockKey);
    }, 30_000);
    return () => clearInterval(heartbeat);
  }, [blockKey, enabled, groupId, profile?.firstName]);

  const submitProfile = () => {
    if (!profile) return;
    const updated: PublisherProfile = {
      ...profile,
      firstName: firstName.trim(),
      phoneLast4,
    };
    savePublisherProfile(updated);
    setProfile(updated);
    toast.success('Perfil salvo');
  };

  const shareFromWaitingRoom = async () => {
    const tenantKey = getTenantSignatureKey();
    const activeGroupId = getActiveGroupId();
    if (!tenantKey || !activeGroupId) {
      toast.error('Abra a sala de espera antes de compartilhar');
      return;
    }
    const { status, data } = await waitingRoomGateway.createBlockSignature(activeGroupId, block_id, tenantKey);
    if (status > 299) {
      toast.error('Não foi possível gerar o link de compartilhamento');
      return;
    }
    const key = data.key as string;
    const queryRound = new URLSearchParams({ round });
    const query = new URLSearchParams({ p: `territorio/${territory_id}/quadra/${block_id}?${queryRound.toString()}`, s: key });
    const url = `${window.location.origin}/home?${query.toString()}`;
    const message = {
      title: '*DESIGNAÇÃO DE TERRITÓRIO*\n\nPrezado(a) publicador(a)',
      text: `*DESIGNAÇÃO DE TERRITÓRIO*\n\nSegue o link para a *${block?.blockName}* que você está designado(a) para pregar:`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(message);
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência');
    } catch {
      toast.error('Não foi possível compartilhar');
    }
  };

  const driverAction = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { element: '#overseer-image', popover: { title: 'Imagem', description: 'Aqui você encontra a imagem do território.' } },
        {
          element: '#publisher-gps',
          popover: { title: 'GPS', description: 'Clique aqui para abrir o GPS e ser direcionado para a localização da quadra.' },
        },
        {
          element: '#publisher-details',
          popover: { title: 'Detalhes', description: 'Visualize os detalhes do endereço e marque as casas nesta seção.' },
        },
      ],
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
    });
    driverObj.drive();
  };

  useEffect(() => {
    changeTheme();
  }, []);

  const needProfile = enabled && !!profile && !profile.firstName;
  const showPeers = enabled && !!profile?.firstName;

  return (
    <RootModeScreen mode={isLoading}>
      <HelpCircle
        onClick={driverAction}
        size={50}
        fill='current'
        role='img'
        aria-label='Ajuda'
        className='fixed bottom-0 right-0 z-10 m-4 mb-safe-bottom cursor-pointer fill-primary text-gray-50'
      />
      <div className={clsx('relative')}>
        <Header
          title={block?.blockName}
          subtitle='Marque as casas desta quadra.'
          onBack={() => router.push('/sala')}
          backLabel='Voltar para a sala'
          action={
            block.imageUrl && (
              <DialogMap
                inline
                title={block.territoryName}
              >
                <img className='h-full w-full object-cover object-center' src={block.imageUrl} alt='Imagem do Território' />
              </DialogMap>
            )
          }
        />
        <SubHeader
          title={`${block?.territoryName} - ${block?.blockName}`}
          action={
            <div className='flex items-center gap-1'>
              {showPeers && (
                <Drawer open={peersOpen} onOpenChange={setPeersOpen}>
                  <DrawerTrigger asChild>
                    <IconContainer
                      icon={<Users size={22} className='cursor-pointer text-gray-700' />}
                      ariaLabel='Ver publicadores nesta quadra'
                    />
                  </DrawerTrigger>
                  <DrawerContent id='peers_drawer_content' className='w-full bg-white'>
                    <div className='flex w-full items-center justify-between p-6 pb-safe-bottom'>
                      <h2 className='text-xl font-semibold text-primary-text'>Publicadores nesta quadra</h2>
                      <IconContainer
                        icon={<X size={22} className='cursor-pointer text-gray-600' />}
                        ariaLabel='Fechar'
                        onClick={() => setPeersOpen(false)}
                      />
                    </div>
                    <div className='flex max-h-[50vh] flex-col gap-2 overflow-y-auto p-6 pb-safe-bottom'>
                      {peers.length === 0 && (
                        <p className='text-sm text-muted'>Nenhum outro publicador presente no momento.</p>
                      )}
                      {peers.map((peer) => (
                        <PublisherCard
                          key={peer.identityKey}
                          primary={peer.firstName}
                          secondary={`**** ${peer.phoneLast4}`}
                        />
                      ))}
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
              <IconContainer
                icon={<Share2 size={22} className='cursor-pointer text-gray-700' onClick={() => void shareFromWaitingRoom()} />}
                ariaLabel='Compartilhar'
              />
            </div>
          }
        />
        <Body>
          <div className='flex h-full w-full flex-col p-4'>
            {needProfile && (
            <div className='flex flex-col gap-4 rounded-xl bg-gray-50 p-4 shadow-md'>
              <div>
                <h2 className='text-xl font-semibold text-primary-text'>Seu perfil</h2>
                <p className='text-sm text-muted'>Informe seus dados para entrar na sala de espera.</p>
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='block-first-name' className='text-sm text-muted'>Nome</label>
                <Input id='block-first-name' value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='Apenas o primeiro nome' />
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='block-phone-last4' className='text-sm text-muted'>Últimos 4 dígitos do celular</label>
                <Input
                  id='block-phone-last4'
                  value={phoneLast4}
                  onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder='0000'
                  inputMode='numeric'
                  maxLength={4}
                />
              </div>
              <Button.Root
                type='button'
                className='w-full'
                disabled={!firstName.trim() || phoneLast4.length !== 4}
                onClick={submitProfile}
              >
                Entrar
              </Button.Root>
            </div>
          )}
          {!needProfile && (
            <div className='flex flex-col gap-2 pb-20'>
              {block?.addresses?.map((address) => (
                <Street key={address.id} address={address} actions={actions} />
              ))}
            </div>
          )}
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}
