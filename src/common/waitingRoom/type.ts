import type { PublisherProfile } from '@/lib/helper';

export type WaitingRoomGroup = {
  id: string;
  name: string;
  publishers: number;
  active?: boolean;
};

export type WaitingRoomGroupInfo = {
  id: string;
  name: string;
};

export type WaitingRoomPublisher = {
  identityKey: string;
  firstName: string;
  lastName: string;
  phoneLast4: string;
  joinedAt: string;
};

export type WaitingRoomBlock = {
  id: string;
  name: string;
};

export type WaitingRoomAssignment = {
  id: string;
  publisherId: string;
  firstName: string;
  lastName: string;
  blockId: string;
  blockName: string;
  territoryId: number;
  round: number;
};

export type PublisherRoomAssignment = {
  id: string;
  blockId: string;
  blockName: string;
  territoryId: number;
  round: number;
};

export type OverseerRoomResponse = {
  role: 'overseer';
  group: WaitingRoomGroupInfo;
  territoryId: number;
  round: number;
  publishers: WaitingRoomPublisher[];
  assignments: WaitingRoomAssignment[];
  blocks: WaitingRoomBlock[];
};

export type PublisherRoomResponse = {
  role: 'publisher';
  group: WaitingRoomGroupInfo;
  profile: PublisherProfile;
  assignments: PublisherRoomAssignment[];
};

export type WaitingRoomResponse = OverseerRoomResponse | PublisherRoomResponse;

export type WaitingRoomJoinResponse =
  | { role: 'overseer'; groupId: string; territoryId: number; round: number }
  | { role: 'publisher'; groupId: string; profile: PublisherProfile };

export type IWaitingRoomConnectedPayload = {
  roomKey: string;
  instanceId: string;
};

export type IWaitingRoomPresenceChangedPayload = {
  groupId: string;
  reason?: string;
};

export type IWaitingRoomAssignmentsChangedPayload = {
  groupId: string;
  reason?: string;
};

export type IWaitingRoomAuthExpiredPayload = {
  reason: string;
};

export type IWaitingRoomErrorPayload = {
  reason: string;
};
