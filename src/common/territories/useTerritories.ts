import { useRouter as useNavigation } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState } from 'recoil';

import { Mode } from '@/common/loading';
import { TerritoryGateway } from '@/infra/Gateway/TerritoryGateway';
import AxiosAdapter from '@/infra/http/AxiosAdapter';
import { authState } from '@/states/auth';
import { navigatorShare } from '@/utils/share';

import { ITerritoryCard, IUseHome } from './type';

const axios = new AxiosAdapter();

export interface Round {
  id: number;
  roundNumber: number;
  houseId: number;
  territoryId: number;
  blockId: number;
  completed: boolean;
  startDate: Date;
  updateDate: Date | null;
  endDate: Date | null;
  tenantId: number;
}

export interface TerritoryTypes {
  id: number;
  name: string;
}

let timeout: NodeJS.Timeout;

export const useTerritories = () => {
  const [search, setSearch] = useState<string>('');

  const [types, setTypes] = useState({
    options: [] as TerritoryTypes[],
    selected: '',
  });
  const [round, setRound] = useState({
    options: [] as number[],
    selected: '',
  });
  const [territoryCards, setTerritoryCards] = useState<ITerritoryCard[]>([]);
  const [isLoading, setIsLoading] = useState<Mode>('loading');
  const [values, setValues] = useRecoilState(authState);
  const navigation = useNavigation();

  // actions navigation
  const blockNavigation = (territoryId: string) => {
    navigation.push(`/territorio/${territoryId}?round=${round.selected}`);
  };

  // actions round
  const getRound = async (): Promise<string> => {
    if (round.selected) return round.selected;

    const { data: rounds } = await axios.get<Round[]>('rounds');
    if (!rounds || !rounds?.length) {
      setValues({ ...values, notFoundStatusCode: 404 });
      toast.error('Nenhuma rodada encontrada');
      setIsLoading('not-found');
      return '';
    }

    const roundsSort = rounds.sort((a, b) => b.roundNumber - a.roundNumber);
    setRound({
      options: roundsSort.map((round) => round.roundNumber),
      selected: round.selected || roundsSort[0].roundNumber.toString(),
    });
    return roundsSort[0].roundNumber.toString();
  };

  // actions types
  const getType = async (): Promise<string> => {
    if (types.selected) return types.selected;

    const { status, data } = await TerritoryGateway.in().getTerritoryTypes<TerritoryTypes[]>();
    if (!data) {
      setValues({ ...values, notFoundStatusCode: status });
      toast.error('Nenhum tipo de território encontrado');
      setIsLoading('not-found');
      return '';
    }

    const typesSort = data.sort((a, b) => b.name.localeCompare(a.name));
    setTypes({
      options: typesSort,
      selected: types.selected || typesSort[0].id.toString(),
    });
    return typesSort[0].id.toString();
  };

  // actions territory
  const getTerritoryCards = async (): Promise<void> => {
    const [roundNumber, type] = await Promise.all([getRound(), getType()]);

    const { status, data } = await TerritoryGateway.in().get(roundNumber, type.toString(), search);
    if (status > 299) {
      setValues({ ...values, notFoundStatusCode: status });
      setIsLoading('not-found');
      return;
    }
    setTerritoryCards(data);
    setIsLoading('screen');
  };

  useEffect(() => {
    void getTerritoryCards();
    // return () => {
    //   setTerritoryCards([]);
    //   setIsLoading('loading');
    //   setRound({
    //     options: [],
    //     selected: '',
    //   });
    //   setTypes({
    //     options: [],
    //     selected: '',
    //   });
    // };
  }, [round.selected, types.selected]);

  // actions round
  const changeRound = async (id: string): Promise<void> => {
    const territory = territoryCards.find((territory) => territory.territoryId === id);
    if (!territory) {
      toast.error('Território não encontrado');
      return;
    }
    if (territory.hasRounds) {
      void (await finishRound(id));
    } else {
      void (await startRound(id));
    }

    void getTerritoryCards();
  };

  // actions round
  const finishRound = async (id: string): Promise<void> => {
    const { status } = await TerritoryGateway.in().finishRound(id);
    if (status > 299) {
      toast.error('Erro ao fechar rodada do território');
      return;
    }
  };

  // actions round
  const startRound = async (id: string): Promise<void> => {
    const { status } = await TerritoryGateway.in().startRound(id);
    if (status > 299) {
      toast.error('Erro ao abrir rodada do território');
      return;
    }
  };

  // actions share
  const share = async (territoryId: string): Promise<void> => {
    const territory = territoryCards.find((territory) => territory.territoryId == territoryId);
    if (!territory) {
      toast.error('Território não encontrado');
      return;
    }
    const input = {
      overseer: territory.overseer,
      expirationTime: territory.signature.expirationDate,
      round: round.selected,
    };
    const { data, status } = await TerritoryGateway.in().signInTerritory(input, territoryId);
    if (status > 299) {
      toast.error('Erro ao compartilhar o território');
      return;
    }
    const { signature } = data;
    setTerritoryCards((old) =>
      old.map((territory) => {
        if (territory.territoryId === territoryId) {
          territory.signature.key = signature;
          territory.overseer = input.overseer;
        }
        return territory;
      })
    );
    const queryRound = new URLSearchParams({ round: round.selected });
    const query = new URLSearchParams({ p: `territorio/${territoryId}?${queryRound.toString()}`, s: signature });
    const origin = window.location.origin;
    const toShare = {
      title: `Território para trabalhar até ${new Date(territory.signature.expirationDate + ' GMT-3').toLocaleDateString()}`,
      url: `${origin}/home?${query.toString()}`,
      text: `Prezado irmão *_${territory.overseer}_*\nsegue o link para o território *${territory.name}* que você irá trabalhar até ${new Date(
        territory.signature.expirationDate + ' GMT-3'
      ).toLocaleDateString()} \n\n\r`,
    };
    await navigatorShare(toShare);
  };

  // actions share
  const copyShare = (territoryId: string) => {
    const territory = territoryCards.find((territory) => territory.territoryId == territoryId);
    if (!territory) {
      toast.error('Território não encontrado');
      return;
    }

    if (!territory.signature.key) {
      toast.error('Chave não encontrada');
      return;
    }

    const queryRound = new URLSearchParams({ round: round.selected });
    const query = new URLSearchParams({ p: `territorio/${territoryId}?${queryRound.toString()}`, s: territory.signature.key });
    const origin = window.location.origin;
    const toCopy = `${origin}/home?${query.toString()}`;
    navigator.clipboard.writeText(toCopy);
    return {
      title: `Território para trabalhar até ${new Date(territory.signature.expirationDate + ' GMT-3').toLocaleDateString()}`,
      url: toCopy,
      text: `Prezado irmão *_${territory.overseer}_*\nsegue o link para o território *${territory.name}* que você irá trabalhar até ${new Date(
        territory.signature.expirationDate + ' GMT-3'
      ).toLocaleDateString()} \n\n\r`,
    };
  };

  const updateData = (event: React.ChangeEvent<HTMLInputElement>, territoryId: string): void => {
    const { name, value } = event.target;
    const territory = territoryCards.find((territory) => territory.territoryId === territoryId);
    if (!territory) {
      toast.error('Território não encontrado');
      return;
    }
    setTerritoryCards((old) =>
      old.map((territory) => {
        if (territory.territoryId === territoryId) {
          (territory as any)[name] = value;
        }
        return territory;
      })
    );
  };

  const updateDateTime = (event: React.ChangeEvent<HTMLInputElement>, territoryId: string): void => {
    const { value } = event.target;
    const territory = territoryCards.find((territory) => territory.territoryId === territoryId);
    if (!territory) {
      toast.error('Território não encontrado');
      return;
    }
    setTerritoryCards((old) =>
      old.map((territory) => {
        if (territory.territoryId === territoryId) {
          territory.signature.expirationDate = value;
        }
        return territory;
      })
    );
  };

  // actions territory
  const revoke = async (territoryId: string): Promise<void> => {
    const territory = territoryCards.find((territory) => territory.territoryId === territoryId);
    if (!territory) {
      toast.error('Território não encontrado');
      return;
    }
    const { status } = await TerritoryGateway.in().revoke(territoryId);
    if (status > 299) {
      toast.error('Erro ao revogar o território');
      return;
    }

    void getTerritoryCards();

    setTerritoryCards((old) =>
      old.map((territory) => {
        if (territory.territoryId === territoryId) {
          territory.signature.expirationDate = '';
          territory.overseer = '';
        }
        return territory;
      })
    );
  };

  // actions search
  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
    void submitSearch();
  };

  const submitSearch = async (): Promise<void> => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      void getTerritoryCards();
    }, 300);
  };

  return {
    search,
    territoryCards,
    actions: {
      changeRound,
      share,
      updateData,
      revoke,
      updateDateTime,
      blockNavigation,
      copyShare,
    },
    round,
    setRound,
    types,
    setTypes,
    handleChangeSearch,
    submitSearch: () => void submitSearch(),
    isLoading,
  };
};
