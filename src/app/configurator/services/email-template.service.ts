import { environment } from 'src/environments/environment';

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EmailTemplate, CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from '../models/email-template.model';

/**
 * @class EmailTemplateService
 * @description Service for managing email templates.
 * It handles fetching, creating, updating, and deleting templates,
 * and provides a reactive stream of the templates list.
 */
@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  private readonly apiUrl = environment.apiUrl + '/email/templates'; // Corrected URL
  private http = inject(HttpClient);

  private templatesSubject = new BehaviorSubject<EmailTemplate[]>([]);

  /**
   * Observable stream of the list of email templates.
   */
  public templates$: Observable<EmailTemplate[]> = this.templatesSubject.asObservable();

  /**
   * Fetches the list of email templates from the backend and updates the `templates$` stream.
   * @returns An observable of the HTTP response.
   */
  loadEmailTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.apiUrl).pipe(
      tap(templates => this.templatesSubject.next(templates))
    );
  }

  /**
   * Fetches a single email template by its ID.
   * @param id - The ID of the email template.
   * @returns An observable of the email template.
   */
  getEmailTemplate(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new email template.
   * On success, it reloads the list to update the `templates$` stream.
   * @param data - The data for the new email template.
   * @returns An observable of the created email template.
   */
  createEmailTemplate(data: CreateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(this.apiUrl, data).pipe(
      tap(() => this.loadEmailTemplates().subscribe())
    );
  }

  /**
   * Updates an existing email template.
   * On success, it reloads the list to update the `templates$` stream.
   * @param id - The ID of the template to update.
   * @param data - The updated data.
   * @returns An observable of the updated email template.
   */
  updateEmailTemplate(id: string, data: UpdateEmailTemplateRequest): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.loadEmailTemplates().subscribe())
    );
  }

  /**
   * Deletes an email template.
   * On success, it reloads the list to update the `templates$` stream.
   * @param id - The ID of the template to delete.
   * @returns An observable that completes when the operation is done.
   */
  deleteEmailTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadEmailTemplates().subscribe())
    );
  }
}
