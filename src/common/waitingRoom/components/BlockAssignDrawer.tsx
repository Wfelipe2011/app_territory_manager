import { useMemo, useState } from 'react';
import { Check, X } from 'react-feather';
import toast from 'react-hot-toast';

import { IconContainer } from '@/components/Atoms/IconContainer';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

import { PublisherCard } from '@/common/waitingRoom/components/PublisherCard';
import { WaitingRoomAssignment, WaitingRoomPublisher } from '@/common/waitingRoom/type';
import { useKeyboardFix } from '@/utils/useKeyboardFix';

type BlockAssignDrawerProps = {
  blockId: string;
  blockName: string;
  publishers: WaitingRoomPublisher[];
  assignments: WaitingRoomAssignment[];
  onAssign: (publisherId: string, blockId: string) => Promise<boolean>;
  onRemove: (publisherId: string, blockId: string) => Promise<boolean>;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function BlockAssignDrawer({ blockId, blockName, publishers, assignments, onAssign, onRemove, trigger, open: controlledOpen, onOpenChange }: BlockAssignDrawerProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const isOpen = controlledOpen ?? open;
  const setOpenState = onOpenChange ?? setOpen;

  useKeyboardFix(() => {
    const drawerContent = document.getElementById('block_assign_drawer_content');
    if (drawerContent) {
      drawerContent.style.marginBottom = '1rem';
      drawerContent.style.height = 'auto';
    }
  });

  const assignedIds = useMemo(
    () => new Set(assignments.filter((assignment) => assignment.blockId === blockId).map((assignment) => assignment.publisherId)),
    [assignments, blockId]
  );

  const filteredPublishers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return publishers;
    return publishers.filter((publisher) => publisher.firstName.toLowerCase().includes(term));
  }, [filter, publishers]);

  const toggle = async (publisherId: string) => {
    if (assignedIds.has(publisherId)) {
      const ok = await onRemove(publisherId, blockId);
      if (ok) toast.success('Atribuição removida');
      else toast.error('Não foi possível remover a atribuição');
      return;
    }
    const ok = await onAssign(publisherId, blockId);
    if (ok) toast.success('Quadra atribuída');
    else toast.error('Não foi possível atribuir a quadra');
  };

  return (
    <Drawer open={isOpen} onOpenChange={setOpenState}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent id='block_assign_drawer_content' className='w-full bg-white'>
        <div className='flex w-full items-center justify-between p-6'>
          <h2 className='text-xl font-semibold text-primary-text'>Atribuir publicadores</h2>
          <IconContainer
            icon={<X size={20} aria-hidden='true' />}
            aria-label='Fechar'
            onClick={() => setOpenState(false)}
          />
        </div>
        <div className='flex flex-col gap-4 p-6'>
          <div className='flex flex-col gap-1'>
            <label htmlFor='block-assign-filter' className='text-sm text-primary-text'>
              {blockName}
            </label>
            <Input
              id='block-assign-filter'
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder='Buscar publicador...'
            />
          </div>
          <div className='flex max-h-[50vh] flex-col gap-2 overflow-y-auto'>
            {filteredPublishers.length === 0 && (
              <p className='text-sm text-muted'>Nenhum publicador presente no momento.</p>
            )}
            {filteredPublishers.map((publisher) => {
              const assigned = assignedIds.has(publisher.identityKey);
              return (
                <PublisherCard
                  key={publisher.identityKey}
                  primary={publisher.firstName}
                  secondary={
                    <span className='flex items-center gap-2'>
                      <span>**** {publisher.phoneLast4}</span>
                      {assigned && <Check size={18} className='text-green-600' aria-hidden='true' />}
                    </span>
                  }
                  onClick={() => void toggle(publisher.identityKey)}
                  ariaLabel={`${assigned ? 'Remover' : 'Atribuir'} ${publisher.firstName}`}
                />
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
