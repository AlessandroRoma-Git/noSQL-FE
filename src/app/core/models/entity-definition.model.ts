
export interface Field {
  name: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'EMAIL' | 'ENUM' | 'REFERENCE';
  required: boolean;
  maxLen?: number;
  pattern?: string;
  min?: number;
  max?: number;
  enumValues?: string[];
  referenceEntityKey?: string; // For REFERENCE type
}

export interface EntityDefinition {
  entityKey: string;
  label: string;
  historyEnabled: boolean; // For record history
  acl: {
    read: { [groupName: string]: boolean };
    write: { [groupName: string]: boolean };
    delete: { [groupName: string]: boolean };
    search: { [groupName: string]: boolean };
  };
  fields: Field[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDefinitionRequest extends Omit<EntityDefinition, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateEntityDefinitionRequest extends Partial<CreateEntityDefinitionRequest> {}
