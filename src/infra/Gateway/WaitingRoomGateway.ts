import AxiosAdapter from '../http/AxiosAdapter';
import HttpClient, { ResponseHttp } from '../http/HttpClient';

type JoinGroupInput = {
  firstName?: string;
  lastName?: string;
  phoneLast4?: string;
  territoryId?: number;
  round?: number;
};

type AssignmentInput = {
  publisherId: string;
  blockId: string;
  territoryId: number;
  round: number;
};

class WaitingRoomGateway {
  constructor(private readonly httpClient: HttpClient) {}

  getGroups(tenantKey: string): Promise<ResponseHttp> {
    const query = new URLSearchParams({ s: tenantKey });
    return this.httpClient.get(`waiting-room/groups?${query.toString()}`);
  }

  joinGroup(groupId: string, tenantKey: string, data: JoinGroupInput): Promise<ResponseHttp> {
    return this.httpClient.post(`waiting-room/groups/${groupId}/join?s=${tenantKey}`, data);
  }

  getRoom(groupId: string, tenantKey: string): Promise<ResponseHttp> {
    return this.httpClient.get(`waiting-room/groups/${groupId}?s=${tenantKey}`);
  }

  heartbeat(groupId: string, tenantKey: string): Promise<ResponseHttp> {
    return this.httpClient.post(`waiting-room/groups/${groupId}/heartbeat?s=${tenantKey}`, {});
  }

  createAssignment(groupId: string, tenantKey: string, data: AssignmentInput): Promise<ResponseHttp> {
    return this.httpClient.post(`waiting-room/groups/${groupId}/assignments?s=${tenantKey}`, data);
  }

  removeAssignment(groupId: string, tenantKey: string, data: { publisherId: string; blockId: string }): Promise<ResponseHttp> {
    return this.httpClient.delete(`waiting-room/groups/${groupId}/assignments?s=${tenantKey}`, data);
  }

  createBlockSignature(groupId: string, blockId: string, tenantKey: string): Promise<ResponseHttp> {
    return this.httpClient.post(`waiting-room/groups/${groupId}/blocks/${blockId}/signature?s=${tenantKey}`, {});
  }
}

export const waitingRoomGateway = new WaitingRoomGateway(new AxiosAdapter());
