import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EntityDefinition, CreateEntityDefinitionRequest, UpdateEntityDefinitionRequest } from '../models/entity-definition.model';

/**
 * @class EntityDefinitionService
 * @description Service for managing entity definitions.
 * It handles fetching, creating, updating, and deleting entity definitions,
 * which define the structure and behavior of different content types.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityDefinitionService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/entity-definitions';
  private http = inject(HttpClient);

  private definitionsSubject = new BehaviorSubject<EntityDefinition[]>([]);
  /**
   * Observable stream of entity definitions.
   */
  public definitions$: Observable<EntityDefinition[]> = this.definitionsSubject.asObservable();

  /**
   * Loads all entity definitions from the backend and updates the `definitions$` stream.
   * @returns An observable of the list of entity definitions.
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
   * Versione pubblica della definizione (punto 8.1 dei casi d'uso).
   * @param key - La chiave univoca dell'entità.
   */
  getPublicEntityDefinition(key: string): Observable<EntityDefinition> {
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
   * @param key - The unique key of the entity definition to update.
   * @param data - The updated data for the entity definition.
   * @returns An observable of the updated entity definition.
   */
  updateEntityDefinition(key: string, data: UpdateEntityDefinitionRequest): Observable<EntityDefinition> {
    return this.http.put<EntityDefinition>(`${this.apiUrl}/${key}`, data).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }

  /**
   * Deletes an entity definition by its key.
   * On success, it reloads the list to update the `definitions$` stream.
   * @param key - The unique key of the entity definition to delete.
   * @returns An observable that completes when the operation is done.
   */
  deleteEntityDefinition(key: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${key}`).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }
}
