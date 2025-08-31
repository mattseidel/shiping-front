import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { ShipmentService } from '../../core/services/shipment.service';
import { ClientService } from '../../core/services/client.service';
import { Shipment } from '../../shared/models/shipment.model';
import { Client } from '../../shared/models/client.model';
import { PaginatedResponse } from '../../shared/models/common.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">
        <mat-icon>dashboard</mat-icon>
        Dashboard
      </h1>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon created">
                <mat-icon>add_circle</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ createdShipments() }}</h3>
                <p>Envíos Creados</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon in-transit">
                <mat-icon>local_shipping</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ inTransitShipments() }}</h3>
                <p>En Tránsito</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon delivered">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ deliveredShipments() }}</h3>
                <p>Entregados</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon clients">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalClients() }}</h3>
                <p>Total Clientes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Activity -->
      <div class="content-grid">
        <mat-card class="recent-shipments">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Envíos Recientes
            </mat-card-title>
            <div class="spacer"></div>
            <button mat-raised-button color="primary" routerLink="/shipments">
              Ver Todos
            </button>
          </mat-card-header>
          
          <mat-card-content>
            @if (loadingShipments()) {
              <div class="loading-container">
                <mat-spinner></mat-spinner>
              </div>
            } @else if (recentShipments().length === 0) {
              <div class="empty-state">
                <mat-icon>local_shipping</mat-icon>
                <p>No hay envíos recientes</p>
                <button mat-raised-button color="primary" routerLink="/shipments/new">
                  Crear Primer Envío
                </button>
              </div>
            } @else {
              <div class="shipments-list">
                @for (shipment of recentShipments(); track shipment._id) {
                  <div class="shipment-item">
                    <div class="shipment-info">
                      <h4>{{ shipment.code }}</h4>
                      <p>{{ shipment.origin }} → {{ shipment.destination }}</p>
                      <small>{{ shipment.createdAt | date:'short' }}</small>
                    </div>
                    <mat-chip [class]="'status-' + shipment.status">
                      {{ getStatusLabel(shipment.status) }}
                    </mat-chip>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="recent-clients">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>people</mat-icon>
              Clientes Recientes
            </mat-card-title>
            <div class="spacer"></div>
            <button mat-raised-button color="primary" routerLink="/clients">
              Ver Todos
            </button>
          </mat-card-header>
          
          <mat-card-content>
            @if (loadingClients()) {
              <div class="loading-container">
                <mat-spinner></mat-spinner>
              </div>
            } @else if (recentClients().length === 0) {
              <div class="empty-state">
                <mat-icon>people</mat-icon>
                <p>No hay clientes registrados</p>
                <button mat-raised-button color="primary" routerLink="/clients/new">
                  Registrar Primer Cliente
                </button>
              </div>
            } @else {
              <div class="clients-list">
                @for (client of recentClients(); track client._id) {
                  <div class="client-item">
                    <div class="client-info">
                      <h4>{{ client.name }}</h4>
                      <p>{{ client.email }}</p>
                      <small>{{ client.createdAt | date:'short' }}</small>
                    </div>
                    <mat-icon>chevron_right</mat-icon>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
      color: #333;
      font-weight: 500;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.created {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .stat-icon.in-transit {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .stat-icon.delivered {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .stat-icon.clients {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #333;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .recent-shipments,
    .recent-clients {
      height: fit-content;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      padding-bottom: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spacer {
      flex: 1;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .shipments-list,
    .clients-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .shipment-item,
    .client-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .shipment-item:hover,
    .client-item:hover {
      background-color: #f5f5f5;
    }

    .shipment-info h4,
    .client-info h4 {
      margin: 0 0 4px 0;
      font-weight: 500;
    }

    .shipment-info p,
    .client-info p {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .shipment-info small,
    .client-info small {
      color: #999;
      font-size: 0.8rem;
    }

    .status-created {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .status-in_transit {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .status-delivered {
      background-color: #e8f5e8 !important;
      color: #4caf50 !important;
    }

    .status-canceled {
      background-color: #ffebee !important;
      color: #d32f2f !important;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private allShipments = signal<Shipment[]>([]);
  private allClients = signal<Client[]>([]);
  
  loadingShipments = signal(true);
  loadingClients = signal(true);

  // Computed signals for stats
  createdShipments = computed(() => 
    this.allShipments().filter(s => s.status === 'created').length
  );
  
  inTransitShipments = computed(() => 
    this.allShipments().filter(s => s.status === 'in_transit').length
  );
  
  deliveredShipments = computed(() => 
    this.allShipments().filter(s => s.status === 'delivered').length
  );
  
  totalClients = computed(() => this.allClients().length);

  // Recent items (last 5)
  recentShipments = computed(() => 
    this.allShipments()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );
  
  recentClients = computed(() => 
    this.allClients()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  constructor(
    private shipmentService: ShipmentService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load shipments
    this.shipmentService.getShipments({ pageSize: 100 }).subscribe({
      next: (response: PaginatedResponse<Shipment>) => {
        this.allShipments.set(response.items);
        this.loadingShipments.set(false);
      },
      error: () => {
        this.loadingShipments.set(false);
      }
    });

    // Load clients
    this.clientService.getClients({ pageSize: 100 }).subscribe({
      next: (response: PaginatedResponse<Client>) => {
        this.allClients.set(response.items);
        this.loadingClients.set(false);
      },
      error: () => {
        this.loadingClients.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels = {
      'created': 'Creado',
      'in_transit': 'En Tránsito',
      'delivered': 'Entregado',
      'canceled': 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  }
}
