export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';

export interface FilterCondition {
  field: string;
  op: FilterOperator;
  value: any;
}
