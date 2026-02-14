
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EntityDefinition, CreateEntityDefinitionRequest, UpdateEntityDefinitionRequest } from '../models/entity-definition.model';

@Injectable({
  providedIn: 'root'
})
export class EntityDefinitionService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/entity-definitions';
  private http = inject(HttpClient);

  private definitionsSubject = new BehaviorSubject<EntityDefinition[]>([]);
  public definitions$: Observable<EntityDefinition[]> = this.definitionsSubject.asObservable();

  loadEntityDefinitions(): Observable<EntityDefinition[]> {
    return this.http.get<EntityDefinition[]>(this.apiUrl).pipe(
      tap(definitions => this.definitionsSubject.next(definitions))
    );
  }

  getEntityDefinition(key: string): Observable<EntityDefinition> {
    return this.http.get<EntityDefinition>(`${this.apiUrl}/${key}`);
  }

  createEntityDefinition(data: CreateEntityDefinitionRequest): Observable<EntityDefinition> {
    return this.http.post<EntityDefinition>(this.apiUrl, data).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }

  updateEntityDefinition(key: string, data: UpdateEntityDefinitionRequest): Observable<EntityDefinition> {
    return this.http.put<EntityDefinition>(`${this.apiUrl}/${key}`, data).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }

  deleteEntityDefinition(key: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${key}`).pipe(
      tap(() => this.loadEntityDefinitions().subscribe())
    );
  }
}
