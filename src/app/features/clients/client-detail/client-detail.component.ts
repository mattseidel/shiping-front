import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

import { ClientService } from '../../../core/services/client.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { Client } from '../../../shared/models/client.model';
import { Shipment } from '../../../shared/models/shipment.model';

@Component({
  selector: 'app-client-detail',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule
  ],
  template: `
    <div class="client-detail-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (client()) {
        <div class="header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>
            <mat-icon>person</mat-icon>
            {{ client()!.name }}
          </h1>
          <div class="spacer"></div>
          <button mat-raised-button color="primary" [routerLink]="['/clients', client()!._id, 'edit']">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
        </div>

        <!-- Client Information -->
        <mat-card class="client-info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>info</mat-icon>
              Información del Cliente
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre:</label>
                <span>{{ client()!.name }}</span>
              </div>
              
              <div class="info-item">
                <label>Email:</label>
                <span>{{ client()!.email }}</span>
              </div>
              
              <div class="info-item">
                <label>Teléfono:</label>
                <span>{{ client()!.phone || 'No especificado' }}</span>
              </div>
              
              <div class="info-item">
                <label>Fecha de registro:</label>
                <span>{{ client()!.createdAt | date:'medium' }}</span>
              </div>
              
              <div class="info-item">
                <label>Última actualización:</label>
                <span>{{ client()!.updatedAt | date:'medium' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Addresses -->
        @if (client()!.addresses && client()!.addresses!.length > 0) {
          <mat-card class="addresses-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>place</mat-icon>
                Direcciones ({{ client()!.addresses!.length }})
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="addresses-grid">
                @for (address of client()!.addresses; track address; let i = $index) {
                  <div class="address-card">
                    <h4>Dirección {{ i + 1 }}</h4>
                    <p class="address-line">{{ address.line1 }}</p>
                    @if (address.city || address.zip) {
                      <p class="address-details">
                        @if (address.city) {
                          {{ address.city }}
                        }
                        @if (address.zip) {
                          , CP {{ address.zip }}
                        }
                      </p>
                    }
                    @if (address.country) {
                      <p class="address-country">{{ address.country }}</p>
                    }
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- Client Shipments -->
        <mat-card class="shipments-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>local_shipping</mat-icon>
              Envíos del Cliente
            </mat-card-title>
            <div class="spacer"></div>
            <button mat-raised-button color="primary" [routerLink]="['/shipments/new']" 
                    [queryParams]="{clientId: client()!._id}">
              <mat-icon>add</mat-icon>
              Nuevo Envío
            </button>
          </mat-card-header>
          
          <mat-card-content>
            @if (loadingShipments()) {
              <div class="loading-container">
                <mat-spinner></mat-spinner>
              </div>
            } @else if (shipments().length === 0) {
              <div class="empty-state">
                <mat-icon>local_shipping</mat-icon>
                <h3>No hay envíos</h3>
                <p>Este cliente aún no tiene envíos registrados</p>
                <button mat-raised-button color="primary" [routerLink]="['/shipments/new']" 
                        [queryParams]="{clientId: client()!._id}">
                  <mat-icon>add</mat-icon>
                  Crear Primer Envío
                </button>
              </div>
            } @else {
              <div class="table-container">
                <table mat-table [dataSource]="shipments()" class="shipments-table">
                  <!-- Code Column -->
                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Código</th>
                    <td mat-cell *matCellDef="let shipment">
                      <strong>{{ shipment.code }}</strong>
                    </td>
                  </ng-container>

                  <!-- Route Column -->
                  <ng-container matColumnDef="route">
                    <th mat-header-cell *matHeaderCellDef>Ruta</th>
                    <td mat-cell *matCellDef="let shipment">
                      {{ shipment.origin }} → {{ shipment.destination }}
                    </td>
                  </ng-container>

                  <!-- Weight Column -->
                  <ng-container matColumnDef="weight">
                    <th mat-header-cell *matHeaderCellDef>Peso</th>
                    <td mat-cell *matCellDef="let shipment">
                      {{ shipment.weightKg }} kg
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let shipment">
                      <mat-chip [class]="'status-' + shipment.status">
                        {{ getStatusLabel(shipment.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <!-- Created Date Column -->
                  <ng-container matColumnDef="createdAt">
                    <th mat-header-cell *matHeaderCellDef>Fecha</th>
                    <td mat-cell *matCellDef="let shipment">
                      {{ shipment.createdAt | date:'short' }}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="shipmentsColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: shipmentsColumns;" 
                      class="shipment-row"
                      [routerLink]="['/shipments', row._id]">
                  </tr>
                </table>
              </div>

              @if (shipments().length >= 5) {
                <div class="view-all-shipments">
                  <button mat-button color="primary" [routerLink]="['/shipments']" 
                          [queryParams]="{clientId: client()!._id}">
                    Ver todos los envíos
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              }
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="error-state">
          <mat-icon>error</mat-icon>
          <h3>Cliente no encontrado</h3>
          <p>El cliente que buscas no existe o ha sido eliminado</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver a la lista
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .client-detail-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #333;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .client-info-card,
    .addresses-card,
    .shipments-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .info-item span {
      color: #333;
    }

    .addresses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .address-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background-color: #fafafa;
    }

    .address-card h4 {
      margin: 0 0 12px 0;
      color: #666;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .address-line {
      margin: 0 0 8px 0;
      font-weight: 500;
      color: #333;
    }

    .address-details,
    .address-country {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .empty-state,
    .error-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state mat-icon,
    .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3,
    .error-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .empty-state p,
    .error-state p {
      margin-bottom: 24px;
    }

    .table-container {
      overflow-x: auto;
    }

    .shipments-table {
      width: 100%;
    }

    .shipment-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .shipment-row:hover {
      background-color: #f5f5f5;
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

    .view-all-shipments {
      margin-top: 16px;
      text-align: center;
    }

    .view-all-shipments button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .info-grid,
      .addresses-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  client = signal<Client | null>(null);
  shipments = signal<Shipment[]>([]);
  loading = signal(false);
  loadingShipments = signal(false);
  clientId: string | null = null;
  
  shipmentsColumns: string[] = ['code', 'route', 'weight', 'status', 'createdAt'];

  constructor(
    private clientService: ClientService,
    private shipmentService: ShipmentService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.clientId = params['id'];
        this.loadClient();
        this.loadClientShipments();
      }
    });
  }

  loadClient(): void {
    if (!this.clientId) return;
    
    this.loading.set(true);
    
    this.clientService.getClient(this.clientId).subscribe({
      next: (client: Client) => {
        this.client.set(client);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al cargar el cliente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadClientShipments(): void {
    if (!this.clientId) return;
    
    this.loadingShipments.set(true);
    
    this.shipmentService.getShipments({ 
      clientId: this.clientId,
      pageSize: 5 // Only load first 5 for preview
    }).subscribe({
      next: (response) => {
        this.shipments.set(response.items);
        this.loadingShipments.set(false);
      },
      error: () => {
        this.loadingShipments.set(false);
        // Silent fail for shipments as it's not critical
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

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}
