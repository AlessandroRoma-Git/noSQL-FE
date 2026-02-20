
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Record } from '../models/record.model'; // History has a similar structure

@Injectable({
  providedIn: 'root'
})
export class RecordHistoryService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/records';
  private http = inject(HttpClient);

  /**
   * Fetches the history for a specific record.
   * @param entityKey - The key of the entity.
   * @param recordId - The ID of the record.
   * @returns An observable of the record's history versions.
   */
  getRecordHistory(entityKey: string, recordId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${entityKey}/${recordId}/history`);
  }
}
