import { useRouter as useNavigation } from 'next/router';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Users } from 'react-feather';
import toast from 'react-hot-toast';

import {
  getOrCreatePublisherProfile,
  getPublisherInitials,
  getTenantSignatureKey,
  setActiveGroupId,
  setTenantSignatureKey,
} from '@/lib/helper';
import { PublisherProfile } from '@/lib/helper';
import { getSignatureHandshake, saveSignatureCookies } from '@/lib/signatureHandshake';

import { Mode, RootModeScreen } from '@/common/loading';
import { PublisherProfileDrawer } from '@/common/waitingRoom/components';
import {
  OverseerRoomResponse,
  PublisherRoomAssignment,
  PublisherRoomResponse,
  WaitingRoomResponse,
} from '@/common/waitingRoom/type';
import { useWaitingRoomSSE } from '@/common/waitingRoom/useWaitingRoomSSE';
import { env } from '@/constant';
import { waitingRoomGateway } from '@/infra/Gateway/WaitingRoomGateway';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { Body, Button, Header } from '@/ui';

export default function WaitingRoomGroupPage() {
  const navigation = useNavigation();
  const { query } = useRouter();
  const { groupId } = query as { groupId: string };
  const [mode, setMode] = useState<Mode>('loading');
  const [room, setRoom] = useState<WaitingRoomResponse | null>(null);
  const [profile, setProfile] = useState<PublisherProfile | null>(null);

  const tenantKey = getTenantSignatureKey() || parseCookies()[env.storage.signatureId] || '';

  useEffect(() => {
    setProfile(getOrCreatePublisherProfile());
  }, []);

  useEffect(() => {
    if (!tenantKey) {
      navigation.push('/home?p=sala');
      return;
    }
    if (!getTenantSignatureKey()) setTenantSignatureKey(tenantKey);
  }, [navigation, tenantKey]);

  const getRoom = useCallback(async () => {
    if (!groupId || !tenantKey) return;
    const { status, data } = await waitingRoomGateway.getRoom(groupId, tenantKey);
    if (status > 299) {
      setMode('not-found');
      return;
    }
    setRoom(data);
    setMode('screen');
  }, [groupId, tenantKey]);

  useEffect(() => {
    if (!groupId || !tenantKey) return;
    void getRoom();
  }, [getRoom, groupId, tenantKey]);

  useEffect(() => {
    if (!groupId || !tenantKey) return;
    const heartbeat = setInterval(() => {
      void waitingRoomGateway.heartbeat(groupId, tenantKey);
    }, 30_000);
    return () => clearInterval(heartbeat);
  }, [groupId, tenantKey]);

  const sseUrl = useMemo(() => {
    if (!groupId || !tenantKey) return null;
    return `${URL_API}/realtime/waiting-room/${groupId}?s=${encodeURIComponent(tenantKey)}`;
  }, [groupId, tenantKey]);

  useWaitingRoomSSE(sseUrl, {
    onConnected: () => void getRoom(),
    onPresenceChanged: () => void getRoom(),
    onAssignmentsChanged: () => void getRoom(),
    onAuthExpired: () => window.location.reload(),
  });

  const back = () => {
    navigation.push('/sala');
  };

  const goToTerritory = () => {
    if (room?.role !== 'overseer') return;
    navigation.push(`/territorio/${room.territoryId}?round=${room.round}`);
  };

  const enterBlock = async (assignment: PublisherRoomAssignment) => {
    if (!groupId || !tenantKey) return;
    const { status, data } = await waitingRoomGateway.createBlockSignature(groupId, assignment.blockId, tenantKey);
    if (status > 299) {
      toast.error('Não foi possível gerar o link da quadra');
      return;
    }
    const signatureKey = data.key as string;
    setActiveGroupId(groupId);
    const handshake = await getSignatureHandshake(signatureKey);
    if (handshake.status > 299 || !handshake.data) {
      toast.error('Link da quadra inválido. Tente novamente.');
      return;
    }
    saveSignatureCookies(signatureKey, handshake.data);
    navigation.push(`/territorio/${assignment.territoryId}/quadra/${assignment.blockId}?round=${assignment.round}`);
  };

  return (
    <RootModeScreen mode={mode}>
      <div className='relative'>
        <Header size='small'>
          <Button.Root className='absolute left-2 !w-fit !p-2 !shadow-none' variant='ghost' onClick={back}>
            <ArrowLeft />
          </Button.Root>
          <div className='flex w-full items-center justify-between pl-10'>
            <div className='flex flex-col'>
              <h1 className='text-xl font-semibold text-gray-800'>{room?.group?.name ?? 'Sala de Espera'}</h1>
              <p className='text-sm text-gray-600'>
                {room?.role === 'overseer' ? 'Você está dirigindo esta sala' : 'Aguarde as atribuições do dirigente'}
              </p>
            </div>
            {profile && (
              <PublisherProfileDrawer
                profile={profile}
                onSave={setProfile}
                trigger={
                  <div className='flex cursor-pointer items-center gap-2 rounded-full bg-gray-50 px-2 py-1'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-gray-700'>
                      {getPublisherInitials(profile)}
                    </span>
                    <span className='hidden flex-col mini:flex'>
                      <span className='text-sm font-medium text-gray-800'>
                        {profile.firstName} {profile.lastName}
                      </span>
                      <span className='text-xs text-gray-500'>**** {profile.phoneLast4}</span>
                    </span>
                  </div>
                }
              />
            )}
          </div>
        </Header>
        <Body className='p-4'>
          {room?.role === 'overseer' && <OverseerView room={room} onGoToTerritory={goToTerritory} />}
          {room?.role === 'publisher' && <PublisherView room={room} onEnterBlock={(assignment) => void enterBlock(assignment)} />}
        </Body>
      </div>
    </RootModeScreen>
  );
}

