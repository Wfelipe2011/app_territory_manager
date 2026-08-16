import { parseCookies } from 'nookies';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getActiveGroupId, getTenantSignatureKey } from '@/lib/helper';

import { env } from '@/constant';
import { waitingRoomGateway } from '@/infra/Gateway/WaitingRoomGateway';
import { URL_API } from '@/infra/http/AxiosAdapter';

import { WaitingRoomAssignment, WaitingRoomPublisher, WaitingRoomResponse } from './type';
import { useWaitingRoomSSE } from './useWaitingRoomSSE';

type AssignFn = (publisherId: string, blockId: string) => Promise<boolean>;
type RemoveFn = (publisherId: string, blockId: string) => Promise<boolean>;

type WaitingRoomHandlers = {
  onConnected?: () => void;
  onPresenceChanged?: () => void;
  onAssignmentsChanged?: () => void;
  onBlockUpdated?: () => void;
};

export function useWaitingRoomRoom(handlers?: WaitingRoomHandlers) {
  const [room, setRoom] = useState<WaitingRoomResponse | null>(null);

  const groupId = getActiveGroupId();
  const tenantKey = getTenantSignatureKey() || parseCookies()[env.storage.signatureId] || '';
  const active = !!groupId && !!tenantKey;

  const getRoom = useCallback(async () => {
    if (!groupId || !tenantKey) return;
    const { status, data } = await waitingRoomGateway.getRoom(groupId, tenantKey);
    if (status > 299) return;
    setRoom(data);
  }, [groupId, tenantKey]);

  useEffect(() => {
    if (!groupId || !tenantKey) return;
    void getRoom();
    const heartbeat = setInterval(() => {
      void waitingRoomGateway.heartbeat(groupId, tenantKey);
    }, 30_000);
    return () => clearInterval(heartbeat);
  }, [getRoom, groupId, tenantKey]);

  const sseUrl = useMemo(() => {
    if (!groupId || !tenantKey) return null;
    return `${URL_API}/realtime/waiting-room/${groupId}?s=${encodeURIComponent(tenantKey)}`;
  }, [groupId, tenantKey]);

  useWaitingRoomSSE(sseUrl, {
    onConnected: () => {
      void getRoom();
      handlers?.onConnected?.();
    },
    onPresenceChanged: () => {
      void getRoom();
      handlers?.onPresenceChanged?.();
    },
    onAssignmentsChanged: () => {
      void getRoom();
      handlers?.onAssignmentsChanged?.();
    },
    onBlockUpdated: () => handlers?.onBlockUpdated?.(),
  });

  const assign: AssignFn = useCallback(
    async (publisherId, blockId) => {
      if (!groupId || !tenantKey || !room || room.role !== 'overseer') return false;
      const { status } = await waitingRoomGateway.createAssignment(groupId, tenantKey, {
        publisherId,
        blockId,
        territoryId: room.territoryId,
        round: room.round,
      });
      if (status > 299) return false;
      void getRoom();
      return true;
    },
    [getRoom, groupId, room, tenantKey]
  );

  const removeAssignment: RemoveFn = useCallback(
    async (publisherId, blockId) => {
      if (!groupId || !tenantKey) return false;
      const { status } = await waitingRoomGateway.removeAssignment(groupId, tenantKey, {
        publisherId,
        blockId,
      });
      if (status > 299) return false;
      void getRoom();
      return true;
    },
    [getRoom, groupId, tenantKey]
  );

  const publishers: WaitingRoomPublisher[] = room?.role === 'overseer' ? room.publishers : [];
  const assignments: WaitingRoomAssignment[] = room?.role === 'overseer' ? room.assignments : [];

  return { room, active, publishers, assignments, assign, removeAssignment, getRoom };
}
