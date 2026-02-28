
export interface CmsSettings {
  email: {
    defaultFrom: string;
    passwordTemplateId: string | null;
    recoverPasswordTemplateId: string | null; // New field
  };
  security: {
    maxFilters: number;
    maxPageSize: number;
    defaultPageSize: number;
    regexMaxLength: number;
    maxLoginAttempts: number;
  };
  storage: {
    type: 'grid-fs' | 's3';
    maxFileSize: number;
    allowedContentTypes: string[];
    s3?: {
      endpoint: string | null;
      region: string | null;
      bucket: string | null;
      accessKey: string | null;
      secretKey: string | null;
    };
  };
}
