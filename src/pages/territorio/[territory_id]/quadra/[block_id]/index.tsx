/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';
import { driver } from 'driver.js';
import jwt_decode from 'jwt-decode';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, HelpCircle, Share2, Users, X } from 'react-feather';
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
import type { WaitingRoomPublisher } from '@/common/waitingRoom/type';
import { useWaitingRoomSSE } from '@/common/waitingRoom/useWaitingRoomSSE';
import { env } from '@/constant';
import { waitingRoomGateway } from '@/infra/Gateway/WaitingRoomGateway';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { Body, Button, Header } from '@/ui';

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
  const [lastName, setLastName] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState<WaitingRoomPublisher[]>([]);
  const [peersOpen, setPeersOpen] = useState(false);

  const enabled = !!groupId && !!blockKey;

  useEffect(() => {
    setProfile(getOrCreatePublisherProfile());
  }, []);

  const joinRoom = useCallback(async () => {
    if (!groupId || !blockKey || !profile) return;
    const { status } = await waitingRoomGateway.joinGroup(groupId, blockKey, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneLast4: profile.phoneLast4,
    });
    if (status <= 299) setJoined(true);
  }, [blockKey, groupId, profile]);

  useEffect(() => {
    if (!enabled || !profile?.firstName || joined) return;
    void joinRoom();
  }, [enabled, joinRoom, joined, profile?.firstName]);

  const getPeers = useCallback(async () => {
    if (!groupId || !blockKey) return;
    const { status, data } = await waitingRoomGateway.getRoom(groupId, blockKey);
    if (status > 299) {
      setPeers([]);
      return;
    }
    if (data?.role === 'publisher') setPeers(data.peers ?? []);
  }, [blockKey, groupId]);

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
      lastName: lastName.trim(),
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
        className='text-gray-50 z-10 cursor-pointer fixed bottom-0 right-0 m-4 fill-primary'
      />
      <div className={clsx('relative')}>
        {block.imageUrl && (
          <DialogMap
            title={block.territoryName}
          >
            <img className='h-full w-full object-cover object-center' src={block.imageUrl} alt='Imagem do Território' />
          </DialogMap>
        )}
        <Header>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex w-full items-center gap-2'>
              <IconContainer
                icon={<ArrowLeft size={22} className='cursor-pointer text-primary' onClick={() => router.push('/sala')} />}
              />
              <div>
                <h1 className='flex items-center text-xl font-semibold'>Olá Publicador(a),</h1>
                <p className='text-gray-700'>Preencha as casas da quadra onde voce falou!</p>
              </div>
            </div>
            <hr className='my-2 w-1/2 h-0.5 bg-gray-800' />
            <div className='flex w-full items-center justify-between'>
              <div>
                <h4 className='text-xl font-semibold text-gray-700'>{block?.territoryName}</h4>
                <h5 className='text-xl font-semibold text-gray-700'>{block?.blockName}</h5>
              </div>
              <div className='flex items-center gap-1'>
                {showPeers && (
                  <Drawer open={peersOpen} onOpenChange={setPeersOpen}>
                    <DrawerTrigger asChild>
                      <IconContainer
                        icon={<Users size={22} className='cursor-pointer text-gray-700' />}
                      />
                    </DrawerTrigger>
                    <DrawerContent id='peers_drawer_content' className='w-full bg-white'>
                      <div className='flex w-full items-center justify-between px-6 pt-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>Publicadores nesta quadra</h3>
                        <X className='cursor-pointer text-gray-600' onClick={() => setPeersOpen(false)} />
                      </div>
                      <div className='flex max-h-[50vh] flex-col gap-2 overflow-y-auto px-6 py-4'>
                        {peers.length === 0 && (
                          <p className='text-sm text-gray-600'>Nenhum outro publicador presente no momento.</p>
                        )}
                        {peers.map((peer) => (
                          <div
                            key={peer.identityKey}
                            className='flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm'
                          >
                            <span className='font-medium text-gray-800'>
                              {peer.firstName} {peer.lastName}
                            </span>
                            <span className='text-sm text-gray-500'>**** {peer.phoneLast4}</span>
                          </div>
                        ))}
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
                <IconContainer
                  icon={<Share2 size={22} className='cursor-pointer text-gray-700' onClick={() => void shareFromWaitingRoom()} />}
                />
              </div>
            </div>
          </div>
        </Header>
        <Body>
          <div className='h-6 w-full'></div>
          {needProfile && (
            <div className='flex flex-col gap-4 rounded-xl bg-gray-50 p-4 shadow-xl'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>Seu perfil</h3>
                <p className='text-sm text-gray-600'>Informe seus dados para entrar na sala de espera.</p>
              </div>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='Nome' />
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Sobrenome' />
              <Input
                value={phoneLast4}
                onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder='Últimos 4 dígitos do celular'
                inputMode='numeric'
                maxLength={4}
              />
              <Button.Root
                type='button'
                className='w-full text-white'
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
        </Body>
      </div>
    </RootModeScreen>
  );
}
