/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Dialog, DialogBody, DialogHeader } from '@material-tailwind/react';
import clsx from 'clsx';
import { memo, useCallback, useEffect, useState } from 'react';
import { Clock, Eye, UserPlus } from 'react-feather';

import { IconContainer } from '@/components/Atoms/IconContainer';
import { ShareCopy } from '@/components/Atoms/ShareCopy';

import { ITerritoryActions } from '@/common/territory/useTerritoryActions';
import { BlockAssignDrawer } from '@/common/waitingRoom/components';
import { WaitingRoomAssignment, WaitingRoomPublisher } from '@/common/waitingRoom/type';
import { streetGateway } from '@/infra/Gateway/StreetGateway';
import { DoughnutChart } from '@/ui/doughnutChart';

import { IBlock } from '../type';

interface RoomProps {
  active: boolean;
  publishers: WaitingRoomPublisher[];
  assignments: WaitingRoomAssignment[];
  onAssign: (publisherId: string, blockId: string) => Promise<boolean>;
  onRemove: (publisherId: string, blockId: string) => Promise<boolean>;
}

interface BlockCardProps {
  block: IBlock;
  actions: ITerritoryActions;
  territoryId: string;
  round: string;
  reload: () => void;
  room?: RoomProps;
}

export function BlockCard({ block, actions, territoryId, round, reload, room }: BlockCardProps) {

  function sugestion(): string {
    let sugestion = '';
    if (block.negativeCompleted < 15) {
      sugestion = '+1 quadra';
    }
    if (block.negativeCompleted >= 15 && block.negativeCompleted < 25) {
      sugestion = '2 pares ou mais.';
    }
    if (block.negativeCompleted >= 25 && block.negativeCompleted < 30) {
      sugestion = '3 pares ou mais.';
    }
    if (block.negativeCompleted >= 30) {
      sugestion = '4 pares ou mais.';
    }
    return sugestion;
  }

  function geParamsNavigateShare(territoryId: string, blockId: string, signature: string): { title: string; text: string; url: string } {
    const queryRound = new URLSearchParams({ round });
    const query = new URLSearchParams({ p: `territorio/${territoryId}/quadra/${blockId}?${queryRound.toString()}`, s: signature });
    return {
      title: '*DESIGNAÇÃO DE TERRITÓRIO*\n\nPrezado(a) publicador(a)',
      text: `*DESIGNAÇÃO DE TERRITÓRIO*\n\nSegue o link para a *${block.name}* que você está designado(a) para pregar:`,
      url: `${window.location.origin}/home?${query.toString()}`,
    };
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const revokeAccess = async () => {
    await streetGateway.revokeAccess(+territoryId, +block.id);
    reload();
  };

  const openAssign = async () => {
    if (!block.signature?.key) {
      await actions.share(block.id);
    }
    if (room?.active) setAssignOpen(true);
  };

  const assignedToBlock = room?.assignments.filter((assignment) => assignment.blockId === block.id) ?? [];
  const assignedNames = assignedToBlock.map((assignment) => assignment.firstName);

  return (
    <div className={clsx('flex min-h-[260px] w-full rounded-b-[40px] rounded-l-[40px] gap-2 rounded-t-[40px] rounded-br-none rounded-tr-none border p-3 shadow-lg')}>
      <div className='flex h-full w-1/2 flex-col items-baseline justify-start'>
        <h6 className='ml-2 block text-xl font-medium'>
          <span className='ml-2 block'>
            {block.name}
          </span>
          {block.updateAt ? (
            <span className='ml-2 -mt-1 text-sm font-normal text-gray-500 block'>
              <i>Trabalhado: {new Date(block.updateAt).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</i>
            </span>
          ) : (
            <span className='ml-2 -mt-1 text-xs font-normal text-gray-500 block'>
              <i>(Não trabalhado)</i>
            </span>
          )}
        </h6>

        <div id="overseer-chart" className='flex h-[200px] w-full max-w-[170px] flex-col pt-3'>
          <DoughnutChart values={[block.positiveCompleted, block.negativeCompleted]} />
        </div>
        <div className='w-full'>
          {!block.signature?.key ? (
            <div id="overseer-time" className='p-1 pl-2 flex w-full  items-center  gap-2'>
              <Clock className='text-gray-700' />
            </div>
          ) : (
            <div className='flex w-full gap-2'>
              <TimeToExpire signature={block.signature} />
            </div>
          )}
        </div>
      </div>

      <div className='flex w-1/2 flex-col items-end justify-between'>
        <div className='flex w-full justify-end items-center gap-2'>
          {block?.signature?.key && (<Eye className='cursor-pointer text-primary' onClick={() => actions.blockNavigation(territoryId, block.id, round)} />)}
          <ShareCopy
            data={{
              message: geParamsNavigateShare(territoryId, block.id, block?.signature?.key || ''),
              ...(block?.signature?.key ? { signatureKey: block.signature.key } : {}),
            }}
            key={block.id}
            onShareClick={() => actions.share(block.id)}
          />
        </div>

        <div className='flex w-full flex-col gap-2 p-2'>
          <div className='flex items-center gap-2'>
            <div className='bg-secondary h-6 w-14'></div>
            <span>À fazer: {block.negativeCompleted}</span>
          </div>

          <div className='flex items-center gap-2'>
            <div className='bg-primary h-6 w-14'></div>
            <span>Concluído: {block.positiveCompleted}</span>
          </div>
          <div id="overseer-sugestion" className='text-sm'>
            {assignedNames.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {assignedNames.map((name) => (
                  <span key={name} className='rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white'>
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              `Sugestão: ${sugestion()}`
            )}
          </div>
          {block?.signature?.key && (
            <IconContainer
              className='w-full mt-1'
              onClick={() => setConfirmOpen(true)}
              icon={
                <Button variant='outlined' className="flex justify-center p-1.5 w-full text-center text-primary border-primary" >
                  Revogar acesso
                </Button>
              }
            />
          )}
        </div>

        <div className='flex w-full '>
          {block?.signature?.key ? (
            <div className='flex w-full items-center justify-end gap-2 p-2 font-semibold'>
              <BlockAssignDrawer
                blockId={block.id}
                blockName={block.name}
                publishers={room?.publishers ?? []}
                assignments={room?.assignments ?? []}
                onAssign={async (publisherId, blockId) => (room ? await room.onAssign(publisherId, blockId) : false)}
                onRemove={async (publisherId, blockId) => (room ? await room.onRemove(publisherId, blockId) : false)}
                open={assignOpen}
                onOpenChange={setAssignOpen}
                trigger={
                  <UserPlus
                    id="overseer-connections"
                    size={22}
                    className={`cursor-pointer ${assignedToBlock.length > 0 ? 'fill-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => void openAssign()}
                  />
                }
              />
            </div>
          ) : (
            <div className='flex w-full items-center justify-end gap-2 p-2 font-semibold'>
              <BlockAssignDrawer
                blockId={block.id}
                blockName={block.name}
                publishers={room?.publishers ?? []}
                assignments={room?.assignments ?? []}
                onAssign={async (publisherId, blockId) => (room ? await room.onAssign(publisherId, blockId) : false)}
                onRemove={async (publisherId, blockId) => (room ? await room.onRemove(publisherId, blockId) : false)}
                open={assignOpen}
                onOpenChange={setAssignOpen}
                trigger={
                  <UserPlus
                    id="overseer-connections"
                    size={22}
                    className={`cursor-pointer ${assignedToBlock.length > 0 ? 'fill-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => void openAssign()}
                  />
                }
              />
            </div>
          )}
        </div>
      </div>

      <Dialog
        className="!max-w-[250px] !min-w-[250px] !p-2"
        open={confirmOpen} handler={setConfirmOpen}>
        <div className='flex justify-between'>
          <DialogHeader>Você tem certeza?</DialogHeader>
        </div>
        <DialogBody>
          <div className="flex justify-center gap-2">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded w-full"
              onClick={() => setConfirmOpen(false)}
            >
              NÃO
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
              onClick={async () => {
                await revokeAccess();
                setConfirmOpen(false);
              }}
            >
              SIM
            </button>
          </div>
        </DialogBody>
      </Dialog>
    </div >
  );
}

const TimeToExpireComponent = ({ signature }: { signature: IBlock['signature'] }) => {
  const [expireIn, setExpireIn] = useState<string>('');

  const timeToExpire = useCallback((endDate: string) => {
    const date = new Date(endDate);
    if (!endDate) return;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const daysNumber = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursNumber = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutesNumber = Math.floor((diff / 1000 / 60) % 60);
    const secondsNumber = Math.floor((diff / 1000) % 60);
    const days = daysNumber > 0 ? `${daysNumber}D ` : '';
    const hours = String(hoursNumber).padStart(2, '0');
    const minutes = String(minutesNumber).padStart(2, '0');
    const seconds = String(secondsNumber).padStart(2, '0');
    // verifica se o tempo já expirou ou é negativo e parar o contador
    if (diff <= 0) {
      setExpireIn('00:00:00');
      return;
    }
    setExpireIn(`${days}${hours}:${minutes}:${seconds}`);
  }, []);

  useEffect(() => {
    if (!signature) return;
    const interval = setInterval(() => {
      timeToExpire(signature?.expirationDate || '');
    }, 1000);
    return () => clearInterval(interval);
  }, [signature, signature?.expirationDate, timeToExpire]);

  return (
    <div id="overseer-time" className='p-1 pl-2 flex w-full  items-center  gap-2'>
      <Clock className='text-primary' /> <span className='text-lg  font-semibold'>{expireIn}</span>
    </div>
  );
};

const TimeToExpire = memo(TimeToExpireComponent);
