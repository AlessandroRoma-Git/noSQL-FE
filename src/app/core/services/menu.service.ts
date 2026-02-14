
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/menu/manage';
  private http = inject(HttpClient);

  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$: Observable<MenuItem[]> = this.menuItemsSubject.asObservable();

  loadMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl).pipe(
      tap(items => this.menuItemsSubject.next(items))
    );
  }

  getMenuItem(id: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  createMenuItem(data: CreateMenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, data).pipe(
      tap(() => this.loadMenuItems().subscribe())
    );
  }

  updateMenuItem(id: string, data: UpdateMenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.loadMenuItems().subscribe())
    );
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadMenuItems().subscribe())
    );
  }
}
