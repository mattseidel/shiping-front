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
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ShipmentService } from '../../../core/services/shipment.service';
import { ClientService } from '../../../core/services/client.service';
import { Shipment, ShipmentHistory, ShipmentStatus, UpdateShipmentStatusRequest } from '../../../shared/models/shipment.model';
import { Client } from '../../../shared/models/client.model';

@Component({
  selector: 'app-shipment-detail',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="shipment-detail-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (shipment()) {
        <div class="header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>
            <mat-icon>local_shipping</mat-icon>
            {{ shipment()!.code }}
          </h1>
          <div class="spacer"></div>
          <button mat-raised-button color="primary" [routerLink]="['/shipments', shipment()!._id, 'edit']">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
        </div>

        <!-- Shipment Information -->
        <mat-card class="shipment-info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>info</mat-icon>
              Información del Envío
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Código:</label>
                <span class="shipment-code">{{ shipment()!.code }}</span>
              </div>
              
              <div class="info-item">
                <label>Cliente:</label>
                <span>{{ clientName() }}</span>
              </div>
              
              <div class="info-item">
                <label>Origen:</label>
                <span>{{ shipment()!.origin }}</span>
              </div>
              
              <div class="info-item">
                <label>Destino:</label>
                <span>{{ shipment()!.destination }}</span>
              </div>
              
              <div class="info-item">
                <label>Peso:</label>
                <span>{{ shipment()!.weightKg }} kg</span>
              </div>
              
              <div class="info-item">
                <label>Estado:</label>
                <mat-chip [class]="'status-' + shipment()!.status">
                  {{ getStatusLabel(shipment()!.status) }}
                </mat-chip>
              </div>
              
              <div class="info-item">
                <label>ETA:</label>
                <span>{{ shipment()!.eta ? (shipment()!.eta | date:'medium') : 'No especificado' }}</span>
              </div>
              
              <div class="info-item">
                <label>Fecha de creación:</label>
                <span>{{ shipment()!.createdAt | date:'medium' }}</span>
              </div>
              
              <div class="info-item">
                <label>Última actualización:</label>
                <span>{{ shipment()!.updatedAt | date:'medium' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Status Update Card -->
        <mat-card class="status-update-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>sync</mat-icon>
              Actualizar Estado
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="status-form">
              <mat-form-field class="status-select">
                <mat-label>Nuevo estado</mat-label>
                <mat-select [formControl]="newStatusControl">
                  <mat-option value="created">Creado</mat-option>
                  <mat-option value="in_transit">En Tránsito</mat-option>
                  <mat-option value="delivered">Entregado</mat-option>
                  <mat-option value="canceled">Cancelado</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="note-field">
                <mat-label>Nota (opcional)</mat-label>
                <textarea matInput [formControl]="noteControl" rows="3" placeholder="Descripción del cambio..."></textarea>
              </mat-form-field>

              <button 
                mat-raised-button 
                color="primary" 
                (click)="updateStatus()"
                [disabled]="updatingStatus() || newStatusControl.invalid || newStatusControl.value === shipment()!.status"
              >
                @if (updatingStatus()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  Actualizando...
                } @else {
                  <mat-icon>update</mat-icon>
                }
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- History Card -->
        <mat-card class="history-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Historial de Estados
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            @if (loadingHistory()) {
              <div class="loading-container">
                <mat-spinner></mat-spinner>
              </div>
            } @else if (history().length === 0) {
              <div class="empty-state">
                <mat-icon>history</mat-icon>
                <p>No hay cambios de estado registrados</p>
              </div>
            } @else {
              <div class="history-timeline">
                @for (entry of history(); track entry._id) {
                  <div class="timeline-item">
                    <div class="timeline-marker">
                      <mat-icon>{{ getStatusIcon(entry.newStatus) }}</mat-icon>
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <span class="status-change">
                          {{ getStatusLabel(entry.prevStatus) }} → {{ getStatusLabel(entry.newStatus) }}
                        </span>
                        <span class="timeline-date">{{ entry.at | date:'medium' }}</span>
                      </div>
                      @if (entry.note) {
                        <p class="timeline-note">{{ entry.note }}</p>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="error-state">
          <mat-icon>error</mat-icon>
          <h3>Envío no encontrado</h3>
          <p>El envío que buscas no existe o ha sido eliminado</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver a la lista
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .shipment-detail-container {
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

    .shipment-info-card,
    .status-update-card,
    .history-card {
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

    .shipment-code {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      background-color: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .status-form {
      display: grid;
      grid-template-columns: 200px 1fr auto;
      gap: 16px;
      align-items: flex-start;
    }

    .status-select,
    .note-field {
      width: 100%;
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

    .empty-state p,
    .error-state p {
      margin-bottom: 24px;
    }

    .error-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .history-timeline {
      position: relative;
      padding-left: 40px;
    }

    .history-timeline::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #e0e0e0;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 24px;
      padding-bottom: 16px;
    }

    .timeline-marker {
      position: absolute;
      left: -30px;
      top: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #3f51b5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .timeline-content {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #3f51b5;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .status-change {
      font-weight: 500;
      color: #333;
    }

    .timeline-date {
      color: #666;
      font-size: 0.9rem;
    }

    .timeline-note {
      margin: 0;
      color: #666;
      font-style: italic;
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
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .status-form {
        grid-template-columns: 1fr;
      }

      .timeline-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class ShipmentDetailComponent implements OnInit {
  shipment = signal<Shipment | null>(null);
  history = signal<ShipmentHistory[]>([]);
  clientName = signal<string>('');
  loading = signal(false);
  loadingHistory = signal(false);
  updatingStatus = signal(false);
  shipmentId: string | null = null;
  
  newStatusControl = new FormControl<ShipmentStatus>('created', [Validators.required]);
  noteControl = new FormControl('');

  constructor(
    private shipmentService: ShipmentService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.shipmentId = params['id'];
        this.loadShipment();
        this.loadHistory();
      }
    });
  }

  loadShipment(): void {
    if (!this.shipmentId) return;
    
    this.loading.set(true);
    
    this.shipmentService.getShipment(this.shipmentId).subscribe({
      next: (shipment: Shipment) => {
        this.shipment.set(shipment);
        this.newStatusControl.setValue(shipment.status as ShipmentStatus);
        this.loadClient(shipment.clientId);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al cargar el envío';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadClient(clientId: string): void {
    this.clientService.getClient(clientId).subscribe({
      next: (client: Client) => {
        this.clientName.set(client.name);
      },
      error: () => {
        this.clientName.set('Cliente no encontrado');
      }
    });
  }

  loadHistory(): void {
    if (!this.shipmentId) return;
    
    this.loadingHistory.set(true);
    
    this.shipmentService.getShipmentHistory(this.shipmentId).subscribe({
      next: (response) => {
        this.history.set(response.items);
        this.loadingHistory.set(false);
      },
      error: () => {
        this.loadingHistory.set(false);
        // Silent fail for history as it's not critical
      }
    });
  }

  updateStatus(): void {
    if (!this.shipmentId || this.newStatusControl.invalid) return;

    const updateData: UpdateShipmentStatusRequest = {
      newStatus: this.newStatusControl.value!,
      note: this.noteControl.value || undefined
    };

    this.updatingStatus.set(true);

    this.shipmentService.updateShipmentStatus(this.shipmentId, updateData).subscribe({
      next: (updatedShipment: Shipment) => {
        this.updatingStatus.set(false);
        this.shipment.set(updatedShipment);
        this.noteControl.setValue('');
        this.snackBar.open('Estado actualizado exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.loadHistory(); // Reload history to show the new entry
      },
      error: (error: any) => {
        this.updatingStatus.set(false);
        const message = error.error?.message || 'Error al actualizar el estado';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
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

  getStatusIcon(status: string): string {
    const icons = {
      'created': 'add_circle',
      'in_transit': 'local_shipping',
      'delivered': 'check_circle',
      'canceled': 'cancel'
    };
    return icons[status as keyof typeof icons] || 'circle';
  }

  goBack(): void {
    this.router.navigate(['/shipments']);
  }
}