function OverseerView({ room, onGoToTerritory }: { room: OverseerRoomResponse; onGoToTerritory: () => void }) {
  return (
    <div className='flex flex-col gap-6'>
      <Button.Root type='button' className='w-full text-white' onClick={onGoToTerritory}>
        Ver quadras do território
      </Button.Root>
      <section className='flex flex-col gap-2'>
        <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-800'>
          Publicadores na sala
          <span className='flex items-center gap-1 text-sm font-normal text-gray-500'>
            <Users size={14} />
            {room.publishers.length}
          </span>
        </h3>
        {room.publishers.length === 0 && <p className='text-sm text-gray-600'>Nenhum publicador presente no momento.</p>}
        <div className='flex flex-col gap-2'>
          {room.publishers.map((publisher) => (
            <div
              key={publisher.identityKey}
              className='flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm'
            >
              <span className='font-medium text-gray-800'>
                {publisher.firstName} {publisher.lastName}
              </span>
              <span className='text-sm text-gray-500'>**** {publisher.phoneLast4}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PublisherView({
  room,
  onEnterBlock,
}: {
  room: PublisherRoomResponse;
  onEnterBlock: (assignment: PublisherRoomAssignment) => void;
}) {
  return (
    <div className='flex flex-col gap-3'>
      <h3 className='text-lg font-semibold text-gray-800'>Minhas quadras</h3>
      {room.assignments.length === 0 && (
        <p className='text-sm text-gray-600'>Você ainda não recebeu nenhuma quadra. Aguarde o dirigente atribuir.</p>
      )}
      {room.assignments.map((assignment) => (
        <button
          key={assignment.id}
          type='button'
          onClick={() => onEnterBlock(assignment)}
          className='flex items-center justify-between rounded-xl border bg-white p-4 text-left shadow-sm'
        >
          <div className='flex flex-col'>
            <span className='font-medium text-gray-800'>{assignment.blockName}</span>
            <span className='text-sm text-gray-500'>Rodada {assignment.round}</span>
          </div>
          <ArrowRight className='text-primary' />
        </button>
      ))}
    </div>
  );
}
