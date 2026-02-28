import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordHistoryResponse } from '../models/record.model';

@Injectable({
  providedIn: 'root'
})
export class RecordHistoryService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/records';
  private http = inject(HttpClient);

  getRecordHistory(entityKey: string, recordId: string): Observable<RecordHistoryResponse[]> {
    return this.http.get<RecordHistoryResponse[]>(`${this.apiUrl}/${entityKey}/${recordId}/history`);
  }

  getRecordVersion(entityKey: string, recordId: string, version: number): Observable<RecordHistoryResponse> {
    return this.http.get<RecordHistoryResponse>(`${this.apiUrl}/${entityKey}/${recordId}/history/${version}`);
  }
}
