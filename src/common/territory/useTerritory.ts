import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { blockGateway } from '@/infra/Gateway/BlockGateway';
import { TerritoryGateway } from '@/infra/Gateway/TerritoryGateway';
import { loadState } from '@/states/load';
import { navigatorShare } from '@/utils/share';

import { ITerritory, IUseTerritory } from './type';

export const useTerritory = (territoryId: number, initialState?: ITerritory): IUseTerritory => {
  const [territory, setTerritory] = useState<ITerritory>(
    initialState || {
      territoryId: 0,
      territoryName: '',
      hasRound: false,
      blocks: [],
      history: [],
    }
  );
  const [_, _setLoadState] = useRecoilState(loadState);

  const getTerritories = useCallback(
    async (id: number): Promise<void> => {
      _setLoadState({ loader: 'spiral', message: 'Carregando território' });
      if (!id) return;
      const { status, data } = await TerritoryGateway.in().getById(id);
      if (status > 299) {
        alert('Erro ao buscar os territórios');
        _setLoadState({ loader: 'none', message: '' });
        return;
      }
      setTerritory(data);
      _setLoadState({ loader: 'none', message: '' });
    },
    [_setLoadState]
  );

  useEffect(() => {
    void getTerritories(territoryId);
  }, [getTerritories, territoryId]);

  const share = async (blockId: number): Promise<void> => {
    const exist = territory.blocks.find((block) => block.id === blockId);
    if (!exist) {
      alert('Quadra não encontrado');
      return;
    }

    const input = {
      blockId,
      territoryId: territory.territoryId,
    };
    const { status, data } = await blockGateway.signInBlock(input);
    if (status > 299) {
      console.log({ data, status });
      alert('Erro ao tentar compartilhar a quadra');
      return;
    }
    const signature = data.signature as string;
    await navigatorShare({
      title: 'Prezado(a) publicador(a)',
      text: 'Segue o link para a quadra que você está designado(a) para pregar:',
      url: `${window.location.origin}/quadra?s=${signature}`,
    });

    void getTerritories(territoryId);
  };

  return {
    territory,
    actions: {
      share,
    },
  };
};
