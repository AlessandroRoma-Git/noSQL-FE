
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

export interface NotificationConfig {
  to: string[];
  subject: string;
  createTemplateId: string | null;
  updateTemplateId: string | null;
  deleteTemplateId: string | null;
}

export interface EntityDefinition {
  entityKey: string;
  label: string;
  historyEnabled: boolean;
  acl: {
    read: { [groupName: string]: boolean };
    write: { [groupName: string]: boolean };
    delete: { [groupName: string]: boolean };
    search: { [groupName: string]: boolean };
  };
  fields: Field[];
  notificationConfig?: NotificationConfig; // Optional
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDefinitionRequest extends Omit<EntityDefinition, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateEntityDefinitionRequest extends Partial<CreateEntityDefinitionRequest> {}
