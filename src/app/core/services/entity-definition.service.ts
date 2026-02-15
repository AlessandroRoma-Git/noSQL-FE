
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EntityDefinition, CreateEntityDefinitionRequest, UpdateEntityDefinitionRequest } from '../models/entity-definition.model';

/**
 * @class EntityDefinitionService
 * @description Service for managing entity definitions.
 * It handles fetching, creating, updating, and deleting entity definitions,
 * and provides a reactive stream of the definitions list.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityDefinitionService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/entity-definitions';
  private http = inject(HttpClient);

  private definitionsSubject = new BehaviorSubject<EntityDefinition[]>([]);

  /**
   * Observable stream of the list of entity definitions.
   * Components can subscribe to this to get live updates.
   */
  public definitions$: Observable<EntityDefinition[]> = this.definitionsSubject.asObservable();

  /**
   * Fetches the list of entity definitions from the backend and updates the `definitions$` stream.
   * @returns An observable of the HTTP response.
   */
  loadEntityDefinitions(): Observable<EntityDefinition[]> {
    return this.http.get<EntityDefinition[]>(this.apiUrl).pipe(
      tap(definitions => this.definitionsSubject.next(definitions))
    );
  }

  /**
   * Fetches a single entity definition by its key.
   * @param key - The unique key of the entity definition.
   * @returns An observable of the entity definition.
   */
  getEntityDefinition(key: string): Observable<EntityDefinition> {
    return this.http.get<EntityDefinition>(`${this.apiUrl}/${key}`);
  }

  /**
   * Creates a new entity definition.
   * On success, it reloads the list to update the `definitions$` stream.
   * @param data - The data for the new entity definition.
   * @returns An observable of the created entity definition.
   */
  createEntityDefinition(data: CreateEntityDefinitionRequest): Observable<EntityDefinition> {
    return this.http.post<EntityDefinition>(this.apiUrl, data).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }

  /**
   * Updates an existing entity definition.
   * On success, it reloads the list to update the `definitions$` stream.
   * @param key - The key of the entity definition to update.
   * @param data - The updated data.
   * @returns An observable of the updated entity definition.
   */
  updateEntityDefinition(key: string, data: UpdateEntityDefinitionRequest): Observable<EntityDefinition> {
    return this.http.put<EntityDefinition>(`${this.apiUrl}/${key}`, data).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }

  /**
   * Deletes an entity definition.
   * On success, it reloads the list to update the `definitions$` stream.
   * @param key - The key of the entity definition to delete.
   * @returns An observable that completes when the operation is done.
   */
  deleteEntityDefinition(key: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${key}`).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }
}
