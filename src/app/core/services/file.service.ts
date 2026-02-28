import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileMetadata } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/files';
  private http = inject(HttpClient);

  getFiles(): Observable<FileMetadata[]> {
    return this.http.get<FileMetadata[]>(this.apiUrl);
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
