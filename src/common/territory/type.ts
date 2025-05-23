export type IUseTerritory = {
  territory: ITerritory;
  actions: IActions;
};

export type IActions = {
  share: (blockId: string) => Promise<void>;
  blockNavigation: (territoryId: string, blockId: string, round: string) => void;
};

export type ITerritory = {
  territoryId: string;
  territoryName: string;
  imageUrl?: string;
  hasRound: boolean;
  history: IHistory[];
  blocks: IBlock[];
};

export type IHistory = {
  overseer: string;
  initialDate: string;
  expiralDate: string;
  finished: boolean;
};

export type IBlock = {
  id: string;
  name: string;
  signature: ISignature | null;
  negativeCompleted: number;
  positiveCompleted: number;
  connections: number;
  updateAt: string | null; // "2025-04-13T02:59:59.000Z" | null;
};

export type ISignature = {
  key: string;
  expirationDate: string;
};
