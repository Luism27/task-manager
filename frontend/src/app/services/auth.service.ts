import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, switchMap, catchError, shareReplay, finalize } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  username: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private tokenKey = 'access_token';
  private refreshKey = 'refresh_token';

  constructor() {
    // Initialization moved to AppComponent to avoid circular dependency
  }

  initialCheck() {
    const token = this.getToken();
    if (token) {
      this.me().subscribe();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  private setTokens(access: string, refresh?: string) {
    localStorage.setItem(this.tokenKey, access);
    if (refresh) {
      localStorage.setItem(this.refreshKey, refresh);
    }
  }

  private clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    this.userSubject.next(null);
  }

  login(credentials: { username: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(response => {
        this.setTokens(response.access, response.refresh);
        this.me().subscribe();
      })
    );
  }

  private refreshToken$: Observable<any> | null = null;

  refreshToken(): Observable<any> {
    if (this.refreshToken$) {
      return this.refreshToken$;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    this.refreshToken$ = this.http.post<{ access: string }>(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken }).pipe(
      tap(response => {
        this.setTokens(response.access);
        if ((response as any).refresh) {
          this.setTokens(response.access, (response as any).refresh);
        }
      }),
      catchError(err => {
        this.logout();
        throw err;
      }),
      shareReplay(1),
      finalize(() => {
        this.refreshToken$ = null;
      })
    );

    return this.refreshToken$;
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  logout() {
    this.clearTokens();
  }

  me(): Observable<User> {
    // Note: The documentation says /auth/me/ returns info about the current user.
    return this.http.get<User>(`${this.apiUrl}/me/`).pipe(
      tap(user => this.userSubject.next(user)),
      catchError(err => {
        // Only logout if it's an authentication error (401)
        // Network errors or 500s shouldn't log the user out.
        if (err.status === 401) {
          this.logout();
        }
        throw err;
      })
    );
  }
}
