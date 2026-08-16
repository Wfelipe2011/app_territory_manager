import jwt_decode from 'jwt-decode';
import { useRouter as useNavigation } from 'next/router';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useState } from 'react';
import { Users } from 'react-feather';
import toast from 'react-hot-toast';

import {
  getOrCreatePublisherProfile,
  getTenantSignatureKey,
  savePublisherProfile,
  setActiveGroupId,
  setTenantSignatureKey,
} from '@/lib/helper';
import { PublisherProfile } from '@/lib/helper';

import { Input } from '@/components/ui/input';

import { Mode, RootModeScreen } from '@/common/loading';
import { PublisherAvatar, PublisherCard, PublisherProfileDrawer } from '@/common/waitingRoom/components';
import { WaitingRoomGroup } from '@/common/waitingRoom/type';
import { env } from '@/constant';
import { waitingRoomGateway } from '@/infra/Gateway/WaitingRoomGateway';
import { Body, Button, Header } from '@/ui';

function getRoundFromCookies(): number | undefined {
  const cookies = parseCookies();
  const round = cookies[env.storage.round];
  if (round) {
    const parsed = Number(round);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const roundInfo = cookies['roundInfo'];
  if (roundInfo) {
    try {
      const parsed = JSON.parse(roundInfo) as { roundNumber?: number };
      return parsed?.roundNumber;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export default function Sala() {
  const navigation = useNavigation();
  const { query } = useRouter();
  const [mode, setMode] = useState<Mode>('loading');
  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [groups, setGroups] = useState<WaitingRoomGroup[]>([]);
  const [isOverseer, setIsOverseer] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');

  const tenantKey = getTenantSignatureKey() || parseCookies()[env.storage.signatureId] || '';

  const loadGroups = useCallback(async (key: string) => {
    const { status, data } = await waitingRoomGateway.getGroups(key);
    if (status > 299) {
      setMode('not-found');
      return;
    }
    setGroups(data);
    setMode('screen');
  }, []);

  useEffect(() => {
    setProfile(getOrCreatePublisherProfile());
  }, []);

  useEffect(() => {
    const cookies = parseCookies();
    const key = getTenantSignatureKey() || cookies[env.storage.signatureId] || '';
    if (!key) {
      const signature = query['s'] as string | undefined;
      navigation.push(`/home?p=sala${signature ? `&s=${signature}` : ''}`);
      return;
    }
    if (!getTenantSignatureKey()) setTenantSignatureKey(key);
    const token = cookies[env.storage.token];
    let isOverseerCookie = false;
    if (token) {
      try {
        const decoded = jwt_decode<{ roles?: string[] }>(token);
        isOverseerCookie = !!decoded?.roles?.includes('overseer');
      } catch {
        isOverseerCookie = !!cookies[env.storage.territoryId];
      }
    } else {
      isOverseerCookie = !!cookies[env.storage.territoryId];
    }
    setIsOverseer(isOverseerCookie);
    if (profile?.firstName) {
      void loadGroups(key);
    } else {
      setMode('screen');
    }
  }, [loadGroups, navigation, profile?.firstName, query]);

  const submitProfile = () => {
    if (!profile) return;
    const updated: PublisherProfile = {
      ...profile,
      firstName: firstName.trim(),
      phoneLast4,
    };
    savePublisherProfile(updated);
    setProfile(updated);
  };

  const joinGroup = async (groupId: string) => {
    if (!tenantKey) return;
    setJoiningGroupId(groupId);
    const body: { firstName?: string; phoneLast4?: string; territoryId?: number; round?: number } = {};
    if (isOverseer) {
      const territoryId = Number(parseCookies()[env.storage.territoryId]);
      if (territoryId) body.territoryId = territoryId;
      const round = getRoundFromCookies();
      if (round) body.round = round;
    } else if (profile) {
      body.firstName = profile.firstName;
      body.phoneLast4 = profile.phoneLast4;
    }
    const { status, data } = await waitingRoomGateway.joinGroup(groupId, tenantKey, body);
    setJoiningGroupId(null);
    if (status > 299) {
      toast.error('Não foi possível entrar no grupo');
      return;
    }
    setActiveGroupId(data.groupId);
    navigation.push(`/sala/${data.groupId}`);
  };

  return (
    <RootModeScreen mode={mode}>
      <div className='relative'>
        <Header
          title='Sala de Espera'
          subtitle={isOverseer ? 'Entre no grupo para gerenciar as atribuições' : 'Escolha um grupo para ver suas quadras'}
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
          {profile && !profile.firstName ? (
            <div className='flex flex-col gap-4 rounded-xl bg-gray-50 p-6 shadow-md'>
              <div>
                <h2 className='text-xl font-semibold text-primary-text'>Seu perfil</h2>
                <p className='text-sm text-muted'>Informe seus dados para entrar na sala de espera.</p>
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='profile-first-name' className='text-sm text-primary-text'>
                  Nome
                </label>
                <Input
                  id='profile-first-name'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder='Apenas o primeiro nome'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='profile-phone-last4' className='text-sm text-primary-text'>
                  Últimos 4 dígitos do celular
                </label>
                <Input
                  id='profile-phone-last4'
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
          ) : (
            <div className='flex flex-col gap-3'>
              <h2 className='text-xl font-semibold text-primary-text'>Escolha um grupo</h2>
              {groups.length === 0 && (
                <p className='text-sm text-muted'>
                  {isOverseer
                    ? 'Nenhum grupo criado ainda. Crie grupos no painel do admin.'
                    : 'Nenhum grupo ativo no momento.'}
                </p>
              )}
              {groups.map((group) => (
                <PublisherCard
                  key={group.id}
                  primary={group.name}
                  secondary={
                    isOverseer ? (
                      <span className={group.active ? 'text-green-600' : 'text-muted'}>
                        {group.active ? 'Ativo' : 'Inativo'} · {group.publishers} publicador
                        {group.publishers === 1 ? '' : 'es'}
                      </span>
                    ) : (
                      <span className='flex items-center gap-1'>
                        <Users size={14} aria-hidden='true' />
                        {group.publishers} publicador{group.publishers === 1 ? '' : 'es'}
                      </span>
                    )
                  }
                  trailing={
                    <Button.Root
                      type='button'
                      size='sm'
                      className='!w-fit'
                      disabled={joiningGroupId === group.id}
                      onClick={() => void joinGroup(group.id)}
                    >
                      {isOverseer && !group.active ? 'Ativar grupo' : 'Entrar no grupo'}
                    </Button.Root>
                  }
                />
              ))}
            </div>
          )}
        </Body>
      </div>
    </RootModeScreen>
  );
}
