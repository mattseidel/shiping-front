import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Crear Cuenta</mat-card-title>
          <mat-card-subtitle>Gestión de Envíos</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput type="text" formControlName="name" placeholder="Tu nombre completo">
              <mat-icon matSuffix>person</mat-icon>
              @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
                <mat-error>
                  @if (registerForm.get('name')?.errors?.['required']) {
                    El nombre es requerido
                  } @else if (registerForm.get('name')?.errors?.['minlength']) {
                    El nombre debe tener al menos 2 caracteres
                  }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@email.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <mat-error>
                  @if (registerForm.get('email')?.errors?.['required']) {
                    El email es requerido
                  } @else if (registerForm.get('email')?.errors?.['email']) {
                    Ingresa un email válido
                  }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" type="button">
                <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <mat-error>
                  @if (registerForm.get('password')?.errors?.['required']) {
                    La contraseña es requerida
                  } @else if (registerForm.get('password')?.errors?.['minlength']) {
                    La contraseña debe tener al menos 8 caracteres
                  }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput [type]="hideConfirmPassword() ? 'password' : 'text'" formControlName="confirmPassword">
              <button mat-icon-button matSuffix (click)="hideConfirmPassword.set(!hideConfirmPassword())" type="button">
                <mat-icon>{{hideConfirmPassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                <mat-error>
                  @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                    Confirma tu contraseña
                  } @else if (registerForm.errors?.['passwordMismatch']) {
                    Las contraseñas no coinciden
                  }
                </mat-error>
              }
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="full-width register-button"
              [disabled]="registerForm.invalid || loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
                Creando cuenta...
              } @else {
                Crear Cuenta
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="login-link">
            ¿Ya tienes cuenta? 
            <a routerLink="/auth/login" mat-button color="primary">Inicia sesión</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrl: './register.style.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      
      const { confirmPassword, ...registerData } = this.registerForm.value;
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.snackBar.open(response.message, 'Cerrar', { duration: 5000 });
          this.router.navigate(['/auth/login']);
        },
        error: (error: any) => {
          this.loading.set(false);
          const message = error.error?.message || 'Error al crear la cuenta';
          this.snackBar.open(message, 'Cerrar', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
