
export type FieldType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'EMAIL' | 'ENUM';

export interface FieldDefinitionDto {
  name: string;
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  maxLen?: number;
  pattern?: string;
  enumValues?: string[];
}

export interface AclDto {
  read?: string[];
  write?: string[];
  delete?: string[];
  search?: string[];
}

export interface EntityDefinition {
  id: string;
  entityKey: string;
  label: string;
  fields: FieldDefinitionDto[];
  acl: AclDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDefinitionRequest {
  entityKey: string;
  label: string;
  fields: FieldDefinitionDto[];
  acl?: AclDto;
}

export interface UpdateEntityDefinitionRequest {
  label: string;
  fields: FieldDefinitionDto[];
  acl?: AclDto;
}
