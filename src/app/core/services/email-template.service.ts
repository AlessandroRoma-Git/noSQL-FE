
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EmailTemplate, CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from '../models/email-template.model';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/email-templates';
  private http = inject(HttpClient);

  private templatesSubject = new BehaviorSubject<EmailTemplate[]>([]);
  public templates$: Observable<EmailTemplate[]> = this.templatesSubject.asObservable();

  loadEmailTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.apiUrl).pipe(
      tap(templates => this.templatesSubject.next(templates))
    );
  }

  getEmailTemplate(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.apiUrl}/${id}`);
  }

  createEmailTemplate(data: CreateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(this.apiUrl, data).pipe(
      tap(() => this.loadEmailTemplates().subscribe())
    );
  }

  updateEmailTemplate(id: string, data: UpdateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.loadEmailTemplates().subscribe())
    );
  }

  deleteEmailTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadEmailTemplates().subscribe())
    );
  }
}
