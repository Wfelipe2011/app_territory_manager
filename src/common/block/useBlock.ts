import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { Mode } from '@/common/loading';
import { blockGateway } from '@/infra/Gateway/BlockGateway';
import { authState } from '@/states/auth';

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
  const [values, setValues] = useRecoilState(authState);

  const getBlock = useCallback(
    async (block: number, territory: number): Promise<void> => {
      if (!block || !territory) return;
      const { status, data } = await blockGateway.getBlock(block, territory);
      if (status > 299) {
        setValues({ ...values, notFoundStatusCode: status });
        setIsLoading('not-found');
        return;
      }
      setBlock(data);
      setIsLoading('screen');
    },
    [setValues, values]
  );

  useEffect(() => {
    void getBlock(blockId ?? 0, territoryId ?? 0);
  }, [blockId, getBlock, territoryId]);

  const goToStreet = (addressId: number): void => void router.push(`/territorio/${territoryId}/quadra/${blockId}/rua/${addressId}`);

  return {
    block,
    actions: {
      goToStreet,
    },
    isLoading,
  };
};
