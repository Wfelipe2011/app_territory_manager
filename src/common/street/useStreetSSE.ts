import { useEffect, useRef } from 'react';

import type {
  IStreetAuthExpiredPayload,
  IStreetChangedPayload,
  IStreetConnectedPayload,
  IStreetErrorPayload,
  IStreetPresenceChangedPayload,
} from './type';

export type StreetSSEHandlers = {
  onConnected?: (payload: IStreetConnectedPayload) => void;
  onPresenceChanged?: (payload: IStreetPresenceChangedPayload) => void;
  onStreetChanged?: (payload: IStreetChangedPayload) => void;
  onAuthExpired?: (payload: IStreetAuthExpiredPayload) => void;
  onError?: (payload: IStreetErrorPayload | undefined) => void;
};

const parseData = (event: MessageEvent): unknown => {
  try {
    return JSON.parse(event.data);
  } catch {
    return undefined;
  }
};

export const useStreetSSE = (
  url: string | null,
  handlers: StreetSSEHandlers,
) => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!url) return;

    const es = new EventSource(url, { withCredentials: false });

    es.addEventListener('connected', (event) => {
      const payload = parseData(event as MessageEvent) as IStreetConnectedPayload | undefined;
      if (payload) handlersRef.current.onConnected?.(payload);
    });

    es.addEventListener('presence_changed', (event) => {
      const payload = parseData(event as MessageEvent) as IStreetPresenceChangedPayload | undefined;
      if (payload) handlersRef.current.onPresenceChanged?.(payload);
    });

    es.addEventListener('street_changed', (event) => {
      const payload = parseData(event as MessageEvent) as IStreetChangedPayload | undefined;
      if (payload) handlersRef.current.onStreetChanged?.(payload);
    });

    es.addEventListener('auth_expired', (event) => {
      const payload = parseData(event as MessageEvent) as IStreetAuthExpiredPayload | undefined;
      if (payload) handlersRef.current.onAuthExpired?.(payload);
      es.close();
    });

    es.addEventListener('error', (event) => {
      const payload = parseData(event as MessageEvent) as IStreetErrorPayload | undefined;
      handlersRef.current.onError?.(payload);
    });

    return () => {
      es.close();
    };
  }, [url]);
};
