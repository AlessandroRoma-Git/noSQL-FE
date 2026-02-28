import { environment } from 'src/environments/environment';

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

/**
 * @class UserService
 * @description Service for managing users.
 * It handles fetching, creating, updating, and deleting users,
 * and provides a reactive stream of the users list.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl + '/users';
  private http = inject(HttpClient);

  private usersSubject = new BehaviorSubject<User[]>([]);

  /**
   * Observable stream of the list of users.
   */
  public users$: Observable<User[]> = this.usersSubject.asObservable();

  /**
   * Fetches the list of users from the backend and updates the `users$` stream.
   * @returns An observable of the HTTP response.
   */
  loadUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => this.usersSubject.next(users))
    );
  }

  /**
   * Fetches a single user by their ID.
   * @param id - The ID of the user.
   * @returns An observable of the user.
   */
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new user.
   * On success, it reloads the list to update the `users$` stream.
   * @param data - The data for the new user.
   * @returns An observable of the created user.
   */
  createUser(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, data).pipe(
      tap(() => this.loadUsers().subscribe())
    );
  }

  /**
   * Updates an existing user.
   * On success, it reloads the list to update the `users$` stream.
   * @param id - The ID of the user to update.
   * @param data - The updated data.
   * @returns An observable of the updated user.
   */
  updateUser(id: string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.loadUsers().subscribe())
    );
  }

  /**
   * Deletes a user.
   * On success, it reloads the list to update the `users$` stream.
   * @param id - The ID of the user to delete.
   * @returns An observable that completes when the operation is done.
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadUsers().subscribe())
    );
  }

  /**
   * Triggers a password reset for a user.
   * @param id - The ID of the user.
   * @returns An observable that completes when the operation is done.
   */
  resetPassword(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reset-password`, {});
  }
}
