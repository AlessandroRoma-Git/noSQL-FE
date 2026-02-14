
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/groups';
  private http = inject(HttpClient);

  private groupsSubject = new BehaviorSubject<Group[]>([]);
  public groups$: Observable<Group[]> = this.groupsSubject.asObservable();

  loadGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl).pipe(
      tap(groups => this.groupsSubject.next(groups))
    );
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  createGroup(data: CreateGroupRequest): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, data).pipe(
      tap(() => this.loadGroups().subscribe())
    );
  }

  updateGroup(id: string, data: UpdateGroupRequest): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.loadGroups().subscribe())
    );
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadGroups().subscribe())
    );
  }
}
