
export interface Attachment {
  filename: string;
  contentType: string;
  data: string; // base64 encoded
}

export interface EmailTemplate {
  id: string;
  name: string;
  htmlContent: string;
  placeholders: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  htmlContent: string;
  attachments: Attachment[];
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  htmlContent?: string;
  attachments?: Attachment[];
}
