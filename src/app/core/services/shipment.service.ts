import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Shipment, 
  CreateShipmentRequest, 
  UpdateShipmentRequest, 
  UpdateShipmentStatusRequest,
  ShipmentHistory,
  ShipmentStatus 
} from '../../shared/models/shipment.model';
import { PaginatedResponse } from '../../shared/models/common.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private readonly apiUrl = 'http://localhost:4000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getShipments(params?: {
    clientId?: string;
    status?: ShipmentStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<Shipment>> {
    let httpParams = new HttpParams();
    
    if (params?.clientId) {
      httpParams = httpParams.set('clientId', params.clientId);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<PaginatedResponse<Shipment>>(`${this.apiUrl}/shipments`, {
      params: httpParams,
      headers: this.authService.getAuthHeaders()
    });
  }

  getShipment(id: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/shipments/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createShipment(shipment: CreateShipmentRequest): Observable<Shipment> {
    return this.http.post<Shipment>(`${this.apiUrl}/shipments`, shipment, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateShipment(id: string, shipment: UpdateShipmentRequest): Observable<Shipment> {
    return this.http.put<Shipment>(`${this.apiUrl}/shipments/${id}`, shipment, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateShipmentStatus(id: string, statusUpdate: UpdateShipmentStatusRequest): Observable<Shipment> {
    return this.http.patch<Shipment>(`${this.apiUrl}/shipments/${id}/status`, statusUpdate, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getShipmentHistory(shipmentId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<ShipmentHistory>> {
    let httpParams = new HttpParams().set('shipmentId', shipmentId);
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<PaginatedResponse<ShipmentHistory>>(`${this.apiUrl}/history`, {
      params: httpParams,
      headers: this.authService.getAuthHeaders()
    });
  }

  // Seed endpoints para testing
  seedClients(count: number = 5): Observable<{ ok: boolean; inserted: number }> {
    return this.http.post<{ ok: boolean; inserted: number }>(`${this.apiUrl}/seed/clients-basic`, 
      { count }, 
      { headers: this.authService.getAuthHeaders() }
    );
  }

  seedShipments(count: number = 5): Observable<{ ok: boolean; inserted: number }> {
    return this.http.post<{ ok: boolean; inserted: number }>(`${this.apiUrl}/seed/shipments-basic`, 
      { count }, 
      { headers: this.authService.getAuthHeaders() }
    );
  }
}
