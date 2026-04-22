
export interface MenuItem {
  id: string;
  label: string;
  entityKey?: string;
  route?: string; // Add this line
  icon?: string;
  position: number;
  parentId?: string;
  groups?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  label: string;
  entityKey?: string;
  route?: string; // Add this line
  icon?: string;
  position?: number;
  parentId?: string;
  groups?: string[];
}

export interface UpdateMenuItemRequest extends CreateMenuItemRequest {}
