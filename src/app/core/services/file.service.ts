
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

  // The files list is removed as there is no endpoint to fetch it.
  // public files$: Observable<FileMetadata[]> = of([]);

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
            // Do not reload the list anymore
            return event.body as FileMetadata;
          default:
            return 0; // Should not happen
        }
      })
    );
  }

  deleteFile(id: string): Observable<void> {
    // Do not reload the list anymore
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
