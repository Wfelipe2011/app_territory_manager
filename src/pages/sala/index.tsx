import jwt_decode from 'jwt-decode';
import { useRouter as useNavigation } from 'next/router';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useState } from 'react';
import { Users } from 'react-feather';
import toast from 'react-hot-toast';

import {
  getOrCreatePublisherProfile,
  getPublisherInitials,
  getTenantSignatureKey,
  savePublisherProfile,
  setActiveGroupId,
  setTenantSignatureKey,
} from '@/lib/helper';
import { PublisherProfile } from '@/lib/helper';

import { Input } from '@/components/ui/input';

import { Mode, RootModeScreen } from '@/common/loading';
import { PublisherProfileDrawer } from '@/common/waitingRoom/components';
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
  const [lastName, setLastName] = useState('');
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
      lastName: lastName.trim(),
      phoneLast4,
    };
    savePublisherProfile(updated);
    setProfile(updated);
  };

  const joinGroup = async (groupId: string) => {
    if (!tenantKey) return;
    setJoiningGroupId(groupId);
    const body: { firstName?: string; lastName?: string; phoneLast4?: string; territoryId?: number; round?: number } = {};
    if (isOverseer) {
      const territoryId = Number(parseCookies()[env.storage.territoryId]);
      if (territoryId) body.territoryId = territoryId;
      const round = getRoundFromCookies();
      if (round) body.round = round;
    } else if (profile) {
      body.firstName = profile.firstName;
      body.lastName = profile.lastName;
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
        <Header size='small'>
          <div className='flex w-full items-center justify-between gap-2'>
            <div className='flex flex-col'>
              <h1 className='text-xl font-semibold text-gray-800'>Sala de Espera</h1>
              <p className='text-sm text-gray-600'>
                {isOverseer ? 'Entre no grupo para gerenciar as atribuições' : 'Escolha um grupo para ver suas quadras'}
              </p>
            </div>
            {profile && (
              <PublisherProfileDrawer
                profile={profile}
                onSave={setProfile}
                trigger={
                  <button
                    type='button'
                    className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-gray-700'
                  >
                    {getPublisherInitials(profile)}
                  </button>
                }
              />
            )}
          </div>
        </Header>
        <Body className='p-4'>
          {profile && !profile.firstName ? (
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
          ) : (
            <div className='flex flex-col gap-3'>
              <h3 className='text-lg font-semibold text-gray-800'>Escolha um grupo</h3>
              {groups.length === 0 && (
                <p className='text-sm text-gray-600'>
                  {isOverseer
                    ? 'Nenhum grupo criado ainda. Crie grupos no painel do admin.'
                    : 'Nenhum grupo ativo no momento.'}
                </p>
              )}
              {groups.map((group) => (
                <div key={group.id} className='flex items-center justify-between gap-2 rounded-xl border bg-white p-4 shadow-sm'>
                  <div className='flex flex-col'>
                    <span className='font-medium text-gray-800'>{group.name}</span>
                    {isOverseer ? (
                      <span className={`text-sm ${group.active ? 'text-green-600' : 'text-gray-500'}`}>
                        {group.active ? 'Ativo' : 'Inativo'} · {group.publishers} publicador
                        {group.publishers === 1 ? '' : 'es'}
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 text-sm text-gray-500'>
                        <Users size={14} />
                        {group.publishers} publicador{group.publishers === 1 ? '' : 'es'}
                      </span>
                    )}
                  </div>
                  <Button.Root
                    type='button'
                    className='!w-fit text-white'
                    disabled={joiningGroupId === group.id}
                    onClick={() => void joinGroup(group.id)}
                  >
                    {isOverseer && !group.active ? 'Ativar grupo' : 'Entrar no grupo'}
                  </Button.Root>
                </div>
              ))}
            </div>
          )}
        </Body>
      </div>
    </RootModeScreen>
  );
}
