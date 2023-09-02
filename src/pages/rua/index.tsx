import clsx from 'clsx';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { ArrowLeft, Users } from 'react-feather';
import { io, Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

import { Mode, RootModeScreen } from '@/common/loading';
import { HouseComponent, IMessage, Street, Subtitle, useStreet } from '@/common/street';
import { env } from '@/constant';
import { streetGateway } from '@/infra/Gateway/StreetGateway';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { Body, Button, Header } from '@/ui';

const urlSocket = URL_API.replace('https', 'wss').replace('/v1', '');
const { token, signatureId } = env.storage;
const { [token]: tokenCookies, [signatureId]: signature } = parseCookies();

export default function StreetData() {
  const navigate = useNavigate();
  const { query } = useRouter();
  const addressId = query.a;
  const blockId = query.b;
  const territoryId = query.t;
  const [connections, setConnections] = useState<number>(0);
  const { street, actions, getStreet, isLoading } = useStreet(Number(addressId), Number(blockId), Number(territoryId));

  const room = `${String(territoryId)}-${String(blockId)}-${String(addressId)}`;

  const back = () => {
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

  useEffect(() => {
    const socket = io(urlSocket, {
      transports: ['websocket'],
      auth: {
        token: `Bearer ${tokenCookies}`,
      },
      query: {
        key: signature,
      },
    }) as Socket;


    socket.on("connect", async () => {
      console.log(`User connected with ID: ${socket.id} room: ${room}`);
      setConnections(1)
      socket.emit('join', {
        roomName: room,
        username: uuid(),
      });
      await getStreet(Number(addressId), Number(blockId), Number(territoryId));
    });

    socket.on("join", (message: IMessage) => {
      console.log(`User joined with ID: ${socket.id} room: ${room}`, message);
    })

    socket.on(String(room), (message) => {
      console.log(`Received update for territory ${room}:`, message);
      if (message.type === 'update_house') actions.markRowSocket(Number(message.data.houseId), message.data.completed);
      if (message.type === 'user_joined') setConnections(message.data.userCount);
      if (message.type === 'user_left') setConnections(message.data.userCount);
    });

    socket.on("connect_error", (error) => {
      console.log(`Connection error for user:`, error.message);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected with ID: ${socket.id}`);
    })

    return () => {
      socket.disconnect();
    };

  }, []);

  return (
    <RootModeScreen mode={isLoading}>
      <div className={clsx('relative')}>
        <Header size='small'>
          <Button.Root
            className='absolute left-2 !w-fit !p-2 !shadow-none'
            variant='ghost'
            onClick={back}
          >
            <ArrowLeft />
          </Button.Root>
          <h1 className='text-xl font-semibold pl-4 ml-2 text-gray-700'>{street.streetName}</h1>
        </Header>
        <Body className='px-6 py-2'>
          <div className='flex items-end justify-between'>
            <div className='flex h-full items-center'>
              <h6 className='pt-4 text-lg font-semibold'>CASAS</h6>
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
    </RootModeScreen>
  );
}
