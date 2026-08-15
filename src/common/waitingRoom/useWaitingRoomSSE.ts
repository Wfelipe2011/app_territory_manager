import { useEffect, useRef } from 'react';

import type {
  IWaitingRoomAssignmentsChangedPayload,
  IWaitingRoomAuthExpiredPayload,
  IWaitingRoomConnectedPayload,
  IWaitingRoomErrorPayload,
  IWaitingRoomPresenceChangedPayload,
} from './type';

export type WaitingRoomSSEHandlers = {
  onConnected?: (payload: IWaitingRoomConnectedPayload) => void;
  onPresenceChanged?: (payload: IWaitingRoomPresenceChangedPayload) => void;
  onAssignmentsChanged?: (payload: IWaitingRoomAssignmentsChangedPayload) => void;
  onAuthExpired?: (payload: IWaitingRoomAuthExpiredPayload) => void;
  onError?: (payload: IWaitingRoomErrorPayload | undefined) => void;
};

const parseData = (event: MessageEvent): unknown => {
  try {
    return JSON.parse(event.data);
  } catch {
    return undefined;
  }
};

export const useWaitingRoomSSE = (url: string | null, handlers: WaitingRoomSSEHandlers) => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!url) return;

    const es = new EventSource(url, { withCredentials: false });

    es.addEventListener('connected', (event) => {
      const payload = parseData(event as MessageEvent) as IWaitingRoomConnectedPayload | undefined;
      if (payload) handlersRef.current.onConnected?.(payload);
    });

    es.addEventListener('presence_changed', (event) => {
      const payload = parseData(event as MessageEvent) as IWaitingRoomPresenceChangedPayload | undefined;
      if (payload) handlersRef.current.onPresenceChanged?.(payload);
    });

    es.addEventListener('assignments_changed', (event) => {
      const payload = parseData(event as MessageEvent) as IWaitingRoomAssignmentsChangedPayload | undefined;
      if (payload) handlersRef.current.onAssignmentsChanged?.(payload);
    });

    es.addEventListener('auth_expired', (event) => {
      const payload = parseData(event as MessageEvent) as IWaitingRoomAuthExpiredPayload | undefined;
      if (payload) handlersRef.current.onAuthExpired?.(payload);
      es.close();
    });

    es.addEventListener('error', (event) => {
      const payload = parseData(event as MessageEvent) as IWaitingRoomErrorPayload | undefined;
      handlersRef.current.onError?.(payload);
    });

    return () => {
      es.close();
    };
  }, [url]);
};
