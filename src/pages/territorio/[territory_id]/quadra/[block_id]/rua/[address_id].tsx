import clsx from 'clsx';
import { driver } from 'driver.js';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { ArrowLeft, HelpCircle, Users } from 'react-feather';
import { io, Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

import 'driver.js/dist/driver.css';
import 'swiper/css';

import { RootModeScreen } from '@/common/loading';
import { HouseComponent, IMessage, Subtitle, useStreet } from '@/common/street';
import { env } from '@/constant';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { streetGateway } from '@/infra/Gateway/StreetGateway';
import { Body, Button, Header } from '@/ui';
import { PostAddIcon } from '@/assets/icons/PostAddIcon';
import { changeTheme } from '@/lib/changeTheme';
import { useBlock } from '@/common/block';
import { Swiper, SwiperSlide } from 'swiper/react';


const urlSocket = URL_API.replace('https', 'wss').replace('/v1', '');
const { token, signatureId } = env.storage;
const { [token]: tokenCookies, [signatureId]: signature } = parseCookies();


const stepsNovidades = [
  {
    popover: {
      title: 'Arraste para Navegar',
      description: 'Agora você pode arrastar as laterais para navegar entre as páginas de forma intuitiva!'
    }
  },
  {
    element: '#new-feature-bar-left',
    popover: {
      title: 'Indicador Lateral Esquerdo',
      description: 'Veja esta barra na lateral esquerda? Ela indica que você pode arrastar para o lado esquerdo.'
    }
  },
  {
    element: '#new-feature-bar-right',
    popover: {
      title: 'Indicador Lateral Direito',
      description: 'A barra na lateral direita indica que você pode arrastar para o lado direito.'
    }
  },
  {
    element: '#help-button',
    popover: {
      title: 'Ajuda',
      description: 'Se precisar de mais informações, clique no botão de ajuda no topo da página.'
    }
  },
];
const stepsHelp = [
  { element: '#publisher-return', popover: { title: 'Voltar', description: 'Clique aqui para retornar à página anterior.' } },
  {
    element: '#publisher-connections',
    popover: { title: 'Conexões', description: 'Visualize em tempo real quantos publicadores estão trabalhando nesta rua.' },
  },
  { element: '#publisher-mark', popover: { title: 'Marcar ou Desmarcar', description: 'Utilize esta opção para marcar ou desmarcar as casas.' } },
  {
    element: '#publisher-legend',
    popover: { title: 'Legenda', description: 'Consulte a legenda do seu território para entender o significado de cada sigla e cor das casas.' },
  },
  { element: '#publisher-not-hit', popover: { title: 'Não bater', description: 'As casas que não devem ser visitadas serão destacadas com essa cor.' } },
  { element: "#publisher-report", popover: { title: 'Reportar', description: 'Clique aqui para reportar alguma mudança no território.' } },
];
export default function StreetData() {
  const navigate = useNavigate();
  const { query } = useRouter();
  const { address_id, block_id, round, territory_id } = query as { territory_id: string; block_id: string; address_id: string; round: string };

  const [connections, setConnections] = useState<number>(0);
  const { street, actions, getStreet, isLoading } = useStreet(address_id, block_id, territory_id, round);
  const { block } = useBlock(block_id, territory_id, round);
  const [columnsByWidth, setColumnsByWidth] = useState<number>(3);
  const [phone, setPhone] = useState<string>('');

  const back = () => {
    navigate.push(`/territorio/${territory_id}/quadra/${block_id}?round=${round}`);
  };

  useEffect(() => {
    const widthScreen = window.innerWidth;
    const columnsByWidth = () => {
      if (widthScreen > 800) return 8;
      if (widthScreen > 700) return 7;
      if (widthScreen > 600) return 6;
      if (widthScreen > 500) return 5;
      if (widthScreen > 400) return 4;
      if (widthScreen > 300) return 4;
      return 3;
    };
    setColumnsByWidth(columnsByWidth());

    if (address_id && block_id && territory_id && round) {
      const room = `${territory_id}-${block_id}-${address_id}-${round}`;
      const socket = io(urlSocket, {
        transports: ['websocket'],
        auth: {
          token: `Bearer ${tokenCookies}`,
        },
        query: {
          key: signature,
        },
      }) as Socket;

      socket.on('connect', async () => {
        console.log(`User connected with ID: ${socket.id} room: ${room}`);
        setConnections(1);
        socket.emit('join', {
          roomName: room,
          username: uuid(),
        });
        await getStreet(address_id, block_id, territory_id, round);
      });

      socket.on('join', (message: IMessage) => {
        console.log(`User joined with ID: ${socket.id} room: ${room}`, message);
      });

      socket.on(String(room), async (message) => {
        console.log(`Received update for territory ${room}:`, message);
        if (message.type === 'update_house') getStreet(address_id, block_id, territory_id, round);
        if (message.type === 'user_joined') setConnections(message.data.userCount);
        if (message.type === 'user_left') setConnections(message.data.userCount);
      });

      socket.on('connect_error', (error) => {
        console.log(`Connection error for user:`, error.message);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected with ID: ${socket.id}`);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [address_id, block_id, getStreet, query, round, territory_id]);

  const driverAction = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [...stepsHelp, ...stepsNovidades],
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
    });
    driverObj.drive()
  }

  const tourNovidades = () => {
    const driverObj = driver({
      showProgress: true,
      steps: stepsNovidades,
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
    });

    driverObj.drive();
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('seenTourNovidades');

    if (!hasSeenTour) {
      // Disparar o tour pela primeira vez
      tourNovidades();

      // Salvar no localStorage para não exibir novamente
      localStorage.setItem('seenTourNovidades', 'true');
    }
  }, []);

  const report = () => {
    const mensagem = encodeURIComponent(`REPORTAR MUDANÇA\nOlá, gostaria de reportar uma mudança no território.\nTerritório: ${street.territoryName}\nQuadra: ${street.blockName}\nRua:  ${street.streetName}\nAlteração:`);
    const numeroTelefone = '55' + phone;
    const link = `https://api.whatsapp.com/send?phone=${numeroTelefone}&text=${mensagem}`;
    window.open(link);
  };

  useEffect(() => {
    streetGateway.getPhoneReport().then((response) => {
      if (response.status === 200) {
        setPhone(response.data.phone);
      }
    });
  }, []);

  useEffect(() => {
    changeTheme();
  }, []);

  const getPreviousAddress = () => {
    const index = block.addresses.findIndex((address) => address.id === +address_id);
    const previousAddress = block.addresses[index - 1];
    return previousAddress;
  }

  const getToNextAddress = () => {
    const index = block.addresses.findIndex((address) => address.id === +address_id);
    const nextAddress = block.addresses[index + 1];
    return nextAddress;
  }

  const goToNextPage = () => {
    const nextAddress = getToNextAddress()
    if (nextAddress) {
      const query = new URLSearchParams({ round });
      void navigate.push(`/territorio/${territory_id}/quadra/${block_id}/rua/${nextAddress.id}?${query.toString()}`);
    }
  }

  const goToPreviousPage = () => {
    const previousAddress = getPreviousAddress();
    if (getPreviousAddress()) {
      const query = new URLSearchParams({ round });
      void navigate.push(`/territorio/${territory_id}/quadra/${block_id}/rua/${previousAddress.id}?${query.toString()}`);
    }
  }

  return (
    <RootModeScreen mode={isLoading}>
      <HelpCircle
        id="help-button"
        onClick={driverAction}
        size={50}
        className='fixed bottom-0 right-0 p-1 mini:p-0 m-2 mini:m-4 cursor-pointer text-gray-50 fill-primary z-20'
      />
      <div id="new-feature-bar-left" className="fixed top-3/4 left-0 -mt-6 rounded-md h-[200px] w-2 bg-gray-500/30 hover:bg-gray-500/50 transition-opacity z-10 pointer-events-none"></div>
      <div id="new-feature-bar-right" className="fixed top-3/4 right-0 -mt-6 rounded-md h-[200px] w-2 bg-gray-500/30 hover:bg-gray-500/50 transition-opacity z-10 pointer-events-none"></div>
      <div
        className="fixed top-3/4 left-0 w-full h-full pointer-events-auto z-10"
      >
        <Swiper
          onSlidePrevTransitionStart={goToPreviousPage}
          onSlideNextTransitionStart={goToNextPage}
          className='w-full h-full'
        >
          {block.addresses.map((address) => (
            <SwiperSlide key={address.id}>

            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={clsx('relative')}>
        <Header size='small'>
          <Button.Root id='publisher-return' className='absolute left-2 !w-fit !p-2 !shadow-none' variant='ghost' onClick={back}>
            <ArrowLeft />
          </Button.Root>
          <div className='w-full flex flex-col items-center p-4'>
            <h2 className='text-xl '>{street.territoryName}</h2>
            <h1 className='text-xl font-semibold text-gray-700 max-w-[220px] mini:max-w-[250px] truncate'>{street.streetName}</h1>
          </div>
        </Header>
        <Body className='p-3'>
          <div className='flex items-end justify-between gap-2'>
            <div className='flex h-full items-center'>
              <h6 className='pt-4 text-lg font-semibold'>CASAS</h6>
            </div>
            <div className='flex items-center gap-3'>
              {phone && (<div id='publisher-report' className='cursor-pointer' onClick={report}><PostAddIcon /></div>)}

              {connections ? (
                <div className='flex items-center justify-center gap-2 text-lg font-semibold'>
                  {connections}
                  <Users id='publisher-connections' size={24} className='fill-primary text-primary' />
                </div>
              ) : (
                <div className='flex items-center justify-center gap-2 text-lg font-semibold'>
                  <Users id='publisher-connections' className='fill-gray-500 stroke-gray-500' />
                </div>
              )}
            </div>
          </div>
          <div className='flex h-screen flex-col gap-4'>
            <div
              id='publisher-mark'
              className='mt-4 grid gap-0.5'
              style={{
                gridTemplateColumns: `repeat(${columnsByWidth}, minmax(0, 1fr))`,
              }}
            >
              {street.houses &&
                street.houses.sort((a, b) => +a.order - +b.order).map((house) => <HouseComponent house={house} actions={actions} key={house.id} />)}
            </div>
            <div id='publisher-legend'>{street.houses?.length ? <Subtitle /> : null}</div>
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}
