
export interface TemplateAttachmentDto {
  filename: string;
  contentType: string;
  base64Content: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  htmlContent: string;
  placeholders: string[];
  attachments?: TemplateAttachmentDto[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  htmlContent: string;
  placeholders: string[];
  attachments?: TemplateAttachmentDto[];
}

export interface UpdateEmailTemplateRequest extends CreateEmailTemplateRequest {}
