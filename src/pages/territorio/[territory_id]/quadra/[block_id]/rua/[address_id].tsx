import clsx from 'clsx';
import { driver } from 'driver.js';
import { PenIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { ArrowLeft, HelpCircle, Users } from 'react-feather';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

import 'driver.js/dist/driver.css';
import 'swiper/css';

import { changeTheme } from '@/lib/changeTheme';
import { cn } from '@/lib/utils';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { PostAddIcon } from '@/assets/icons/PostAddIcon';
import { RootModeScreen } from '@/common/loading';
import { House, HouseComponent, IMessage, Subtitle, useStreet } from '@/common/street';
import { env } from '@/constant';
import { reportsGateway } from '@/infra/Gateway/ReportsGateway';
import { streetGateway } from '@/infra/Gateway/StreetGateway';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { Body, Button, Header } from '@/ui';

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
  const { address_id, block_id, round, territory_id } = query as {
    territory_id: string;
    block_id: string;
    address_id: string;
    round: string;
  };

  const [connections, setConnections] = useState<number>(0);
  const { street, actions, getStreet, isLoading } = useStreet(address_id, block_id, territory_id, round);
  const { block } = useBlock(block_id, territory_id, round);
  const [columnsByWidth, setColumnsByWidth] = useState<number>(3);
  const [phone, setPhone] = useState<string>('');
  const [openDrawer, setOpenDrawer] = useState(false);

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
    driverObj.drive();
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
    const previousAddress = block.addresses[index - 1] || block.addresses[block.addresses.length - 1];
    return previousAddress;
  };

  const getToNextAddress = () => {
    const index = block.addresses.findIndex((address) => address.id === +address_id);
    const nextAddress = block.addresses[index + 1] || block.addresses[0];
    return nextAddress;
  };

  const goToNextPage = () => {
    const nextAddress = getToNextAddress();
    if (nextAddress) {
      const query = new URLSearchParams({ round });
      void navigate.push(`/territorio/${territory_id}/quadra/${block_id}/rua/${nextAddress.id}?${query.toString()}`);
    }
  };

  const goToPreviousPage = () => {
    const previousAddress = getPreviousAddress();
    if (previousAddress) {
      const query = new URLSearchParams({ round });
      void navigate.push(`/territorio/${territory_id}/quadra/${block_id}/rua/${previousAddress.id}?${query.toString()}`);
    }
  };

  return (
    <RootModeScreen mode={isLoading}>
      <HelpCircle
        id="help-button"
        onClick={driverAction}
        size={50}
        className='fixed bottom-0 right-0 p-1 mini:p-0 m-2 mini:m-4 cursor-pointer text-gray-50 fill-primary z-20'
      />
      <div id="new-feature-bar-left" className="fixed top-3/4 left-0 -mt-6 rounded-md h-[150px] w-2 bg-gray-500/30 hover:bg-gray-500/50 transition-opacity z-10 pointer-events-none"></div>
      <div id="new-feature-bar-right" className="fixed top-3/4 right-0 -mt-6 rounded-md h-[150px] w-2 bg-gray-500/30 hover:bg-gray-500/50 transition-opacity z-10 pointer-events-none"></div>
      <div
        className="fixed top-2/4 left-0 w-full h-full pointer-events-auto z-10"
      >
        <Swiper
          loop={true}
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
          <div className='flex w-full flex-col items-center p-4'>
            <h2 className='text-xl '>{street.territoryName}</h2>
            <h1 className='mini:max-w-[250px] max-w-[220px] truncate text-xl font-semibold text-gray-700'>{street.streetName}</h1>
          </div>
        </Header>
        <Body className='p-3'>
          <div className='flex items-end justify-between gap-2'>
            <div className='flex h-full items-center'>
              <h6 className='pt-4 text-lg font-semibold'>CASAS</h6>
            </div>
            <div className='flex items-center gap-3'>
              {phone && (
                <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                  <DrawerTrigger asChild>
                    <span className='cursor-pointer'>
                      <PostAddIcon />
                    </span>
                  </DrawerTrigger>
                  <DrawerContent className='w-full bg-white'>
                    <div className='flex h-full w-full justify-center px-8'>
                      <ReportTabs
                        closeDrawer={async () => {
                          await getStreet(address_id, block_id, territory_id, round);
                          setOpenDrawer(false);
                        }}
                        houses={street.houses}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              )}

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
              className='mt-4 grid gap-0.5 z-20 m-1'
              style={{
                gridTemplateColumns: `repeat(${columnsByWidth}, minmax(0, 1fr))`,
              }}
            >
              {street.houses &&
                street.houses
                  .sort((a, b) => +a.order - +b.order)
                  .map((house) => <HouseComponent house={house} actions={actions} key={house.id} />)}
            </div>
            <div id='publisher-legend'>{street.houses?.length ? <Subtitle /> : null}</div>
          </div>
        </Body>
      </div>
    </RootModeScreen>
  );
}

