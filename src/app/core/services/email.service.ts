
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SendEmailRequest {
  to: string;
  subject: string;
  templateId: string;
  placeholders: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/email/send';
  private http = inject(HttpClient);

  /**
   * Sends an email using a specific template and placeholders.
   * @param request - The payload for the send email request.
   * @returns An observable that completes when the email is sent.
   */
  sendEmail(request: SendEmailRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}
