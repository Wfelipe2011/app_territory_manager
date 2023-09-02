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
      setIsLoading('loading');
      if (!block || !territory) return;
      const { status, data } = await blockGateway.getBlock(block, territory);
      if (status > 299) {
        console.log({ status, data });
        setIsLoading('not-found');
        alert('Erro ao buscar a quadra');
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
      alert('Rua não encontrada');
      return Promise.resolve();
    }
    if (!blockId || !territoryId) return Promise.resolve(alert('Erro ao buscar a quadra'));
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
