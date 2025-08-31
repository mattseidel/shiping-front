import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../shared/models/client.model';
import { PaginatedResponse } from '../../../shared/models/common.model';

@Component({
  selector: 'app-client-list',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule
  ],
  template: `
    <div class="client-list-container">
      <div class="header">
        <h1>
          <mat-icon>people</mat-icon>
          Clientes
        </h1>
        <button mat-raised-button color="primary" routerLink="/clients/new">
          <mat-icon>add</mat-icon>
          Nuevo Cliente
        </button>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Lista de Clientes</mat-card-title>
          <div class="spacer"></div>
          <mat-form-field class="search-field">
            <mat-label>Buscar clientes...</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nombre o email">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else if (clients().length === 0) {
            <div class="empty-state">
              <mat-icon>people_outline</mat-icon>
              <h3>No hay clientes</h3>
              <p>Comienza registrando tu primer cliente</p>
              <button mat-raised-button color="primary" routerLink="/clients/new">
                <mat-icon>add</mat-icon>
                Registrar Cliente
              </button>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="clients()" class="clients-table">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let client">
                    <div class="client-name">
                      <strong>{{ client.name }}</strong>
                    </div>
                  </td>
                </ng-container>

                <!-- Email Column -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let client">{{ client.email }}</td>
                </ng-container>

                <!-- Phone Column -->
                <ng-container matColumnDef="phone">
                  <th mat-header-cell *matHeaderCellDef>Teléfono</th>
                  <td mat-cell *matCellDef="let client">
                    {{ client.phone || 'N/A' }}
                  </td>
                </ng-container>

                <!-- Addresses Column -->
                <ng-container matColumnDef="addresses">
                  <th mat-header-cell *matHeaderCellDef>Direcciones</th>
                  <td mat-cell *matCellDef="let client">
                    {{ client.addresses?.length || 0 }}
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef>Fecha de Registro</th>
                  <td mat-cell *matCellDef="let client">
                    {{ client.createdAt | date:'short' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let client">
                    <button mat-icon-button [matMenuTriggerFor]="actionsMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionsMenu="matMenu">
                      <button mat-menu-item [routerLink]="['/clients', client._id]">
                        <mat-icon>visibility</mat-icon>
                        Ver Detalles
                      </button>
                      <button mat-menu-item [routerLink]="['/clients', client._id, 'edit']">
                        <mat-icon>edit</mat-icon>
                        Editar
                      </button>
                      <button mat-menu-item (click)="deleteClient(client)" class="delete-action">
                        <mat-icon>delete</mat-icon>
                        Eliminar
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    class="client-row"
                    [routerLink]="['/clients', row._id]">
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
    .client-list-container {
      max-width: 1200px;
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
      align-items: center;
      margin-bottom: 16px;
    }

    .spacer {
      flex: 1;
    }

    .search-field {
      min-width: 300px;
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

    .clients-table {
      width: 100%;
    }

    .client-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .client-row:hover {
      background-color: #f5f5f5;
    }

    .client-name strong {
      color: #333;
    }

    .delete-action {
      color: #d32f2f;
    }

    mat-paginator {
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .search-field {
        min-width: 100%;
      }

      mat-card-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
    }
  `]
})
export class ClientListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'phone', 'addresses', 'createdAt', 'actions'];
  
  clients = signal<Client[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  
  searchControl = new FormControl('');

  constructor(
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadClients();
      });
  }

  loadClients(): void {
    this.loading.set(true);
    
    const params = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchControl.value || undefined
    };

    this.clientService.getClients(params).subscribe({
      next: (response: PaginatedResponse<Client>) => {
        this.clients.set(response.items);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);
        const message = error.error?.message || 'Error al cargar los clientes';
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
    this.loadClients();
  }

  deleteClient(client: Client): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el cliente "${client.name}"?`)) {
      this.clientService.deleteClient(client._id).subscribe({
        next: () => {
          this.snackBar.open('Cliente eliminado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.loadClients();
        },
        error: (error: any) => {
          const message = error.error?.message || 'Error al eliminar el cliente';
          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
