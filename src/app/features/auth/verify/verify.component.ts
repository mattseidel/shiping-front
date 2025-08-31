import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyComponent {
  loading = signal(true);
  success = signal<boolean | null>(null);
  message = signal('');

  private token: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.init();
  }

  private init() {
    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');
      if (!token) {
        this.loading.set(false);
        this.success.set(false);
        this.message.set('Token no proporcionado');
        return;
      }

      this.token = token;
      this.verify(token);
    });
  }

  private verify(token: string) {
    this.loading.set(true);
    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(true);
        this.message.set(res.message || 'Tu cuenta ha sido verificada.');
        this.snackBar.open(this.message(), 'Cerrar', { duration: 4000 });
      },
      error: (err) => {
        this.loading.set(false);
        this.success.set(false);
        const msg = err?.error?.message || 'Token inválido o expirado';
        this.message.set(msg);
        this.snackBar.open(this.message(), 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  retry() {
    if (this.token) this.verify(this.token);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
