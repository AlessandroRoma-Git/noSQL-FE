
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { FileMetadata } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/files';
  private http = inject(HttpClient);

  private filesSubject = new BehaviorSubject<FileMetadata[]>([]);
  public files$: Observable<FileMetadata[]> = this.filesSubject.asObservable();

  loadFiles(): Observable<FileMetadata[]> {
    return this.http.get<FileMetadata[]>(this.apiUrl).pipe(
      tap(files => this.filesSubject.next(files))
    );
  }

  uploadFile(file: File): Observable<number | FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileMetadata>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return Math.round(100 * event.loaded / (event.total || 1));
          case HttpEventType.Response:
            this.loadFiles().subscribe();
            return event.body as FileMetadata;
          default:
            return 0; // Should not happen
        }
      })
    );
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadFiles().subscribe())
    );
  }
}
