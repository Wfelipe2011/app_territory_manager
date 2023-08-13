/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { atom } from "recoil";


type AuthState = {
   token: string
   overseer?: string
   territoryId: number
   blockId?: number
   expirationTime: number
   signatureId?: string
   mode?: string
   roles?: Partial<Roles>[]
}
 
type Roles = 'admin' | 'publisher' | 'overseer'

export const authState = atom<AuthState>({
   key: 'authState',
   default: {
      token: '',
      overseer: '',
      territoryId: 0,
      blockId: 0,
      expirationTime: 0,
      signatureId: '',
      mode: '',
      roles: (() => {
         const storage =  ''
         if (!storage) return []
         const roles: Partial<Roles>[] = storage?.includes(',') ? storage.split(',') as any : [storage]
         return roles
      })(),
   },
});