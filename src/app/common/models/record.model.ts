export interface Record {
  id: string;
  entityKey: string;
  data: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface RecordSearchRequest {
  filters?: any[];
  sorts?: any[];
  page?: number;
  size?: number;
}
