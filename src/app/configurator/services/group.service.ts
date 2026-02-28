
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../models/group.model';

/**
 * @class GroupService
 * @description Service for managing user groups.
 * It handles fetching, creating, updating, and deleting groups,
 * and provides a reactive stream of the groups list.
 */
@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/groups';
  private http = inject(HttpClient);

  private groupsSubject = new BehaviorSubject<Group[]>([]);

  /**
   * Observable stream of the list of user groups.
   */
  public groups$: Observable<Group[]> = this.groupsSubject.asObservable();

  /**
   * Fetches the list of groups from the backend and updates the `groups$` stream.
   * @returns An observable of the HTTP response.
   */
  loadGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl).pipe(
      tap(groups => this.groupsSubject.next(groups))
    );
  }

  /**
   * Fetches a single group by its ID.
   * @param id - The ID of the group.
   * @returns An observable of the group.
   */
  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new group.
   * On success, it reloads the list to update the `groups$` stream.
   * @param data - The data for the new group.
   * @returns An observable of the created group.
   */
  createGroup(data: CreateGroupRequest): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, data).pipe(
      tap(() => this.loadGroups().subscribe())
    );
  }

  /**
   * Updates an existing group.
   * On success, it reloads the list to update the `groups$` stream.
   * @param id - The ID of the group to update.
   * @param data - The updated data.
   * @returns An observable of the updated group.
   */
  updateGroup(id: string, data: UpdateGroupRequest): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.loadGroups().subscribe())
    );
  }

  /**
   * Deletes a group.
   * On success, it reloads the list to update the `groups$` stream.
   * @param id - The ID of the group to delete.
   * @returns An observable that completes when the operation is done.
   */
  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadGroups().subscribe())
    );
  }
}
