
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, ChangePasswordRequest, LoginRequest, RecoverPasswordRequest } from '../models/auth.model';

/**
 * Represents the state of the authenticated user.
 */
interface UserState {
  token: string | null;
  username: string | null;
  roles: string[];
  firstAccess: boolean;
}

/**
 * @class AuthService
 * @description Manages user authentication, including login, logout, password changes, and session state.
 */
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

  /**
   * Observable stream of the current user state.
   * Emits `null` if the user is not authenticated.
   */
  public userState$: Observable<UserState | null>;

  /**
   * Observable stream that emits `true` if the user is authenticated, `false` otherwise.
   */
  public isAuthenticated$: Observable<boolean>;

  /**
   * Observable stream that emits `true` if the user is required to change their password on first access.
   */
  public isFirstAccess$: Observable<boolean>;

  constructor() {
    const initialState = this.loadUserState();
    this.userStateSubject = new BehaviorSubject<UserState | null>(initialState);
    this.userState$ = this.userStateSubject.asObservable();
    this.isAuthenticated$ = this.userState$.pipe(map(state => !!state?.token));
    this.isFirstAccess$ = this.userState$.pipe(map(state => state?.firstAccess ?? false));
  }

  /**
   * Performs a login request.
   * On success, it saves the user state, updates the observables, and navigates to the appropriate page.
   * @param credentials - The user's login credentials.
   * @returns An observable of the authentication response.
   */
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

  /**
   * Performs a password change request for an authenticated user.
   * On success, it updates the user state with the new token.
   * @param request - The password change request payload.
   * @returns An observable of the authentication response.
   */
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

  /**
   * Initiates a password recovery process for a user.
   * @param request - The password recovery request payload.
   * @returns An observable of the HTTP response.
   */
  recoverPassword(request: RecoverPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover-password`, request);
  }

  /**
   * Logs out the current user, clears the session state, and redirects to the login page.
   */
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.USER_STATE_KEY);
    }
    this.userStateSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Retrieves the current authentication token.
   * @returns The JWT token string or `null` if not authenticated.
   */
  getToken(): string | null {
    return this.userStateSubject.value?.token ?? null;
  }

  /**
   * Saves the user state to local storage.
   * @param state - The user state to save.
   * @private
   */
  private saveUserState(state: UserState): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USER_STATE_KEY, JSON.stringify(state));
    }
  }

  /**
   * Loads the user state from local storage on initialization.
   * @returns The stored user state or `null` if not found.
   * @private
   */
  private loadUserState(): UserState | null {
    if (this.isBrowser()) {
      const storedState = localStorage.getItem(this.USER_STATE_KEY);
      if (storedState) {
        return JSON.parse(storedState);
      }
    }
    return null;
  }

  /**
   * Checks if the application is running in a browser environment.
   * @returns `true` if running in a browser, `false` otherwise.
   * @private
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
