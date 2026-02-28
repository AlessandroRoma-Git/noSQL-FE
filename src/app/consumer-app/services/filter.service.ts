import { Injectable } from '@angular/core';

/**
 * Tipi di operatori supportati dal backend.
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';

/**
 * Singola condizione di filtro.
 */
export interface FilterCondition {
  field: string;
  op: FilterOperator;
  value: any;
}

/**
 * Struttura per filtri complessi (AND/OR).
 * Il backend accetta una lista piatta di filtri (AND implicito) fino a 10 elementi.
 * Per gestire l'OR o logiche più complesse, ci prepariamo alla struttura nidificata.
 */
export interface AdvancedFilterRequest {
  filters: FilterCondition[];
  sorts: { field: string, direction: 'asc' | 'desc' }[];
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  /**
   * Crea un filtro di ricerca testuale (LIKE) su un campo specifico.
   */
  createLikeFilter(field: string, value: string): FilterCondition {
    return { field, op: 'like', value };
  }

  /**
   * Crea un filtro di uguaglianza.
   */
  createEqFilter(field: string, value: any): FilterCondition {
    return { field, op: 'eq', value };
  }

  /**
   * Crea un filtro per range di valori (es: date o numeri).
   */
  createRangeFilter(field: string, from: any, to: any): FilterCondition[] {
    const filters: FilterCondition[] = [];
    if (from) filters.push({ field, op: 'gte', value: from });
    if (to) filters.push({ field, op: 'lte', value: to });
    return filters;
  }
}
