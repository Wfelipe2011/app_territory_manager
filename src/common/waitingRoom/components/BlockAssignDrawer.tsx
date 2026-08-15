import { useMemo, useState } from 'react';
import { Check, X } from 'react-feather';
import toast from 'react-hot-toast';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

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
};

export function BlockAssignDrawer({ blockId, blockName, publishers, assignments, onAssign, onRemove, trigger }: BlockAssignDrawerProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');

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
    return publishers.filter((publisher) => `${publisher.firstName} ${publisher.lastName}`.toLowerCase().includes(term));
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent id='block_assign_drawer_content' className='w-full bg-white'>
        <div className='flex w-full items-center justify-between px-6 pt-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Atribuir publicadores</h3>
          <X className='cursor-pointer text-gray-600' onClick={() => setOpen(false)} />
        </div>
        <div className='flex flex-col gap-4 px-6 py-6'>
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-gray-700'>{blockName}</label>
            <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder='Buscar publicador...' />
          </div>
          <div className='flex max-h-[50vh] flex-col gap-2 overflow-y-auto'>
            {filteredPublishers.length === 0 && <p className='text-sm text-gray-600'>Nenhum publicador presente no momento.</p>}
            {filteredPublishers.map((publisher) => {
              const assigned = assignedIds.has(publisher.identityKey);
              return (
                <button
                  key={publisher.identityKey}
                  type='button'
                  onClick={() => void toggle(publisher.identityKey)}
                  className='flex items-center justify-between rounded-xl border bg-white p-3 text-left shadow-sm'
                >
                  <span className='font-medium text-gray-800'>
                    {publisher.firstName} {publisher.lastName}
                  </span>
                  <span className='flex items-center gap-2'>
                    <span className='text-sm text-gray-500'>**** {publisher.phoneLast4}</span>
                    {assigned && <Check size={18} className='text-green-600' />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
