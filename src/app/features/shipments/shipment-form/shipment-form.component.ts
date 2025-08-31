import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ShipmentService } from '../../../core/services/shipment.service';
import { ClientService } from '../../../core/services/client.service';
import { Shipment, CreateShipmentRequest, UpdateShipmentRequest, ShipmentStatus } from '../../../shared/models/shipment.model';
import { Client } from '../../../shared/models/client.model';
import { PaginatedResponse } from '../../../shared/models/common.model';

@Component({
  selector: 'app-shipment-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="shipment-form-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>
          <mat-icon>{{ isEdit() ? 'edit' : 'add_circle' }}</mat-icon>
          {{ isEdit() ? 'Editar Envío' : 'Nuevo Envío' }}
        </h1>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEdit() ? 'Editar información del envío' : 'Información del envío' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else {
            <form [formGroup]="shipmentForm" (ngSubmit)="onSubmit()">
              <div class="form-section">
                <h3>Información Básica</h3>
                
                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Cliente *</mat-label>
                    <mat-select formControlName="clientId">
                      @for (client of clients(); track client._id) {
                        <mat-option [value]="client._id">{{ client.name }}</mat-option>
                      }
                    </mat-select>
                    @if (shipmentForm.get('clientId')?.invalid && shipmentForm.get('clientId')?.touched) {
                      <mat-error>El cliente es requerido</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Código de envío *</mat-label>
                    <input matInput formControlName="code" placeholder="TRK-ABC123">
                    <mat-icon matSuffix>qr_code</mat-icon>
                    @if (shipmentForm.get('code')?.invalid && shipmentForm.get('code')?.touched) {
                      <mat-error>
                        @if (shipmentForm.get('code')?.errors?.['required']) {
                          El código es requerido
                        } @else if (shipmentForm.get('code')?.errors?.['pattern']) {
                          El código solo puede contener letras y números
                        }
                      </mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row-grid">
                  <mat-form-field>
                    <mat-label>Origen *</mat-label>
                    <input matInput formControlName="origin" placeholder="Ciudad de México">
                    <mat-icon matSuffix>flight_takeoff</mat-icon>
                    @if (shipmentForm.get('origin')?.invalid && shipmentForm.get('origin')?.touched) {
                      <mat-error>El origen es requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Destino *</mat-label>
                    <input matInput formControlName="destination" placeholder="Guadalajara">
                    <mat-icon matSuffix>flight_land</mat-icon>
                    @if (shipmentForm.get('destination')?.invalid && shipmentForm.get('destination')?.touched) {
                      <mat-error>El destino es requerido</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row-grid">
                  <mat-form-field>
                    <mat-label>Peso (kg) *</mat-label>
                    <input matInput type="number" formControlName="weightKg" min="0" step="0.1">
                    <mat-icon matSuffix>scale</mat-icon>
                    @if (shipmentForm.get('weightKg')?.invalid && shipmentForm.get('weightKg')?.touched) {
                      <mat-error>
                        @if (shipmentForm.get('weightKg')?.errors?.['required']) {
                          El peso es requerido
                        } @else if (shipmentForm.get('weightKg')?.errors?.['min']) {
                          El peso debe ser mayor a 0
                        }
                      </mat-error>
                    }
                  </mat-form-field>

                  @if (!isEdit()) {
                    <mat-form-field>
                      <mat-label>Estado inicial</mat-label>
                      <mat-select formControlName="status">
                        <mat-option value="created">Creado</mat-option>
                        <mat-option value="in_transit">En Tránsito</mat-option>
                        <mat-option value="delivered">Entregado</mat-option>
                        <mat-option value="canceled">Cancelado</mat-option>
                      </mat-select>
                    </mat-form-field>
                  }
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Fecha estimada de llegada (ETA)</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="eta">
                    <mat-hint>Opcional</mat-hint>
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                </div>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="goBack()">
                  Cancelar
                </button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="shipmentForm.invalid || submitting()"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                    {{ isEdit() ? 'Actualizando...' : 'Creando...' }}
                  } @else {
                    {{ isEdit() ? 'Actualizar Envío' : 'Crear Envío' }}
                  }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .shipment-form-container {
      max-width: 800px;
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

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-weight: 500;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .form-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .form-actions button {
      min-width: 120px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .form-row-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class ShipmentFormComponent implements OnInit {
  shipmentForm: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  isEdit = signal(false);
  clients = signal<Client[]>([]);
  shipmentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.shipmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();
    this.checkRouteParams();
    this.checkQueryParams();
  }

  createForm(): FormGroup {
    return this.fb.group({
      clientId: ['', [Validators.required]],
      code: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      origin: ['', [Validators.required]],
      destination: ['', [Validators.required]],
      weightKg: ['', [Validators.required, Validators.min(0.1)]],
      status: ['created'],
      eta: ['']
    });
  }

  checkRouteParams(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.shipmentId = params['id'];
        this.isEdit.set(true);
        this.loadShipment(this.shipmentId!);
        // Remove status field for editing
        this.shipmentForm.removeControl('status');
      }
    });
  }

  checkQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['clientId'] && !this.isEdit()) {
        this.shipmentForm.get('clientId')?.setValue(params['clientId']);
      }
    });
  }

  loadClients(): void {
    this.clientService.getClients({ pageSize: 100 }).subscribe({
      next: (response: PaginatedResponse<Client>) => {
        this.clients.set(response.items);
      },
      error: (error: any) => {
        const message = error.error?.message || 'Error al cargar los clientes';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadShipment(id: string): void {
    this.loading.set(true);
    
    this.shipmentService.getShipment(id).subscribe({
      next: (shipment: Shipment) => {
        this.shipmentForm.patchValue({
          clientId: shipment.clientId,
          code: shipment.code,
          origin: shipment.origin,
          destination: shipment.destination,
          weightKg: shipment.weightKg,
          eta: shipment.eta ? new Date(shipment.eta) : null
        });
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al cargar el envío';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.shipmentForm.valid) {
      this.submitting.set(true);

      const formData = { ...this.shipmentForm.value };
      
      // Format ETA if provided
      if (formData.eta) {
        formData.eta = new Date(formData.eta).toISOString();
      } else {
        delete formData.eta;
      }

      const request = this.isEdit() 
        ? this.shipmentService.updateShipment(this.shipmentId!, formData as UpdateShipmentRequest)
        : this.shipmentService.createShipment(formData as CreateShipmentRequest);

      request.subscribe({
        next: () => {
          this.submitting.set(false);
          const message = this.isEdit() 
            ? 'Envío actualizado exitosamente'
            : 'Envío creado exitosamente';
          
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
          this.router.navigate(['/shipments']);
        },
        error: (error: any) => {
          this.submitting.set(false);
          const message = error.error?.message || 'Error al guardar el envío';
          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/shipments']);
  }
}
