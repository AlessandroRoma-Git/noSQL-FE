
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private readonly apiUrl = 'http://localhost:8088/api/v1/groups';
  private http = inject(HttpClient);

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  createGroup(data: CreateGroupRequest): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, data);
  }

  updateGroup(id: string, data: UpdateGroupRequest): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, data);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
