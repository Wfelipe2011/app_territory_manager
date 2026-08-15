import { useRouter as useNavigation } from 'next/navigation';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2, Users } from 'react-feather';
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
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Mode, RootModeScreen } from '@/common/loading';
import { PublisherProfileDrawer } from '@/common/waitingRoom/components';
import {
  OverseerRoomResponse,
  PublisherRoomAssignment,
  PublisherRoomResponse,
  WaitingRoomAssignment,
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
  const { group_id } = query as { group_id: string };
  const [mode, setMode] = useState<Mode>('loading');
  const [room, setRoom] = useState<WaitingRoomResponse | null>(null);
  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [selectedPublisherId, setSelectedPublisherId] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');

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
    if (!group_id || !tenantKey) return;
    const { status, data } = await waitingRoomGateway.getRoom(group_id, tenantKey);
    if (status > 299) {
      setMode('not-found');
      return;
    }
    setRoom(data);
    setMode('screen');
  }, [group_id, tenantKey]);

  useEffect(() => {
    if (!group_id || !tenantKey) return;
    void getRoom();
    const poll = setInterval(() => void getRoom(), 30_000);
    return () => clearInterval(poll);
  }, [getRoom, group_id, tenantKey]);

  useEffect(() => {
    if (!group_id || !tenantKey) return;
    const heartbeat = setInterval(() => {
      void waitingRoomGateway.heartbeat(group_id, tenantKey);
    }, 30_000);
    return () => clearInterval(heartbeat);
  }, [group_id, tenantKey]);

  const sseUrl = useMemo(() => {
    if (!group_id || !tenantKey) return null;
    return `${URL_API}/realtime/waiting-room/${group_id}?s=${encodeURIComponent(tenantKey)}`;
  }, [group_id, tenantKey]);

  useWaitingRoomSSE(sseUrl, {
    onConnected: () => void getRoom(),
    onPresenceChanged: () => void getRoom(),
    onAssignmentsChanged: () => void getRoom(),
    onAuthExpired: () => window.location.reload(),
  });

  const back = () => {
    navigation.push('/sala');
  };

  const assign = async () => {
    if (!group_id || !tenantKey) return;
    if (room?.role !== 'overseer') return;
    if (!selectedPublisherId || !selectedBlockId) {
      toast.error('Selecione um publicador e uma quadra');
      return;
    }
    const { status } = await waitingRoomGateway.createAssignment(group_id, tenantKey, {
      publisherId: selectedPublisherId,
      blockId: selectedBlockId,
      territoryId: room.territoryId,
      round: room.round,
    });
    if (status > 299) {
      toast.error('Não foi possível atribuir a quadra');
      return;
    }
    toast.success('Quadra atribuída');
    setSelectedPublisherId('');
    setSelectedBlockId('');
    void getRoom();
  };

  const removeAssignment = async (assignment: WaitingRoomAssignment) => {
    if (!group_id || !tenantKey) return;
    const { status } = await waitingRoomGateway.removeAssignment(group_id, tenantKey, {
      publisherId: assignment.publisherId,
      blockId: assignment.blockId,
    });
    if (status > 299) {
      toast.error('Não foi possível remover a atribuição');
      return;
    }
    toast.success('Atribuição removida');
    void getRoom();
  };

  const enterBlock = async (assignment: PublisherRoomAssignment) => {
    if (!group_id || !tenantKey) return;
    const { status, data } = await waitingRoomGateway.createBlockSignature(group_id, assignment.blockId, tenantKey);
    if (status > 299) {
      toast.error('Não foi possível gerar o link da quadra');
      return;
    }
    const signatureKey = data.key as string;
    setActiveGroupId(group_id);
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
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-gray-700'>
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
          {room?.role === 'overseer' && (
            <OverseerView
              room={room}
              selectedPublisherId={selectedPublisherId}
              setSelectedPublisherId={setSelectedPublisherId}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
              onAssign={() => void assign()}
              onRemove={(assignment) => void removeAssignment(assignment)}
            />
          )}
          {room?.role === 'publisher' && <PublisherView room={room} onEnterBlock={(assignment) => void enterBlock(assignment)} />}
        </Body>
      </div>
    </RootModeScreen>
  );
}

function OverseerView({
  room,
  selectedPublisherId,
  setSelectedPublisherId,
  selectedBlockId,
  setSelectedBlockId,
  onAssign,
  onRemove,
}: {
  room: OverseerRoomResponse;
  selectedPublisherId: string;
  setSelectedPublisherId: (value: string) => void;
  selectedBlockId: string;
  setSelectedBlockId: (value: string) => void;
  onAssign: () => void;
  onRemove: (assignment: WaitingRoomAssignment) => void;
}) {
  const assignedByBlock = (blockId: string) => room.assignments.filter((assignment) => assignment.blockId === blockId);

  return (
    <div className='flex flex-col gap-6'>
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
            <button
              key={publisher.identityKey}
              type='button'
              onClick={() => setSelectedPublisherId(publisher.identityKey)}
              className={cn(
                'flex items-center justify-between rounded-xl border bg-white p-3 text-left shadow-sm',
                selectedPublisherId === publisher.identityKey ? 'border-primary' : 'border-gray-200'
              )}
            >
              <span className='font-medium text-gray-800'>
                {publisher.firstName} {publisher.lastName}
              </span>
              <span className='text-sm text-gray-500'>**** {publisher.phoneLast4}</span>
            </button>
          ))}
        </div>
      </section>

      <section className='flex flex-col gap-2'>
        <h3 className='text-lg font-semibold text-gray-800'>Atribuir quadra</h3>
        <Select value={selectedPublisherId} onValueChange={setSelectedPublisherId}>
          <SelectTrigger className='w-full bg-white'>
            <SelectValue placeholder='Selecione o publicador' />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            {room.publishers.map((publisher) => (
              <SelectItem key={publisher.identityKey} value={publisher.identityKey}>
                {publisher.firstName} {publisher.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedBlockId} onValueChange={setSelectedBlockId}>
          <SelectTrigger className='w-full bg-white'>
            <SelectValue placeholder='Selecione a quadra' />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            {room.blocks.map((block) => (
              <SelectItem key={block.id} value={block.id}>
                {block.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button.Root type='button' className='w-full text-white' onClick={onAssign}>
          Atribuir
        </Button.Root>
      </section>

      <section className='flex flex-col gap-3'>
        <h3 className='text-lg font-semibold text-gray-800'>Quadras do território</h3>
        {room.blocks.map((block) => {
          const assigned = assignedByBlock(block.id);
          return (
            <div key={block.id} className='rounded-xl border bg-white p-4 shadow-sm'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-gray-800'>{block.name}</span>
                <span className='text-sm text-gray-500'>
                  {assigned.length} atribuído{assigned.length === 1 ? '' : 's'}
                </span>
              </div>
              {assigned.length > 0 && (
                <div className='mt-2 flex flex-col gap-1'>
                  <p className='text-xs text-gray-400'>Toque para remover</p>
                  {assigned.map((assignment) => (
                    <button
                      key={assignment.id}
                      type='button'
                      onClick={() => onRemove(assignment)}
                      className='flex items-center justify-between rounded-md bg-gray-100 px-2 py-1.5 text-left'
                    >
                      <span className='text-sm text-gray-700'>
                        {assignment.firstName} {assignment.lastName}
                      </span>
                      <Trash2 size={14} className='text-red-500' />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
