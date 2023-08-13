export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true' ?? false;

export const env = {
  storage: {
      token: '@territoryManager/token',
      overseer: '@territoryManager/overseer',
      territoryId: '@territoryManager/territoryId',
      blockId: '@territoryManager/blockId',
      expirationTime: '@territoryManager/expirationTime',
      signatureId: '@territoryManager/signatureId',
      mode: '@territoryManager/mode',
      roles: '@territoryManager/roles',
  }
}