import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ShipmentService } from '../../../core/services/shipment.service';
import { ClientService } from '../../../core/services/client.service';
import { Shipment, ShipmentStatus } from '../../../shared/models/shipment.model';
import { Client } from '../../../shared/models/client.model';
import { PaginatedResponse } from '../../../shared/models/common.model';

@Component({
  selector: 'app-shipment-list',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule
  ],
  template: `
    <div class="shipment-list-container">
      <div class="header">
        <h1>
          <mat-icon>local_shipping</mat-icon>
          Envíos
        </h1>
        <button mat-raised-button color="primary" routerLink="/shipments/new">
          <mat-icon>add</mat-icon>
          Nuevo Envío
        </button>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Lista de Envíos</mat-card-title>
          <div class="spacer"></div>
          <div class="filters">
            <mat-form-field class="search-field">
              <mat-label>Buscar por código...</mat-label>
              <input matInput [formControl]="searchControl" placeholder="TRK-ABC123">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field class="status-filter">
              <mat-label>Estado</mat-label>
              <mat-select [formControl]="statusControl">
                <mat-option value="">Todos</mat-option>
                <mat-option value="created">Creado</mat-option>
                <mat-option value="in_transit">En Tránsito</mat-option>
                <mat-option value="delivered">Entregado</mat-option>
                <mat-option value="canceled">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="client-filter">
              <mat-label>Cliente</mat-label>
              <mat-select [formControl]="clientControl">
                <mat-option value="">Todos</mat-option>
                @for (client of clients(); track client._id) {
                  <mat-option [value]="client._id">{{ client.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else if (shipments().length === 0) {
            <div class="empty-state">
              <mat-icon>local_shipping</mat-icon>
              <h3>No hay envíos</h3>
              <p>Comienza creando tu primer envío</p>
              <button mat-raised-button color="primary" routerLink="/shipments/new">
                <mat-icon>add</mat-icon>
                Crear Envío
              </button>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="shipments()" class="shipments-table">
                <!-- Code Column -->
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Código</th>
                  <td mat-cell *matCellDef="let shipment">
                    <div class="shipment-code">
                      <strong>{{ shipment.code }}</strong>
                    </div>
                  </td>
                </ng-container>

                <!-- Client Column -->
                <ng-container matColumnDef="client">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let shipment">
                    {{ getClientName(shipment.clientId) }}
                  </td>
                </ng-container>

                <!-- Route Column -->
                <ng-container matColumnDef="route">
                  <th mat-header-cell *matHeaderCellDef>Ruta</th>
                  <td mat-cell *matCellDef="let shipment">
                    <div class="route-info">
                      <span class="route-text">{{ shipment.origin }} → {{ shipment.destination }}</span>
                    </div>
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

                <!-- ETA Column -->
                <ng-container matColumnDef="eta">
                  <th mat-header-cell *matHeaderCellDef>ETA</th>
                  <td mat-cell *matCellDef="let shipment">
                    @if (shipment.eta) {
                      {{ shipment.eta | date:'short' }}
                    } @else {
                      N/A
                    }
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef>Fecha de Creación</th>
                  <td mat-cell *matCellDef="let shipment">
                    {{ shipment.createdAt | date:'short' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let shipment">
                    <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionsMenu="matMenu">
                      <button mat-menu-item [routerLink]="['/shipments', shipment._id]">
                        <mat-icon>visibility</mat-icon>
                        Ver Detalles
                      </button>
                      <button mat-menu-item [routerLink]="['/shipments', shipment._id, 'edit']">
                        <mat-icon>edit</mat-icon>
                        Editar
                      </button>
                      <button mat-menu-item (click)="updateStatus(shipment)">
                        <mat-icon>sync</mat-icon>
                        Cambiar Estado
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    class="shipment-row"
                    [routerLink]="['/shipments', row._id]">
                </tr>
              </table>
            </div>

            <mat-paginator
              [length]="totalItems()"
              [pageSize]="pageSize()"
              [pageSizeOptions]="[5, 10, 20, 50]"
              [pageIndex]="currentPage() - 1"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .shipment-list-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    mat-card-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .spacer {
      flex: 1;
    }

    .filters {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .search-field {
      min-width: 250px;
    }

    .status-filter,
    .client-filter {
      min-width: 150px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .empty-state p {
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

    .shipment-code strong {
      color: #333;
    }

    .route-info {
      display: flex;
      flex-direction: column;
    }

    .route-text {
      font-weight: 500;
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

    mat-paginator {
      margin-top: 16px;
    }

    @media (max-width: 1200px) {
      .filters {
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }

      .search-field,
      .status-filter,
      .client-filter {
        min-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      mat-card-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
    }
  `]
})
export class ShipmentListComponent implements OnInit {
  displayedColumns: string[] = ['code', 'client', 'route', 'weight', 'status', 'eta', 'createdAt', 'actions'];
  
  shipments = signal<Shipment[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  clientControl = new FormControl('');

  private clientMap = new Map<string, string>();

  constructor(
    private shipmentService: ShipmentService,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.setupFilters();
    this.checkQueryParams();
    this.loadShipments();
  }

  checkQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['clientId']) {
        this.clientControl.setValue(params['clientId']);
      }
    });
  }

  loadClients(): void {
    this.clientService.getClients({ pageSize: 100 }).subscribe({
      next: (response: PaginatedResponse<Client>) => {
        this.clients.set(response.items);
        // Create a map for quick client name lookup
        response.items.forEach(client => {
          this.clientMap.set(client._id, client.name);
        });
      },
      error: () => {
        // Silent fail for clients as it's not critical
      }
    });
  }

  setupFilters(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadShipments();
      });

    this.statusControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadShipments();
    });

    this.clientControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadShipments();
    });
  }

  loadShipments(): void {
    this.loading.set(true);
    
    const params = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchControl.value || undefined,
      status: this.statusControl.value as ShipmentStatus || undefined,
      clientId: this.clientControl.value || undefined
    };

    this.shipmentService.getShipments(params).subscribe({
      next: (response: PaginatedResponse<Shipment>) => {
        this.shipments.set(response.items);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al cargar los envíos';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadShipments();
  }

  getClientName(clientId: string): string {
    return this.clientMap.get(clientId) || 'Cliente no encontrado';
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

  updateStatus(shipment: Shipment): void {
    // This would open a dialog to update status
    // For now, just show a message
    this.snackBar.open('Función de cambio de estado en desarrollo', 'Cerrar', {
      duration: 3000
    });
  }
}
