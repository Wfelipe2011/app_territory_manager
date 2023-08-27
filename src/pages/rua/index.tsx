import clsx from 'clsx';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { ArrowLeft, Users } from 'react-feather';
import { io, Manager } from 'socket.io-client';

import { HouseComponent, IMessage, Subtitle, useStreet } from '@/common/street';
import { env } from '@/constant';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { Body, Button, Header } from '@/ui';
const urlSocket = URL_API.replace('https', 'wss').replace('/v1', '');

const { token, signatureId } = env.storage;
const { [token]: tokenCookies, [signatureId]: signature } = parseCookies();

const makeUUid = () => {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

const newUuid = makeUUid();
const useSocket = (
  room: string,
  events?: { name: string; cb: (...p: any) => any }[]
) => {
  const ONE_MINUTE = 60 * 1000;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const manager = new Manager(urlSocket, {
    transports: ['websocket'],
    query: {
      key: signature,
    },
    autoConnect: false,
    reconnectionDelay: ONE_MINUTE,
    reconnectionDelayMax: ONE_MINUTE,
    reconnectionAttempts: 2,
  });
  const socket = manager.socket('/', {
    auth: {
      token: `Bearer ${tokenCookies}`,
    },
  });
  const [connections, setConnections] = useState<number>(0);

  useEffect(() => {
    manager.connect();
    socket.on('connect', () => {
      console.log('connect here');
      socket.emit('join', {
        roomName: room,
        userName: newUuid,
      });
    });

    socket.on('disconnect', () => {
      console.log('disconnect');
    });

    // socket.on(`room-${room}`, (message: IMessage) => {
    //   if (message.type === 'update_house')
    //     actions.markBySocket({ data: message.data, type: message.type });
    //   if (message.type === 'user_joined')
    //     setConnections(message.data.userCount);
    //   if (message.type === 'user_left') setConnections(message.data.userCount);
    // });

    if (events)
      events.forEach(({ name, cb }) => {
        socket.on(name, cb);
      });
  }, [room, socket, events, manager]);

  const killManager = () => {
    manager._destroy(socket);
    manager.off();
  };

  return { socket, connections, setConnections, killManager };
};

export default function StreetData() {
  const { query } = useRouter();
  const addressId = query.a;
  const blockId = query.b;
  const territoryId = query.t;
  const room = `${String(territoryId)}-${String(blockId)}-${String(addressId)}`;
  const { socket, connections, setConnections, killManager } = useSocket(room, [
    {
      name: `room-${room}`,
      cb: (message: IMessage) => {
        if (message.type === 'update_house')
          actions.markBySocket({ data: message.data, type: message.type });
        if (message.type === 'user_joined')
          setConnections(message.data.userCount);
        if (message.type === 'user_left')
          setConnections(message.data.userCount);
      },
    },
  ]);
  // const socket = io(urlSocket, {
  //   transports: ['websocket'],
  //   auth: {
  //     token: `Bearer ${tokenCookies}`,
  //   },
  //   query: {
  //     key: signature,
  //   },
  // });
  // const [connections, setConnections] = useState<number>(0);
  const { street, actions } = useStreet(
    Number(addressId),
    Number(blockId),
    Number(territoryId)
  );
  const navigate = useNavigate();

  const back = () => {
    socket.disconnect();
    socket.close();
    socket.off();
    killManager();
    navigate.back();
  };

  const widthScreen = window.innerWidth;
  const columnsByWidth = () => {
    if (widthScreen > 800) return 8;
    if (widthScreen > 700) return 7;
    if (widthScreen > 600) return 6;
    if (widthScreen > 500) return 5;
    if (widthScreen > 400) return 4;
    if (widthScreen > 300) return 3;
    return 2;
  };

  return (
    <div className={clsx('relative')}>
      <Header size='small'>
        <Button.Root
          className='absolute left-2 !w-fit !p-2 !shadow-none'
          variant='ghost'
          onClick={back}
        >
          <ArrowLeft />
        </Button.Root>
        <h1 className='text-2xl font-bold'>{street.streetName}</h1>
      </Header>
      <Body className='px-6 py-2'>
        <div className='flex items-end justify-between'>
          <div className='flex h-full items-center'>
            <h6 className='pt-4 text-xl font-semibold'>CASAS</h6>
          </div>
          {connections ? (
            <div className='flex items-center justify-center gap-2'>
              {connections}
              <Users size={20} fill='#9EE073' color='#9EE073' />
            </div>
          ) : null}
        </div>
        <div
          className='mt-4 grid'
          style={{
            gridTemplateColumns: `repeat(${columnsByWidth()}, minmax(0, 1fr))`,
          }}
        >
          {street.houses.map((house) => (
            <HouseComponent house={house} actions={actions} key={house.id} />
          ))}
        </div>
        {street.houses?.length ? <Subtitle /> : null}
      </Body>
    </div>
  );
}
