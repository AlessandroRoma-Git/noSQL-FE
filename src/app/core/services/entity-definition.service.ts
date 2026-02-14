
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EntityDefinition,
  CreateEntityDefinitionRequest,
  UpdateEntityDefinitionRequest
} from '../models/entity-definition.model';

@Injectable({
  providedIn: 'root'
})
export class EntityDefinitionService {

  private readonly apiUrl = 'http://localhost:8088/api/v1/entity-definitions';

  constructor(private http: HttpClient) { }

  getEntityDefinitions(): Observable<EntityDefinition[]> {
    return this.http.get<EntityDefinition[]>(this.apiUrl);
  }

  getEntityDefinition(key: string): Observable<EntityDefinition> {
    return this.http.get<EntityDefinition>(`${this.apiUrl}/${key}`);
  }

  createEntityDefinition(data: CreateEntityDefinitionRequest): Observable<EntityDefinition> {
    return this.http.post<EntityDefinition>(this.apiUrl, data);
  }

  updateEntityDefinition(key: string, data: UpdateEntityDefinitionRequest): Observable<EntityDefinition> {
    return this.http.put<EntityDefinition>(`${this.apiUrl}/${key}`, data);
  }

  deleteEntityDefinition(key: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${key}`);
  }
}
