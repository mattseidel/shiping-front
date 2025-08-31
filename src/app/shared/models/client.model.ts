export interface Address {
  line1: string;
  city?: string;
  country?: string;
  zip?: string;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: Address[];
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  addresses?: Address[];
  ownerUserId: string;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  addresses?: Address[];
  ownerUserId?: string;
}
