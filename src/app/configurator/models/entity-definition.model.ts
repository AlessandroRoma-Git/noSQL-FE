export interface Field {
  name: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'EMAIL' | 'ENUM' | 'REFERENCE';
  required: boolean;
  maxLen?: number;
  pattern?: string;
  min?: number;
  max?: number;
  enumValues?: string[];
  referenceEntityKey?: string;
}

export interface AclConfig {
  read?: string[];
  write?: string[];
  delete?: string[];
  search?: string[];
}

export interface NotificationConfig {
  to: string[];
  subject?: string;
  createTemplateId?: string | null;
  updateTemplateId?: string | null;
  deleteTemplateId?: string | null;
}

export interface EntityDefinition {
  id: string;
  entityKey: string;
  label: string;
  fields: Field[];
  acl?: AclConfig | null;
  historyEnabled: boolean;
  notificationConfig?: NotificationConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDefinitionRequest extends Omit<EntityDefinition, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateEntityDefinitionRequest extends Partial<CreateEntityDefinitionRequest> {}
