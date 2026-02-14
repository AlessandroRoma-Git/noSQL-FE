
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private readonly apiUrl = 'http://localhost:8088/api/v1/menu/manage';
  private http = inject(HttpClient);

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  createMenuItem(data: CreateMenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, data);
  }

  updateMenuItem(id: string, data: UpdateMenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, data);
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
