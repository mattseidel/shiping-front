import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../../shared/models/client.model';

@Component({
  selector: 'app-client-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="client-form-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>
          <mat-icon>{{ isEdit() ? 'edit' : 'person_add' }}</mat-icon>
          {{ isEdit() ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </h1>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEdit() ? 'Editar información del cliente' : 'Información del cliente' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else {
            <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
              <!-- Basic Information -->
              <div class="form-section">
                <h3>Información Básica</h3>
                
                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Nombre de la empresa *</mat-label>
                    <input matInput formControlName="name" placeholder="Ej: ACME Corporation">
                    <mat-icon matSuffix>business</mat-icon>
                    @if (clientForm.get('name')?.invalid && clientForm.get('name')?.touched) {
                      <mat-error>
                        @if (clientForm.get('name')?.errors?.['required']) {
                          El nombre es requerido
                        } @else if (clientForm.get('name')?.errors?.['minlength']) {
                          El nombre debe tener al menos 2 caracteres
                        }
                      </mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Email *</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="contacto@empresa.com">
                    <mat-icon matSuffix>email</mat-icon>
                    @if (clientForm.get('email')?.invalid && clientForm.get('email')?.touched) {
                      <mat-error>
                        @if (clientForm.get('email')?.errors?.['required']) {
                          El email es requerido
                        } @else if (clientForm.get('email')?.errors?.['email']) {
                          Ingresa un email válido
                        }
                      </mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width">
                    <mat-label>Teléfono</mat-label>
                    <input matInput formControlName="phone" placeholder="+1-555-0123">
                    <mat-icon matSuffix>phone</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Addresses Section -->
              <div class="form-section">
                <div class="section-header">
                  <h3>Direcciones</h3>
                  <button mat-icon-button type="button" (click)="addAddress()">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>

                <div formArrayName="addresses">
                  @for (address of addressesArray.controls; track address; let i = $index) {
                    <div [formGroupName]="i" class="address-group">
                      <div class="address-header">
                        <h4>Dirección {{ i + 1 }}</h4>
                        @if (addressesArray.length > 0) {
                          <button mat-icon-button type="button" (click)="removeAddress(i)" color="warn">
                            <mat-icon>delete</mat-icon>
                          </button>
                        }
                      </div>

                      <div class="form-row">
                        <mat-form-field class="full-width">
                          <mat-label>Dirección *</mat-label>
                          <input matInput formControlName="line1" placeholder="Calle, número, colonia">
                          <mat-icon matSuffix>place</mat-icon>
                          @if (address.get('line1')?.invalid && address.get('line1')?.touched) {
                            <mat-error>La dirección es requerida</mat-error>
                          }
                        </mat-form-field>
                      </div>

                      <div class="form-row-grid">
                        <mat-form-field>
                          <mat-label>Ciudad</mat-label>
                          <input matInput formControlName="city" placeholder="Ciudad">
                        </mat-form-field>

                        <mat-form-field>
                          <mat-label>Código Postal</mat-label>
                          <input matInput formControlName="zip" placeholder="12345">
                        </mat-form-field>
                      </div>

                      <div class="form-row">
                        <mat-form-field class="full-width">
                          <mat-label>País</mat-label>
                          <input matInput formControlName="country" placeholder="México">
                        </mat-form-field>
                      </div>
                    </div>
                  } @empty {
                    <div class="no-addresses">
                      <p>No hay direcciones registradas</p>
                      <button mat-raised-button type="button" (click)="addAddress()">
                        <mat-icon>add</mat-icon>
                        Agregar Dirección
                      </button>
                    </div>
                  }
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
                  [disabled]="clientForm.invalid || submitting()"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                    {{ isEdit() ? 'Actualizando...' : 'Creando...' }}
                  } @else {
                    {{ isEdit() ? 'Actualizar Cliente' : 'Crear Cliente' }}
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
    .client-form-container {
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

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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

    .address-group {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background-color: #fafafa;
    }

    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .address-header h4 {
      margin: 0;
      color: #666;
      font-weight: 500;
    }

    .no-addresses {
      text-align: center;
      padding: 40px 20px;
      color: #666;
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

    mat-divider {
      margin: 24px 0;
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
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  isEdit = signal(false);
  clientId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.clientId = params['id'];
        this.isEdit.set(true);
        this.loadClient(this.clientId!);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      addresses: this.fb.array([])
    });
  }

  get addressesArray(): FormArray {
    return this.clientForm.get('addresses') as FormArray;
  }

  createAddressForm() {
    return this.fb.group({
      line1: ['', [Validators.required]],
      city: [''],
      country: [''],
      zip: ['']
    });
  }

  addAddress(): void {
    this.addressesArray.push(this.createAddressForm());
  }

  removeAddress(index: number): void {
    this.addressesArray.removeAt(index);
  }

  loadClient(id: string): void {
    this.loading.set(true);
    
    this.clientService.getClient(id).subscribe({
      next: (client: Client) => {
        this.clientForm.patchValue({
          name: client.name,
          email: client.email,
          phone: client.phone || ''
        });

        // Clear existing addresses and add the loaded ones
        this.addressesArray.clear();
        if (client.addresses) {
          client.addresses.forEach(address => {
            const addressForm = this.createAddressForm();
            addressForm.patchValue(address);
            this.addressesArray.push(addressForm);
          });
        }

        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al cargar el cliente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.submitting.set(true);

      const currentUser = this.authService.user();
      if (!currentUser) {
        this.snackBar.open('Error: Usuario no autenticado', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      const formData = {
        ...this.clientForm.value,
        ownerUserId: currentUser.id
      };

      const request = this.isEdit() 
        ? this.clientService.updateClient(this.clientId!, formData as UpdateClientRequest)
        : this.clientService.createClient(formData as CreateClientRequest);

      request.subscribe({
        next: () => {
          this.submitting.set(false);
          const message = this.isEdit() 
            ? 'Cliente actualizado exitosamente'
            : 'Cliente creado exitosamente';
          
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
          this.router.navigate(['/clients']);
        },
        error: (error: any) => {
          this.submitting.set(false);
          const message = error.error?.message || 'Error al guardar el cliente';
          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}
