/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { io,Socket } from 'socket.io-client';

import { env } from '@/constant';
import { streetGateway } from '@/infra/Gateway/StreetGateway';
import { URL_API } from '@/infra/http/AxiosAdapter';
import { loadState } from '@/states/load';

import { IMessage, IUseStreet, Street } from './type';

export const useStreet = (
  addressId: number,
  blockId: number,
  territoryId: number,
): IUseStreet => {
  const [street, setStreet] = useState<Street>({
    streetName: '',
    blockName: '',
    territoryName: '',
    houses: [],
  } as Street);
  const [_, _setLoadState] = useRecoilState(loadState);

  const getStreet = useCallback(
    async (addressId: number, blockId: number, territoryId: number) => {
      _setLoadState({ loader: 'spiral', message: 'Buscando rua' });
      if (!addressId || !blockId || !territoryId) return;
      const { data, status } = await streetGateway.signInStreet({
        addressId,
        blockId,
        territoryId,
      });
      if (status > 299) {
        alert('Erro ao buscar rua');
        _setLoadState({ loader: 'none', message: '' });
        return;
      }
      setStreet({
        ...data,
        houses: data?.houses.sort(
          (a, b) => Number(a.number) - Number(b.number)
        ),
      });
      _setLoadState({ loader: 'none', message: '' });
    },
    [_setLoadState]
  );

  useEffect(() => {
    void getStreet(Number(addressId), Number(blockId), Number(territoryId));
  }, [addressId, blockId, getStreet, territoryId]);

  const markRowBySocket = useCallback(
    ({ data }: Pick<IMessage, 'data'>) => {
      const newStreet = { ...street };
      const house = newStreet.houses.find((h) => h.id === data.houseId);
      if (house) {
        house.status = data.completed;
      }
      setStreet(newStreet);
    },
    [street]
  );

  const markRow = async (id: number) => {
    const newStreet = { ...street };
    const house = newStreet.houses.find((h) => h.id === id);
    if (!house) return;
    if (house) {
      house.status = !house.status;
    }
    setStreet(newStreet);
    const input = {
      addressId,
      blockId,
      territoryId,
      houseId: id,
      status: house.status,
    };
    const { status, data } = await streetGateway.markHouse(input);
    if (status > 299) {
      alert('Erro ao marcar casa');
      return;
    }
    console.log(data);
  };

  return {
    street,
    actions: {
      mark: markRow,
      markBySocket: markRowBySocket,
    },
  };
};
