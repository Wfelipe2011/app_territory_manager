import jwt_decode from 'jwt-decode';

export const openToken = (token: string) => {
  const tokenDecoded = jwt_decode<{
    overseer?: string;
    territoryId: number;
    blockId?: number;
    round?: number;
    exp: number;
    roles: string[];
  }>(token);
  return {
    overseer: tokenDecoded?.overseer,
    territoryId: tokenDecoded?.territoryId,
    blockId: tokenDecoded?.blockId,
    round: tokenDecoded?.round,
    exp: tokenDecoded?.exp,
    roles: tokenDecoded?.roles as any,
  };
};
