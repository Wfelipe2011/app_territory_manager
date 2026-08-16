import { useRouter as useNavigation } from 'next/router';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Users } from 'react-feather';
import toast from 'react-hot-toast';

import {
  getOrCreatePublisherProfile,
  getTenantSignatureKey,
  setActiveGroupId,
  setTenantSignatureKey,
} from '@/lib/helper';
import { PublisherProfile } from '@/lib/helper';
import { getSignatureHandshake, saveSignatureCookies } from '@/lib/signatureHandshake';

import { Mode, RootModeScreen } from '@/common/loading';
import { PublisherAvatar, PublisherCard, PublisherProfileDrawer } from '@/common/waitingRoom/components';
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
        <Header
          title={room?.group?.name ?? 'Sala de Espera'}
          subtitle={
            <span className='flex items-center gap-2'>
              {room?.group?.active && (
                <span className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700'>
                  <span className='h-1.5 w-1.5 rounded-full bg-green-600' />
                  Grupo ativo
                </span>
              )}
              {room?.role === 'overseer' ? 'Você está dirigindo esta sala' : 'Aguarde as atribuições do dirigente'}
            </span>
          }
          onBack={back}
          backLabel='Voltar para a sala'
          action={
            profile && (
              <PublisherProfileDrawer
                profile={profile}
                onSave={setProfile}
                trigger={<PublisherAvatar profile={profile} />}
              />
            )
          }
        />
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
      <PublisherCard
        primary={room.territoryName}
        secondary={
          <span className='flex items-center gap-1'>
            <Users size={14} aria-hidden='true' />
            {room.publishers.length} publicador{room.publishers.length === 1 ? '' : 'es'} na sala
          </span>
        }
        trailing={
          <Button.Root type='button' size='sm' className='!w-fit' onClick={onGoToTerritory}>
            Ver quadras do território
          </Button.Root>
        }
      />
      <section className='flex flex-col gap-3'>
        <h2 className='flex items-center gap-2 text-xl font-semibold text-primary-text'>
          Publicadores na sala
          <span className='flex items-center gap-1 text-sm font-normal text-muted'>
            <Users size={14} aria-hidden='true' />
            {room.publishers.length}
          </span>
        </h2>
        {room.publishers.length === 0 && (
          <p className='text-sm text-muted'>Nenhum publicador presente no momento.</p>
        )}
        <div className='flex flex-col gap-2'>
          {room.publishers.map((publisher) => (
            <PublisherCard
              key={publisher.identityKey}
              primary={publisher.firstName}
              secondary={`**** ${publisher.phoneLast4}`}
            />
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
      <h2 className='text-xl font-semibold text-primary-text'>Minhas quadras</h2>
      {room.assignments.length === 0 && (
        <p className='text-sm text-muted'>Você ainda não recebeu nenhuma quadra. Aguarde o dirigente atribuir.</p>
      )}
      {room.assignments.map((assignment) => (
        <PublisherCard
          key={assignment.id}
          primary={assignment.blockName}
          secondary={`Rodada ${assignment.round}`}
          onClick={() => onEnterBlock(assignment)}
          trailing={<ArrowRight className='text-primary' aria-hidden='true' />}
          ariaLabel={`Abrir quadra ${assignment.blockName}`}
        />
      ))}
    </div>
  );
}
