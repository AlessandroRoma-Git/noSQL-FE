import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttachmentDto {
  filename: string;
  contentType: string;
  base64Content: string;
  inline?: boolean;
  contentId?: string | null;
}

export interface StorageAttachmentDto {
  fileId: string;
}

export interface CalendarEventDto {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  organizer?: string;
  method?: 'REQUEST' | 'PUBLISH';
}

export interface SendEmailRequest {
  to: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  templateId: string;
  placeholders?: { [key: string]: string };
  attachments?: AttachmentDto[];
  storageAttachments?: StorageAttachmentDto[];
  calendarEvent?: CalendarEventDto;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/email/send';
  private http = inject(HttpClient);

  /**
   * Sends an email using a specific template, placeholders, and optional attachments or calendar events.
   * @param request - The payload for the send email request.
   * @returns An observable that completes when the email is sent.
   */
  sendEmail(request: SendEmailRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}
