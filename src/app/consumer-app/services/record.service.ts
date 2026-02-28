
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Record, CreateRecordRequest, UpdateRecordRequest, PageResponse } from '../models/record.model';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/records';
  private http = inject(HttpClient);

  private recordsSubject = new BehaviorSubject<Record[]>([]);
  public records$: Observable<Record[]> = this.recordsSubject.asObservable();

  private pageInfoSubject = new BehaviorSubject<any>({});
  public pageInfo$: Observable<any> = this.pageInfoSubject.asObservable();

  /**
   * Ricerca record specifica per la scoperta dello schema (usata dai consumer).
   */
  searchRecords(entityKey: string, page = 0, size = 20): Observable<PageResponse<Record>> {
    return this.http.post<PageResponse<Record>>(`${this.apiUrl}/${entityKey}/search`, { page, size });
  }

  loadRecords(entityKey: string, page = 0, size = 20, filters: any[] = [], sorts: any[] = []): Observable<PageResponse<Record>> {
    const body = { filters, sorts, page, size };
    return this.http.post<PageResponse<Record>>(`${this.apiUrl}/${entityKey}/search`, body).pipe(
      tap(response => {
        this.recordsSubject.next(response.content);
        this.pageInfoSubject.next({
          page: response.page,
          size: response.size,
          totalElements: response.totalElements,
          totalPages: response.totalPages
        });
      })
    );
  }

  getRecord(entityKey: string, id: string): Observable<Record> {
    return this.http.get<Record>(`${this.apiUrl}/${entityKey}/${id}`);
  }

  createRecord(entityKey: string, data: CreateRecordRequest): Observable<Record> {
    return this.http.post<Record>(`${this.apiUrl}/${entityKey}`, data).pipe(
      tap(() => this.loadRecords(entityKey).subscribe())
    );
  }

  updateRecord(entityKey: string, id: string, data: UpdateRecordRequest): Observable<Record> {
    return this.http.put<Record>(`${this.apiUrl}/${entityKey}/${id}`, data).pipe(
      tap(() => this.loadRecords(entityKey).subscribe())
    );
  }

  deleteRecord(entityKey: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${entityKey}/${id}`).pipe(
      tap(() => this.loadRecords(entityKey).subscribe())
    );
  }
}
