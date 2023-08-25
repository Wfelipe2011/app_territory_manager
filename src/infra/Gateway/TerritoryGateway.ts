import AxiosAdapter from '../http/AxiosAdapter'
import { ResponseHttp } from '../http/HttpClient'
import HttpClient from '../http/HttpClient'
import { HttpMemoryAdapter } from '../http/HttpMemoryAdapter'

class TerritoryGatewayHttp {
  constructor(private readonly http: HttpClient) { }

  get(search?: string): Promise<ResponseHttp> {
    const query = search ? `?filter=${search}` : ''
    return this.http.get(`territories${query}`)
  }

  update(data: any): Promise<ResponseHttp> {
    return this.http.put(`territories/`, data)
  }

  revoke(id: number): Promise<ResponseHttp> {
    return this.http.delete(`territories/${id}/signature`)
  }

  finishRound(id: number): Promise<ResponseHttp> {
    return this.http.post(`territories/${id}/rounds/finish`)
  }

  startRound(id: number): Promise<ResponseHttp> {
    return this.http.post(`territories/${id}/rounds/start`)
  }

  signInTerritory(data: { overseer: string; expirationTime: string }, id: number): Promise<ResponseHttp> {
    return this.http.post(`territories/${id}/signature`, data)
  }

  getById(territoryId: number): Promise<ResponseHttp> {
    return this.http.get(`territories/${territoryId}`)
  }

  getSignature(signatureId: string): Promise<ResponseHttp> {
    return this.http.get(`signature/${signatureId}`)
  }
}



const territoryGatewayHttp = new TerritoryGatewayHttp(new AxiosAdapter())
const territoryGatewayMemory = new TerritoryGatewayHttp(new HttpMemoryAdapter([
]))

export class TerritoryGateway {
  static in(module: 'http' | 'memory' = 'http'): TerritoryGatewayHttp {
    return module === 'http' ? territoryGatewayHttp : territoryGatewayMemory
  }
}