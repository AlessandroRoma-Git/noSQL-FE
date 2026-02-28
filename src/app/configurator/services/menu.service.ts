
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from 'app/common/models/menu-item.model';

/**
 * @class MenuService
 * @description Service for managing the main menu items.
 * It handles fetching, creating, updating, and deleting menu items,
 * and provides a reactive stream of the menu items list.
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly manageApiUrl = 'http://localhost:8088/api/v1/menu/manage';
  private readonly publicApiUrl = 'http://localhost:8088/api/v1/menu';
  private http = inject(HttpClient);

  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private userMenuItemsSubject = new BehaviorSubject<MenuItem[]>([]);

  /**
   * Observable stream of the list of menu items for management (ADMIN).
   */
  public menuItems$: Observable<MenuItem[]> = this.menuItemsSubject.asObservable();

  /**
   * Observable stream of the list of menu items for the current user.
   */
  public userMenuItems$: Observable<MenuItem[]> = this.userMenuItemsSubject.asObservable();

  /**
   * Fetches the list of menu items for the current user and updates `userMenuItems$`.
   */
  loadUserMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.publicApiUrl).pipe(
      tap(items => {
        // Sort items by position
        const sorted = items.sort((a, b) => (a.position || 0) - (b.position || 0));
        this.userMenuItemsSubject.next(sorted);
      })
    );
  }

  /**
   * Fetches the list of menu items from the backend and updates the `menuItems$` stream.
   * @returns An observable of the HTTP response.
   */
  loadMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.manageApiUrl).pipe(
      tap(items => {
        const sorted = items.sort((a, b) => (a.position || 0) - (b.position || 0));
        this.menuItemsSubject.next(sorted);
      })
    );
  }

  /**
   * Fetches a single menu item by its ID.
   * @param id - The ID of the menu item.
   * @returns An observable of the menu item.
   */
  getMenuItem(id: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.manageApiUrl}/${id}`);
  }

  /**
   * Creates a new menu item.
   * On success, it reloads the list to update the `menuItems$` stream.
   * @param data - The data for the new menu item.
   * @returns An observable of the created menu item.
   */
  createMenuItem(data: CreateMenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.manageApiUrl, data).pipe(
      tap(() => this.loadMenuItems().subscribe())
    );
  }

  /**
   * Updates an existing menu item.
   * On success, it reloads the list to update the `menuItems$` stream.
   * @param id - The ID of the menu item to update.
   * @param data - The updated data.
   * @returns An observable of the updated menu item.
   */
  updateMenuItem(id: string, data: UpdateMenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.manageApiUrl}/${id}`, data).pipe(
      tap(() => this.loadMenuItems().subscribe())
    );
  }

  /**
   * Deletes a menu item.
   * On success, it reloads the list to update the `menuItems$` stream.
   * @param id - The ID of the menu item to delete.
   * @returns An observable that completes when the operation is done.
   */
  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.manageApiUrl}/${id}`).pipe(
      tap(() => this.loadMenuItems().subscribe())
    );
  }
}
