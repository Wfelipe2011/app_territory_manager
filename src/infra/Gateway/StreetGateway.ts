import AxiosAdapter from "../http/AxiosAdapter";
import HttpClient, { ResponseHttp } from "../http/HttpClient";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace StreetGatewayRequest {
   export type signInStreet = {
      addressId: number
      territoryId: number
      blockId: number
   }
   export type markHouse = {
      addressId: number
      territoryId: number
      blockId: number
      houseId: number
      status: boolean
   }
}

class StreetGateway {
   constructor(
      private readonly httpClient: HttpClient
   ) { }

   signInStreet({ addressId, territoryId, blockId }: { addressId: number; territoryId: number, blockId: number }): Promise<ResponseHttp> {
      return this.httpClient.get(`territories/${territoryId}/blocks/${blockId}/address/${addressId}`)
   }

   markHouse({ addressId, territoryId, blockId, houseId, status }: StreetGatewayRequest.markHouse): Promise<ResponseHttp> {
      return this.httpClient.patch(`territories/${territoryId}/blocks/${blockId}/address/${addressId}/houses/${houseId}`, { status })
   }
}

export const streetGateway = new StreetGateway(new AxiosAdapter())
