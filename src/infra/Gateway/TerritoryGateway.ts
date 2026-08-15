import AxiosAdapter from '../http/AxiosAdapter';
import { ResponseHttp } from '../http/HttpClient';
import HttpClient from '../http/HttpClient';

class TerritoryGatewayHttp {
  constructor(private readonly http: HttpClient) {}

  getById(territoryId: string, round: string): Promise<ResponseHttp> {
    const query = new URLSearchParams({ round });
    return this.http.get(`territories/${territoryId}?${query.toString()}`);
  }

  getSignature(signatureId: string): Promise<ResponseHttp> {
    return this.http.get(`signature/${signatureId}`);
  }
}

const territoryGatewayHttp = new TerritoryGatewayHttp(new AxiosAdapter());

export class TerritoryGateway {
  static in(): TerritoryGatewayHttp {
    return territoryGatewayHttp;
  }
}