// LEVAR ESSES CARAS ABAIXO PARA OUTRO ARQUIVO
interface ReportTabsProps {
  closeDrawer: () => void;
  houses: House[];
}
function ReportTabs({ closeDrawer, houses }: ReportTabsProps) {
  const [tab, setTab] = useState<'insert' | 'update' | 'delete'>('insert');
  const { query } = useRouter();
  const { address_id, block_id, territory_id } = query as { territory_id: string; block_id: string; address_id: string };
  return (
    <Tabs defaultValue='insert' className='w-full' value={tab} onValueChange={(value) => setTab(value as any)}>
      <TabsList className='grid w-full grid-cols-3 gap-5'>
        <TabsTrigger
          value='insert'
          className={cn(
            'transition-all duration-300 ease-in-out hover:border hover:border-green-400',
            tab === 'insert' ? 'border border-green-400' : ''
          )}
        >
          <div className='flex items-center gap-2'>
            Adicionar <PlusIcon size={18} className='text-green-400' />
          </div>
        </TabsTrigger>
        <TabsTrigger
          value='update'
          className={cn(
            'transition-all duration-300 ease-in-out hover:border hover:border-blue-400',
            tab === 'update' ? 'border border-blue-400' : ''
          )}
        >
          <div className='flex items-center gap-2'>
            Atualizar <PenIcon size={18} className='text-blue-400' />
          </div>
        </TabsTrigger>
        <TabsTrigger
          value='delete'
          className={cn(
            'transition-all duration-300 ease-in-out hover:border hover:border-red-400',
            tab === 'delete' ? 'border border-red-400' : ''
          )}
        >
          <div className='flex items-center gap-2'>
            Remover <TrashIcon size={18} className='text-red-400' />
          </div>
        </TabsTrigger>
      </TabsList>
      <Separator orientation='horizontal' className='mb-8 mt-4 w-full border-b border-gray-600' />
      <ReportInsert addressId={address_id} blockId={block_id} territoryId={territory_id} closeDrawer={closeDrawer} />
      <ReportUpdate addressId={address_id} blockId={block_id} territoryId={territory_id} houses={houses} closeDrawer={closeDrawer} />
      <ReportDelete addressId={address_id} blockId={block_id} territoryId={territory_id} houses={houses} closeDrawer={closeDrawer} />
    </Tabs>
  );
}

const subtitles = ['Residência', 'Comércio', 'Terreno', 'Fundos', 'Testemunha de Jeová', 'Igreja', 'Escola', 'Hospital', 'Não Bater'];
const mapperSubtitle = (value: string) => {
  const options = {
    CM: 'Comércio',
    TR: 'Terreno',
    FD: 'Fundos',
    TJ: 'Testemunha de Jeová',
    IG: 'Igreja',
    ES: 'Escola',
    HP: 'Hospital',
  };
  return options[value] ?? value;
};
const mapperErrosFields = {
  number: 'Número',
  legend: 'Legenda',
  observations: 'Observações',
};

interface ReportInsertProps {
  addressId: string;
  blockId: string;
  territoryId: string;
  closeDrawer: () => void;
}

