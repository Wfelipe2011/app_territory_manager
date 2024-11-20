import AxiosAdapter from '../http/AxiosAdapter';
import HttpClient, { ResponseHttp } from '../http/HttpClient';

interface SendInsertReport {
  number: string;
  dontVisit: boolean;
  blockId: number;
  addressId: number;
  territoryId: number;
  legend: string;
  observations: string;
  reportType: string;
}

interface SendUpdateReport extends SendInsertReport {
  id: number;
}

class ReportsGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async sendInsertReport(data: SendInsertReport): Promise<ResponseHttp> {
    return this.httpClient.post('reports', data);
  }

  async sendUpdateReport(data: SendUpdateReport): Promise<ResponseHttp> {
    return this.httpClient.post('reports', data);
  }
}

export const reportsGateway = new ReportsGateway(new AxiosAdapter());
