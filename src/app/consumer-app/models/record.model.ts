
export interface Record {
  id: string;
  entityKey: string;
  data: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordRequest {
  data: { [key: string]: any };
}

export interface UpdateRecordRequest {
  data: { [key: string]: any };
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface RecordHistoryResponse {
  id: string;
  entityKey: string;
  recordId: string;
  data: { [key: string]: any };
  version: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  modifiedBy: string;
  createdAt: string;
}
