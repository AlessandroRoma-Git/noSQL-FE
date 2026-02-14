
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailTemplate, CreateEmailTemplateRequest } from '../models/email-template.model';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  private readonly apiUrl = 'http://localhost:8088/api/v1/email/templates';
  private http = inject(HttpClient);

  getEmailTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.apiUrl);
  }

  getEmailTemplate(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.apiUrl}/${id}`);
  }

  createEmailTemplate(data: CreateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(this.apiUrl, data);
  }

  deleteEmailTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
