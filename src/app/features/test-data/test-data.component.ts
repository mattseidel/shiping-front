import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ShipmentService } from '../../core/services/shipment.service';

@Component({
  selector: 'app-test-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="test-data-container">
      <div class="header">
        <h1>
          <mat-icon>science</mat-icon>
          Datos de Prueba
        </h1>
      </div>

      <div class="cards-grid">
        <!-- Seed Clients Card -->
        <mat-card class="seed-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>people</mat-icon>
              Clientes de Prueba
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <p>Genera clientes ficticios para probar la aplicación. Los clientes incluirán nombres, emails y direcciones aleatorias.</p>
            
            <mat-form-field class="count-field">
              <mat-label>Cantidad de clientes</mat-label>
              <input matInput type="number" [formControl]="clientsCountControl" min="1" max="100">
              @if (clientsCountControl.invalid && clientsCountControl.touched) {
                <mat-error>
                  @if (clientsCountControl.errors?.['required']) {
                    La cantidad es requerida
                  } @else if (clientsCountControl.errors?.['min']) {
                    Mínimo 1 cliente
                  } @else if (clientsCountControl.errors?.['max']) {
                    Máximo 100 clientes
                  }
                </mat-error>
              }
            </mat-form-field>
          </mat-card-content>

          <mat-card-actions>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="seedClients()"
              [disabled]="creatingClients() || clientsCountControl.invalid"
            >
              @if (creatingClients()) {
                <mat-spinner diameter="20"></mat-spinner>
                Creando...
              } @else {
                <mat-icon>add_circle Crear Clientes</mat-icon>
              }
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Seed Shipments Card -->
        <mat-card class="seed-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>local_shipping</mat-icon>
              Envíos de Prueba
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <p>Genera envíos ficticios para probar la aplicación. <strong>Nota:</strong> Necesitas tener clientes registrados primero.</p>
            
            <mat-form-field class="count-field">
              <mat-label>Cantidad de envíos</mat-label>
              <input matInput type="number" [formControl]="shipmentsCountControl" min="1" max="100">
              @if (shipmentsCountControl.invalid && shipmentsCountControl.touched) {
                <mat-error>
                  @if (shipmentsCountControl.errors?.['required']) {
                    La cantidad es requerida
                  } @else if (shipmentsCountControl.errors?.['min']) {
                    Mínimo 1 envío
                  } @else if (shipmentsCountControl.errors?.['max']) {
                    Máximo 100 envíos
                  }
                </mat-error>
              }
            </mat-form-field>
          </mat-card-content>

          <mat-card-actions>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="seedShipments()"
              [disabled]="creatingShipments() || shipmentsCountControl.invalid"
            >
              @if (creatingShipments()) {
                <mat-spinner diameter="20">Creando...</mat-spinner>
              } @else {
                <mat-icon>add_circle Crear Envíos </mat-icon>
              }
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Instructions Card -->
      <mat-card class="instructions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>info</mat-icon>
            Instrucciones
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="instructions-content">
            <div class="instruction-item">
              <span class="step-number">1</span>
              <div class="step-content">
                <h4>Crear clientes primero</h4>
                <p>Los envíos necesitan estar asociados a clientes existentes, por lo que debes crear clientes antes que envíos.</p>
              </div>
            </div>
            
            <div class="instruction-item">
              <span class="step-number">2</span>
              <div class="step-content">
                <h4>Crear envíos</h4>
                <p>Una vez que tengas clientes, puedes crear envíos de prueba que serán asignados aleatoriamente a los clientes existentes.</p>
              </div>
            </div>
            
            <div class="instruction-item">
              <span class="step-number">3</span>
              <div class="step-content">
                <h4>Explorar la aplicación</h4>
                <p>Con los datos de prueba creados, puedes navegar por las diferentes secciones para probar todas las funcionalidades.</p>
              </div>
            </div>
          </div>

          <div class="warning-box">
            <mat-icon>warning</mat-icon>
            <div>
              <h4>Importante</h4>
              <p>Los datos generados son ficticios y están destinados únicamente para pruebas. No uses esta función en un entorno de producción.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-data-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #333;
      font-weight: 500;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .seed-card {
      height: fit-content;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .count-field {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-card-actions {
      padding: 16px;
      justify-content: flex-end;
    }

    mat-card-actions button {
      min-width: 140px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .instructions-card {
      margin-top: 24px;
    }

    .instructions-content {
      margin-bottom: 24px;
    }

    .instruction-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3f51b5;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 500;
    }

    .step-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    .warning-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      border-radius: 4px;
    }

    .warning-box mat-icon {
      color: #ff9800;
      margin-top: 2px;
    }

    .warning-box h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 500;
    }

    .warning-box p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }

      .instruction-item {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }
    }
  `]
})
export class TestDataComponent {
  clientsCountControl = new FormControl(5, [
    Validators.required,
    Validators.min(1),
    Validators.max(100)
  ]);
  
  shipmentsCountControl = new FormControl(10, [
    Validators.required,
    Validators.min(1),
    Validators.max(100)
  ]);

  creatingClients = signal(false);
  creatingShipments = signal(false);

  constructor(
    private shipmentService: ShipmentService,
    private snackBar: MatSnackBar
  ) {}

  seedClients(): void {
    if (this.clientsCountControl.invalid) return;

    const count = this.clientsCountControl.value!;
    this.creatingClients.set(true);

    this.shipmentService.seedClients(count).subscribe({
      next: (response) => {
        this.creatingClients.set(false);
        this.snackBar.open(
          `Se crearon ${response.inserted} clientes de prueba exitosamente`, 
          'Cerrar', 
          { duration: 5000 }
        );
      },
      error: (error: any) => {
        this.creatingClients.set(false);
        const message = error.error?.message || 'Error al crear los clientes de prueba';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  seedShipments(): void {
    if (this.shipmentsCountControl.invalid) return;

    const count = this.shipmentsCountControl.value!;
    this.creatingShipments.set(true);

    this.shipmentService.seedShipments(count).subscribe({
      next: (response) => {
        this.creatingShipments.set(false);
        this.snackBar.open(
          `Se crearon ${response.inserted} envíos de prueba exitosamente`, 
          'Cerrar', 
          { duration: 5000 }
        );
      },
      error: (error: any) => {
        this.creatingShipments.set(false);
        const message = error.error?.message || 'Error al crear los envíos de prueba';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
