
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, ChangePasswordRequest, LoginRequest, RecoverPasswordRequest } from '../models/auth.model';

interface UserState {
  token: string | null;
  username: string | null;
  roles: string[];
  firstAccess: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/auth';
  private readonly USER_STATE_KEY = 'user_state';

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private userStateSubject: BehaviorSubject<UserState | null>;
  public userState$: Observable<UserState | null>;
  public isAuthenticated$: Observable<boolean>;
  public isFirstAccess$: Observable<boolean>;

  constructor() {
    const initialState = this.loadUserState();
    this.userStateSubject = new BehaviorSubject<UserState | null>(initialState);
    this.userState$ = this.userStateSubject.asObservable();
    this.isAuthenticated$ = this.userState$.pipe(map(state => !!state?.token));
    this.isFirstAccess$ = this.userState$.pipe(map(state => state?.firstAccess ?? false));
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        const userState: UserState = {
          token: response.token,
          username: response.username,
          roles: response.roles,
          firstAccess: response.firstAccess
        };
        this.saveUserState(userState);
        this.userStateSubject.next(userState);

        if (response.firstAccess) {
          this.router.navigate(['/change-password']);
        } else {
          this.router.navigate(['/']);
        }
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/change-password`, request).pipe(
      tap(response => {
        const userState: UserState = {
          token: response.token,
          username: response.username,
          roles: response.roles,
          firstAccess: false // Password has been changed
        };
        this.saveUserState(userState);
        this.userStateSubject.next(userState);
      })
    );
  }

  recoverPassword(request: RecoverPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover-password`, request);
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.USER_STATE_KEY);
    }
    this.userStateSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.userStateSubject.value?.token ?? null;
  }

  private saveUserState(state: UserState): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USER_STATE_KEY, JSON.stringify(state));
    }
  }

  private loadUserState(): UserState | null {
    if (this.isBrowser()) {
      const storedState = localStorage.getItem(this.USER_STATE_KEY);
      if (storedState) {
        return JSON.parse(storedState);
      }
    }
    return null;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
