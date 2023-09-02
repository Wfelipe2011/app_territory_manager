/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useCallback, useEffect, useState } from 'react';

import { Mode } from '@/common/loading';
import { streetGateway } from '@/infra/Gateway/StreetGateway';

import { Street } from './type';

export const useStreet = (addressId: number, blockId: number, territoryId: number) => {
  const [isLoading, setIsLoading] = useState<Mode>('loading');
  const [street, setStreet] = useState<Street>({
    streetName: '',
    blockName: '',
    territoryName: '',
    houses: [],
  } as Street);

  const getStreet = useCallback(
    async (addressId: number, blockId: number, territoryId: number) => {
      if (!addressId || !blockId || !territoryId) return;
      const { data, status } = await streetGateway.signInStreet({
        addressId,
        blockId,
        territoryId,
      });
      if (status > 299) {
        alert('Erro ao buscar rua');
        setIsLoading('not-found');
        return;
      }
      setStreet({
        ...data,
        houses: data?.houses.sort((a, b) => Number(a.number) - Number(b.number)),
      });
      setIsLoading('screen');
    },
    [setIsLoading]
  );

  useEffect(() => {
    void getStreet(Number(addressId), Number(blockId), Number(territoryId));
  }, [addressId, blockId, getStreet, territoryId]);

  const markRow = async (id: number) => {
    let statusHouse = false;
    street.houses.forEach((h) => {
      if (h.id === id) {
        h.status = !h.status;
        statusHouse = h.status;
      }
    });
    setStreet({ ...street });

    const input = {
      addressId,
      blockId,
      territoryId,
      houseId: id,
      status: statusHouse,
    } as any;

    const { status } = await streetGateway.markHouse(input);
    if (status === 403) {
      alert('Você não tem permissão para alterar o status dessa casa');
      street.houses.map((h) => {
        if (h.id === id) {
          h.status = !h.status;
        }
      });
      setStreet({ ...street });
    }
  };

  const markRowSocket = (id: number, status: boolean) => {
    getStreet(Number(addressId), Number(blockId), Number(territoryId));
  };

  return {
    street,
    getStreet,
    actions: {
      mark: markRow,
      markRowSocket,
    },
    isLoading,
  };
};
