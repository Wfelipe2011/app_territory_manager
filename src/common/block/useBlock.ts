/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Mode } from '@/common/loading';
import { blockGateway } from '@/infra/Gateway/BlockGateway';

import { IBlock } from './type';

export const useBlock = (blockId: number, territoryId: number, initialState?: IBlock) => {
  const [block, setBlock] = useState<IBlock>(
    initialState || {
      blockId: 0,
      blockName: '',
      territoryId: 0,
      territoryName: '',
      addresses: [],
    }
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<Mode>('loading');

  const getBlock = useCallback(
    async (block: number, territory: number): Promise<void> => {
      if (!block || !territory) return;
      const { status, data } = await blockGateway.getBlock(block, territory);
      if (status === 503) {
        setTimeout(() => getBlock(block, territory), 3000);
        alert('Servidor em manutenção, tentando novamente em 3 segundos');
        return;
      }
      if (status > 299) {
        console.log({ status, data });
        setIsLoading('not-found');
        return;
      }
      setBlock(data);
      setIsLoading('screen');
    },
    [setIsLoading]
  );

  useEffect(() => {
    void getBlock(blockId ?? 0, territoryId ?? 0);
  }, [blockId, getBlock, territoryId]);

  const goToStreet = (addressId: number): Promise<void> => {
    const exist = block.addresses.find((address) => address.id === addressId);
    if (!exist) {
      setIsLoading('not-found');
      return Promise.resolve();
    }
    if (!blockId || !territoryId) return Promise.resolve(setIsLoading('not-found'));
    const query = `?a=${addressId}&b=${blockId}&t=${territoryId}`;
    router.push(`rua${query}`);
    return Promise.resolve();
  };

  return {
    block,
    actions: {
      goToStreet,
    },
    isLoading,
  };
};
