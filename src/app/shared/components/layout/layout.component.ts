import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule
  ],
  template: `
    <div class="layout-container">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="toggleSidenav()" class="menu-button">
          <mat-icon>menu</mat-icon>
        </button>
        
        <span class="app-name">
          <mat-icon>local_shipping</mat-icon>
          Gestión de Envíos
        </span>
        
        <span class="spacer"></span>
        
        @if (user(); as currentUser) {
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            {{ currentUser.name }}
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Cerrar Sesión
            </button>
          </mat-menu>
        }
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav 
          #sidenav 
          mode="side" 
          [opened]="sidenavOpen()" 
          class="sidenav"
          [class.sidenav-collapsed]="!sidenavOpen()"
        >
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              @if (sidenavOpen()) {
                <span matListItemTitle>Dashboard</span>
              }
            </a>
            
            <a mat-list-item routerLink="/clients" routerLinkActive="active-link">
              <mat-icon matListItemIcon>people</mat-icon>
              @if (sidenavOpen()) {
                <span matListItemTitle>Clientes</span>
              }
            </a>
            
            <a mat-list-item routerLink="/shipments" routerLinkActive="active-link">
              <mat-icon matListItemIcon>local_shipping</mat-icon>
              @if (sidenavOpen()) {
                <span matListItemTitle>Envíos</span>
              }
            </a>
            
            <mat-divider></mat-divider>
            
            <a mat-list-item routerLink="/test-data" routerLinkActive="active-link">
              <mat-icon matListItemIcon>science</mat-icon>
              @if (sidenavOpen()) {
                <span matListItemTitle>Datos de Prueba</span>
              }
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [
    `
    .layout-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .menu-button {
      margin-right: 16px;
    }

    .app-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sidenav-container {
      flex: 1;
    }

    /* Base sidenav styles */
    .sidenav {
      width: 240px;
      transition: width 0.3s ease, min-width 0.3s ease;
      border-right: 1px solid rgba(0,0,0,0.12);
      overflow: hidden; /* prevent inner content from overflowing when collapsed */
    }

    /* Collapsed state */
    .sidenav-collapsed {
      width: 60px;
      min-width: 60px;
    }

    /* When collapsed, hide text labels and center icons - robust selectors */
    .sidenav-collapsed mat-nav-list,
    .sidenav-collapsed .mat-nav-list {
      padding-top: 8px;
    }

    /* Target material list item structure and anchor-based list items */
    .sidenav-collapsed a[mat-list-item],
    .sidenav-collapsed .mat-list-item {
      justify-content: center !important; /* center the icon */
      padding-left: 8px !important;
      padding-right: 8px !important;
    }

    /* Hide any textual lines/titles inside list items */
    .sidenav-collapsed a[mat-list-item] span[matListItemTitle],
    .sidenav-collapsed a[mat-list-item] .mat-line,
    .sidenav-collapsed .mat-list-item .mat-line,
    .sidenav-collapsed .mat-list-item .mat-list-item-content,
    .sidenav-collapsed .mat-list-item .mat-list-text {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }

    /* ensure icons remain visible and centered */
    .sidenav-collapsed .mat-icon[matListItemIcon],
    .sidenav-collapsed .mat-list-item .mat-icon,
    .sidenav-collapsed a[mat-list-item] .mat-icon {
      margin: 0 !important;
      font-size: 20px;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }

    .sidenav mat-nav-list {
      padding-top: 16px;
    }

    .main-content {
      padding: 24px;
      background-color: #f5f5f5;
      min-height: 100%;
    }

    .active-link {
      background-color: rgba(63, 81, 181, 0.1) !important;
      color: #3f51b5 !important;
    }

    .active-link mat-icon {
      color: #3f51b5 !important;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 60px;
      }
      
      .main-content {
        padding: 16px;
      }
    }
    `
  ]
})
export class LayoutComponent {
  sidenavOpen = signal(true);
  user = computed(() => this.authService.user());

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidenav(): void {
    this.sidenavOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
