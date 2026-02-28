import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FileMetadata } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/files';
  private http = inject(HttpClient);

  /**
   * NOTA: Il backend attualmente non supporta l'elenco dei file (GET /api/v1/files).
   * Questa funzione restituisce un array vuoto per evitare errori nel frontend.
   */
  getFiles(): Observable<FileMetadata[]> {
    return of([]); // Ritorna una lista vuota 'finta'
  }

  uploadFile(file: File): Observable<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileMetadata>(this.apiUrl, formData);
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFileUrl(id: string): string {
    return `${this.apiUrl}/${id}`;
  }
}
