export interface User {
  id: string;
  username: string;
  email: string;
  groupIds: string[];
  groupNames?: string[];
  enabled: boolean;
  firstAccess: boolean;
  lastAccessAt?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  groupIds?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  groupIds?: string[];
  enabled?: boolean;
}
