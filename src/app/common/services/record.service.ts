import { environment } from 'src/environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CmsRecord, PageResponse, RecordSearchRequest } from '../models/record.model';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private readonly apiUrl = environment.apiUrl + '/records';
  private http = inject(HttpClient);

  searchRecords(entityKey: string, request: RecordSearchRequest): Observable<PageResponse<CmsRecord>> {
    return this.http.post<PageResponse<CmsRecord>>(`${this.apiUrl}/${entityKey}/search`, request);
  }

  loadRecords(entityKey: string, page = 0, size = 20, filters: any[] = []): Observable<PageResponse<CmsRecord>> {
    return this.searchRecords(entityKey, { page, size, filters });
  }

  getRecord(entityKey: string, id: string): Observable<CmsRecord> {
    return this.http.get<CmsRecord>(`${this.apiUrl}/${entityKey}/${id}`);
  }

  createRecord(entityKey: string, data: any): Observable<CmsRecord> {
    return this.http.post<CmsRecord>(`${this.apiUrl}/${entityKey}`, { data });
  }

  updateRecord(entityKey: string, id: string, data: any): Observable<CmsRecord> {
    return this.http.put<CmsRecord>(`${this.apiUrl}/${entityKey}/${id}`, { data });
  }

  deleteRecord(entityKey: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${entityKey}/${id}`);
  }

  getRecordHistory(entityKey: string, id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${entityKey}/${id}/history`);
  }
}
