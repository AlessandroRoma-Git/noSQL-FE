
export interface Group {
  id: string;
  name: string;
  description: string;
  systemRole: 'ADMIN' | 'SUPER_ADMIN' | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  systemRole?: 'ADMIN' | 'SUPER_ADMIN' | null;
}

export interface UpdateGroupRequest extends CreateGroupRequest {}