function ReportInsert({ addressId, blockId, territoryId, closeDrawer }: ReportInsertProps) {
  const [number, setNumber] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('Residência');
  const [observations, setObservations] = useState<string>('');

  const onChangeNumber = (value: string) => {
    const valueWithAllCharactersInUpperCase = value.toUpperCase();
    const onlyNumbersAndLettersSolidus = valueWithAllCharactersInUpperCase.replace(/[^0-9A-Z/]/g, '');
    setNumber(onlyNumbersAndLettersSolidus);
  };

  const onSubmit = async () => {
    const { status, data, message } = await reportsGateway.sendInsertReport({
      number,
      dontVisit: subtitle === 'Não Bater',
      blockId: Number(blockId),
      addressId: Number(addressId),
      territoryId: Number(territoryId),
      legend: subtitle,
      observations,
      reportType: 'add',
    });

    if (status > 299) {
      errorHandler(data, message);
      return;
    }
    closeDrawer();
  };
  return (
    <TabsContent value='insert'>
      <div className='mb-8 grid h-full w-full grid-cols-2 gap-8'>
        <Input placeholder='Número' value={number} onChange={(e) => onChangeNumber(e.target.value)} />
        <Select value={subtitle} onValueChange={setSubtitle}>
          <SelectTrigger>
            <SelectValue placeholder='Residência' />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            {subtitles.map((subtitle) => (
              <SelectItem
                key={subtitle}
                value={subtitle}
                className={cn(
                  'cursor-pointer rounded-md transition-all duration-300 ease-in-out',
                  subtitle === 'Não Bater' ? 'bg-red-100 hover:bg-red-300' : 'hover:bg-blue-300'
                )}
              >
                {subtitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder='Observação'
          className='col-span-2 h-24 resize-none'
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />

        <Button.Root className='col-span-2 w-full rounded-md text-white' type='button' onClick={onSubmit}>
          Enviar
        </Button.Root>
      </div>
    </TabsContent>
  );
}

interface ReportUpdateProps extends ReportInsertProps {
  houses: House[];
}
function ReportUpdate({ addressId, blockId, territoryId, houses, closeDrawer }: ReportUpdateProps) {
  const [house, setHouse] = useState<House | null>(null);
  const [subtitle, setSubtitle] = useState<string>('Residência');
  const [observations, setObservations] = useState<string>('');

  const onSubmit = async () => {
    if (!house || !house.id) {
      toast.error('Selecione uma casa');
      return;
    }
    const { status, data, message } = await reportsGateway.sendUpdateReport({
      number: house.number,
      id: Number(house.id),
      dontVisit: subtitle === 'Não Bater',
      blockId: Number(blockId),
      addressId: Number(addressId),
      territoryId: Number(territoryId),
      legend: subtitle,
      observations,
      reportType: 'update',
    });

    if (status > 299) {
      errorHandler(data, message);
      return;
    }
    closeDrawer();
  };

  const updateHouse = (value: string) => {
    const houseSelected = houses.find((house) => house.id === value) ?? null;
    setHouse(houseSelected);

    if (!houseSelected || (!houseSelected.legend && !houseSelected.dontVisit)) {
      setSubtitle('Residência');
    } else {
      const dontVisit = houseSelected.dontVisit ? 'Não Bater' : '';
      const subtitleMapped = mapperSubtitle(houseSelected.legend);
      const subtitle = dontVisit || subtitleMapped;
      setSubtitle(subtitle || 'Residência');
    }
  };

  return (
    <TabsContent value='update'>
      <div className='mb-8 grid h-full w-full grid-cols-2 gap-8'>
        <Select value={house?.id} onValueChange={updateHouse}>
          <SelectTrigger>
            <SelectValue placeholder='Número' />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            {houses.map((house) => (
              <SelectItem
                key={house.id}
                value={house.id}
                className='cursor-pointer rounded-md transition-all duration-300 ease-in-out hover:bg-blue-300'
              >
                {house.number}
                {house.legend ? `/${house.legend}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subtitle} onValueChange={setSubtitle}>
          <SelectTrigger>
            <SelectValue placeholder='Residência' />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            {subtitles.map((subtitle) => (
              <SelectItem
                key={subtitle}
                value={subtitle}
                className={cn(
                  'cursor-pointer rounded-md transition-all duration-300 ease-in-out',
                  subtitle === 'Não Bater' ? 'bg-red-100 hover:bg-red-300' : 'hover:bg-blue-300'
                )}
              >
                {subtitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder='Observação'
          className='col-span-2 h-24 resize-none'
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />

        <Button.Root className='col-span-2 w-full rounded-md text-white' type='button' onClick={onSubmit}>
          Enviar
        </Button.Root>
      </div>
    </TabsContent>
  );
}

interface ReportDeleteProps extends ReportInsertProps {
  houses: House[];
}
function ReportDelete({ addressId, blockId, territoryId, houses, closeDrawer }: ReportDeleteProps) {
  const [house, setHouse] = useState<House | null>(null);
  const [observations, setObservations] = useState<string>('');

  const onSubmit = async () => {
    if (!house || !house.id) {
      toast.error('Selecione uma casa');
      return;
    }
    const { status, data, message } = await reportsGateway.sendUpdateReport({
      number: house.number,
      id: Number(house.id),
      dontVisit: false,
      blockId: Number(blockId),
      addressId: Number(addressId),
      territoryId: Number(territoryId),
      legend: house.legend,
      observations,
      reportType: 'remove',
    });

    console.log({
      status,
      data,
      message,
    });

    if (status > 299) {
      errorHandler(data, message);
      return;
    }
    closeDrawer();
  };
  return (
    <TabsContent value='delete'>
      <div className='mb-8 grid h-full w-full grid-cols-2 gap-8'>
        <Select value={house?.id} onValueChange={(value) => setHouse(houses.find((house) => house.id === value) ?? null)}>
          <SelectTrigger className='col-span-2'>
            <SelectValue placeholder='Número' />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            {houses.map((house) => (
              <SelectItem
                key={house.id}
                value={house.id}
                className='cursor-pointer rounded-md transition-all duration-300 ease-in-out hover:bg-blue-300'
              >
                {house.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder='Observação'
          className='col-span-2 h-24 resize-none'
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />

        <Button.Root className='col-span-2 w-full rounded-md text-white' type='button' onClick={onSubmit}>
          Enviar
        </Button.Root>
      </div>
    </TabsContent>
  );
}

function errorHandler(data: any, message: any) {
  const rgxToGetBetweenQuotes = /"([^"]*)"/;
  if (!data?.length) {
    toast.error(message ?? 'Erro ao fazer report');
    return;
  }
  const errorsMessages: string[] = [];
  for (const field of data) {
    const fieldError = field.replace(rgxToGetBetweenQuotes, (match, p1) => {
      return `"${mapperErrosFields[p1]}"`;
    });
    errorsMessages.push(fieldError);
  }
  toast.error(errorsMessages.join('\n'));
}
