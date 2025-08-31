export type ShipmentStatus = 'created' | 'in_transit' | 'delivered' | 'canceled';

export interface Shipment {
  _id: string;
  clientId: string;
  code: string;
  origin: string;
  destination: string;
  weightKg: number;
  status: ShipmentStatus;
  eta?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentRequest {
  clientId: string;
  code: string;
  origin: string;
  destination: string;
  weightKg: number;
  status?: ShipmentStatus;
  eta?: string;
}

export interface UpdateShipmentRequest {
  code?: string;
  origin?: string;
  destination?: string;
  weightKg?: number;
  eta?: string;
}

export interface UpdateShipmentStatusRequest {
  newStatus: ShipmentStatus;
  note?: string;
}

export interface ShipmentHistory {
  _id: string;
  shipmentId: string;
  prevStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  note?: string;
  changedBy: string;
  at: string;
}
