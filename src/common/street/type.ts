export type IUseStreet = {
  street: Street;
  actions: IActions;
};

export type IActions = {
  mark: (id: string) => Promise<void>;
};

export type Street = {
  streetName: string;
  territoryName: string;
  blockName: string;
  houses: House[];
};

export type House = {
  id: string;
  number: string;
  complement: string | null;
  leaveLetter: boolean;
  order: string;
  legend: string;
  status: boolean;
  dontVisit: boolean;
  reportType: string | null;
};

export type IStreetConnectedPayload = {
  streetKey: string;
  instanceId: string;
};

export type IStreetPresenceChangedPayload = {
  streetKey: string;
  userCount: number;
};

export type IStreetChangedPayload = {
  streetKey: string;
  reason: string;
  territoryId?: number;
  blockId?: number;
  addressId?: number;
  round?: number;
};

export type IStreetAuthExpiredPayload = {
  reason: string;
};

export type IStreetErrorPayload = {
  reason: string;
};
