import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, RegisterRequest, AuthResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:4000';
  private readonly tokenKey = 'auth_token';
  
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);
  
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadTokenFromStorage();
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.accessToken, response.user);
        }),
        catchError(error => throwError(() => error))
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.get<{ accessToken: string }>(`${this.apiUrl}/auth/refresh`)
      .pipe(
        tap(response => {
          this.token.set(response.accessToken);
          localStorage.setItem(this.tokenKey, response.accessToken);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(user => this.currentUser.set(user))
      );
  }

  verifyEmail(token: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/verify?token=${token}`);
  }

  getToken(): string | null {
    return this.token();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private setAuthData(token: string, user: User): void {
    this.token.set(token);
    this.currentUser.set(user);
    localStorage.setItem(this.tokenKey, token);
  }

  private clearAuthData(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.tokenKey);
  }

  private loadTokenFromStorage(): void {
    const storedToken = localStorage.getItem(this.tokenKey);
    if (storedToken) {
      this.token.set(storedToken);
      // Verificar el token y obtener datos del usuario
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUser.set(user),
        error: () => this.clearAuthData()
      });
    }
  }
}
