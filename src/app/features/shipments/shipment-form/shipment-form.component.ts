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
  templateUrl: './shipment-form.component.html',
  styleUrls: ['./shipment-form.component.css']
})
export class ShipmentFormComponent implements OnInit {
  shipmentForm: FormGroup;

  trackByClient(index: number, client: Client): string {
    return client._id;
  }
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
      // Allow letters, numbers and hyphens in shipment code (e.g. TRK-ABC123)
      code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]+$/)]],
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
