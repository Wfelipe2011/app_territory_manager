import { Period } from '@/enum/Period';

export type IUseHome = {
  search: string;
  territoryCards: ITerritoryCard[];
  actions: IActions;
  handleChangeSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  submitSearch: () => void;
};

export type ITerritoryCard = {
  territoryId: number;
  name: string;
  overseer: string;
  signature: {
    key: string | null;
    expirationDate: string;
  };
  hasRounds: boolean;
  positiveCompleted: {
    date: Date;
    period: Period;
  }[];
  negativeCompleted: number;
};

export type IActions = {
  changeRound: (id: number) => Promise<void>;
  share: (territoryId: number) => Promise<void>;
  updateData: (event: React.ChangeEvent<HTMLInputElement>, territoryId: number) => void;
  updateDateTime: (event: React.ChangeEvent<HTMLInputElement>, territoryId: number) => void;
  revoke: (territoryId: number) => Promise<void>;
};
